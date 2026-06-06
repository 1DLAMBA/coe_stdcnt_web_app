import React, { useState } from 'react';
import {
  Form, Input, Button, Card, Alert, Spin, Result, Typography,
} from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo2.png';
import API_ENDPOINTS from '../../Endpoints/environment';
import {
  isLastSessionFeeOnBackup,
  syncBackupSchoolFeesAfterPayment,
} from '../../services/schoolFeesService';
import Registration from './Registration';

const { Title, Text } = Typography;

// ── Constants ────────────────────────────────────────────────────────────────

const EXPECTED_AMOUNTS = {
  registration_fees:    400000,
  acceptance_fees:      300000,
  complete_school_fees: 4000000,
  partial_school_fees:  2400000,
  school_fees_completion: 1600000,
};

const SCHOOL_FEE_TYPES = ['complete_school_fees', 'partial_school_fees', 'school_fees_completion'];

const ALLOWED_FEE_SESSIONS = ['2024/2025', '2025/2026'];

// ── Component ─────────────────────────────────────────────────────────────────

const PaymentRecovery = () => {
  const navigate = useNavigate();
  const [entryForm] = Form.useForm();

  // view states: 'entry' | 'processing' | 'reg_form' | 'auto_resolved' | 'error'
  const [view, setView] = useState('entry');
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvedMsg, setResolvedMsg] = useState('');
  const [resolvedId, setResolvedId] = useState(null);
  const [resolvedPayType, setResolvedPayType] = useState('');
  const [verifiedRef, setVerifiedRef] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  // ── Step 1: Validate reference with Paystack ─────────────────────────────

  const handleVerify = async (values) => {
    setView('processing');
    try {
      const res = await axios.get(`${API_ENDPOINTS.VERIFY_PAYSTACK}/${values.reference}`);
      const txData = res.data?.data;

      if (!txData || txData.status !== 'success') {
        setErrorMsg('This reference does not correspond to a successful payment. Please check and try again.');
        setView('error');
        return;
      }

      const { pay_type, phone: paidPhone } = txData.metadata || {};
      const amount = txData.amount;

      // Validate pay_type is one we handle
      if (!pay_type || !(pay_type in EXPECTED_AMOUNTS)) {
        setErrorMsg('This payment reference is not associated with any known payment type on this portal.');
        setView('error');
        return;
      }

      // Validate amount matches the expected amount for the pay_type
      if (amount !== EXPECTED_AMOUNTS[pay_type]) {
        setErrorMsg(`The amount for this reference does not match what is expected for a ${pay_type.replace(/_/g, ' ')} payment.`);
        setView('error');
        return;
      }

      // Phone guard for registration_fees — anti-bypass check
      if (pay_type === 'registration_fees') {
        if (!values.phone || paidPhone !== values.phone) {
          setErrorMsg('The phone number you entered does not match the one used when this payment was made. Please enter the exact phone number used during registration.');
          setView('error');
          return;
        }
        setVerifiedRef(values.reference);
        setVerifiedPhone(values.phone);
        await handleRegistrationRecovery(values.phone, values.reference);
        return;
      }

      // For school/acceptance fees — auto-resolve
      const studentId = txData.metadata?.id;
      if (!studentId) {
        setErrorMsg('This payment reference is missing student information. Please contact support.');
        setView('error');
        return;
      }

      setVerifiedRef(values.reference);
      setResolvedPayType(pay_type);

      if (pay_type === 'acceptance_fees') {
        await handleAcceptanceFeeRecovery(studentId, values.reference);
      } else if (SCHOOL_FEE_TYPES.includes(pay_type)) {
        const rawFeeSession = txData.metadata?.fee_session;
        const feeSession = ALLOWED_FEE_SESSIONS.includes(rawFeeSession) ? rawFeeSession : null;
        await handleSchoolFeeRecovery(studentId, pay_type, feeSession, values.reference);
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify payment. Please try again.';
      setErrorMsg(msg);
      setView('error');
    }
  };

  // ── Acceptance fee recovery ───────────────────────────────────────────────

  const handleAcceptanceFeeRecovery = async (studentId, reference) => {
    try {
      await axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${studentId}`, {
        application_reference: reference,
        application_date: new Date().toISOString().split('T')[0],
      });
      setResolvedId(studentId);
      setResolvedMsg('Your acceptance fee payment has been verified and your matric number has been assigned.');
      setView('auto_resolved');
    } catch (err) {
      setErrorMsg('Payment verified but we could not update your record. Please contact support with your reference.');
      setView('error');
    }
  };

  // ── School fee recovery ───────────────────────────────────────────────────

  const handleSchoolFeeRecovery = async (studentId, payType, feeSession = null, reference = null) => {
    try {
      let backup = null;
      const backupBase = API_ENDPOINTS.PERSONAL_DETAILS_BACKUP;
      if (backupBase) {
        try {
          const res = await axios.get(`${backupBase}/${studentId}`);
          backup = res.data;
        } catch {
          backup = null;
        }
      }

      if (isLastSessionFeeOnBackup(feeSession, backup) && reference) {
        await syncBackupSchoolFeesAfterPayment(studentId, payType, feeSession, reference);
      } else {
        const updateData = {};
        if (payType === 'complete_school_fees') {
          updateData.has_paid = true;
          updateData.course_paid = true;
        } else if (payType === 'partial_school_fees') {
          updateData.has_paid = true;
        } else if (payType === 'school_fees_completion') {
          updateData.has_paid = true;
          updateData.course_paid = true;
        }
        if (feeSession) {
          updateData.fee_academic_session = feeSession;
        }
        await axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${studentId}`, updateData);
        if (feeSession && reference) {
          await syncBackupSchoolFeesAfterPayment(studentId, payType, feeSession, reference);
        }
      }
      setResolvedId(studentId);
      setResolvedMsg('Your school fees payment has been verified and your account has been updated.');
      setView('auto_resolved');
    } catch (err) {
      setErrorMsg('Payment verified but we could not update your record. Please contact support with your reference.');
      setView('error');
    }
  };

  // ── Registration fee recovery ─────────────────────────────────────────────

  const handleRegistrationRecovery = async (phone, reference) => {
    try {
      const checkRes = await axios.post(`${API_ENDPOINTS.API_BASE_URL}/check`, { phoneNumber: phone });
      const user = checkRes.data?.user;

      if (user && user.educational_detail) {
        // Already fully registered — redirect to success
        navigate(`/registration/${user.id}/success`);
        return;
      }

      // Partial or no record — show full Registration form (payment skipped via recoveredReference)
      setView('reg_form');

    } catch (err) {
      if (err.response?.status === 404) {
        setView('reg_form');
      } else {
        setErrorMsg('Could not check your registration status. Please try again.');
        setView('error');
      }
    }
  };

  // ── Views ─────────────────────────────────────────────────────────────────

  const renderEntry = () => (
    <Card
      style={{ maxWidth: 500, margin: '0 auto', borderRadius: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      title={<Title level={4} style={{ color: '#028f64', margin: 0 }}>Verify / Recover Payment</Title>}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Enter your Paystack payment reference. The system will automatically detect your payment type and resolve any issues.
      </Text>
      <Form form={entryForm} layout="vertical" onFinish={handleVerify}>
        <Form.Item
          name="reference"
          label="Transaction Reference"
          rules={[{ required: true, message: 'Please enter your payment reference' }, { min: 8, message: 'Reference must be at least 8 characters' }]}
        >
          <Input placeholder="e.g. T693847201" size="large" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number Used During Payment"
          extra="Required for registration fee recovery only — leave blank for school/acceptance fees if unknown."
        >
          <Input placeholder="e.g. 08012345678" size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block size="large" style={{ background: '#028f64', borderColor: '#028f64' }}>
          Verify Payment
        </Button>
      </Form>
    </Card>
  );

  const renderProcessing = () => (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <Spin size="large" tip="Verifying your payment with Paystack..." />
    </div>
  );

  const renderError = () => (
    <Card style={{ maxWidth: 500, margin: '0 auto', borderRadius: 10 }}>
      <Result
        status="error"
        icon={<WarningOutlined style={{ color: '#ff4d4f' }} />}
        title="Verification Failed"
        subTitle={errorMsg}
        extra={[
          <Button key="retry" type="primary" style={{ background: '#028f64', borderColor: '#028f64' }} onClick={() => { setView('entry'); entryForm.resetFields(); }}>
            Try Again
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>Back to Portal</Button>,
        ]}
      />
    </Card>
  );

  const renderAutoResolved = () => (
    <Card style={{ maxWidth: 500, margin: '0 auto', borderRadius: 10 }}>
      <Result
        icon={<CheckCircleOutlined style={{ color: '#028f64' }} />}
        title="Payment Verified & Applied"
        subTitle={resolvedMsg}
        extra={resolvedId ? [
          <Button key="dashboard" type="primary" style={{ background: '#028f64', borderColor: '#028f64' }} onClick={() => navigate(`/dashboard/${resolvedId}`)}>
            Go to Dashboard
          </Button>,
        ] : [
          <Button key="home" onClick={() => navigate('/')}>Back to Portal</Button>,
        ]}
      />
    </Card>
  );

  const renderRegForm = () => {
    return (
      <div>
        <Alert
          message="Payment Verified"
          description={`Your registration fee payment (ref: ${verifiedRef}) has been confirmed. Please complete your details below — no payment is required.`}
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Registration recoveredReference={verifiedRef} />
      </div>
    );
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={logo} alt="Logo" style={{ width: 70, marginBottom: 12 }} />
          <Title level={3} style={{ color: '#028f64', margin: 0 }}>College of Education Study Centre</Title>
          <Text type="secondary">Payment Verification & Recovery Portal</Text>
        </div>

        {view === 'entry'         && renderEntry()}
        {view === 'processing'    && renderProcessing()}
        {view === 'error'         && renderError()}
        {view === 'auto_resolved' && renderAutoResolved()}
        {view === 'reg_form'      && renderRegForm()}

        {view !== 'processing' && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="link" onClick={() => navigate('/')} style={{ color: '#028f64' }}>
              ← Back to Portal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentRecovery;
