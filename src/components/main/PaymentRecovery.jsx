import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Steps, Typography, Row, Col, Select,
  DatePicker, Upload, Alert, Spin, Result, Divider, ConfigProvider, message,
} from 'antd';
import {
  CheckCircleOutlined, WarningOutlined, ArrowLeftOutlined,
  CloudUploadOutlined, FileFilled, LoadingOutlined, UploadOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo2.png';
import API_ENDPOINTS from '../../Endpoints/environment';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Constants ────────────────────────────────────────────────────────────────

const EXPECTED_AMOUNTS = {
  registration_fees:    400000,
  acceptance_fees:      300000,
  complete_school_fees: 4000000,
  partial_school_fees:  2400000,
  school_fees_completion: 1600000,
};

const SCHOOL_FEE_TYPES = ['complete_school_fees', 'partial_school_fees', 'school_fees_completion'];

const schoolsData = {
  'School of Sciences': [
    'Mathematics / Geography', 'Maths / Economics', 'Maths / Biology',
    'Maths / Computer Science', 'Maths / Special Education', 'Biology / Inter Science',
    'Integrated Sciences (Double Major)', 'Biology / Geography', 'PHE (Double Major)',
    'Biology / Special Education',
  ],
  'School of Technical Education': [
    'Technical Education Double Major', 'Electrical / Electronics', 'Automobile',
    'Building', 'Wood Work', 'Metal Work',
  ],
  'School of Arts and Social Sciences': [
    'Geography / History', 'Geography / Economics', 'Geography / Social Studies',
    'History / CRS', 'History / Islamic Studies', 'Social Studies / Economics',
    'Social Studies / CRS', 'Social Studies / Islamic Studies',
    'Islamic Studies / Special Education', 'Eco / Special Education',
    'CRS / Special Education', 'History / Special Education',
  ],
  'School of Education': [
    'Primary Education Studies (Double Major)', 'Early Childhood Care Education (Double Major)',
  ],
  'School of Languages': [
    'English / History', 'English / CRS', 'English / Arabic', 'English / Hausa',
    'English / Social Studies', 'Hausa / Islamic Studies', 'Hausa / Arabic',
    'Hausa / Social Studies', 'Arabic / Islamic Studies', 'English / Islamic Studies',
    'Arabic / Social Studies', 'English / Special Education', 'Hausa / Special Education',
  ],
  'School of Vocational Education': [
    'Agricultural Science Education (Double Major)', 'Home Economics (Double Major)',
    'Business Education (Double Major)',
  ],
};

const EXAM_TYPES = [
  { id: 1, exam_type: 'WAEC' },
  { id: 3, exam_type: 'NECO' },
  { id: 6, exam_type: 'NABTEB' },
  { id: 7, exam_type: 'GRADE_II_TEACHERS_CERT.' },
  { id: 8, exam_type: 'NBAIS' },
];

const GRADES = {
  WAEC:   ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'A.R'],
  NECO:   ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'A.R'],
  NABTEB: ['A1', 'A2', 'A3', 'C4', 'C5', 'C6', 'A.R'],
  GRADE_II_TEACHERS_CERT: ['A', 'B', 'C', 'D', 'A.R'],
  NBAIS:  ['A', 'B2', 'B3', 'C5', 'C6', 'A.R'],
};

const CENTRES = [
  'suleja', 'Rijau', 'Gulu', 'New Bussa', 'Mokwa', 'Kagara', 'Salka',
  'Kontogora', 'Gawu', 'Doko', 'Katcha', 'Bida', 'Patigi', 'Pandogari', 'Agaie',
];

// ── Component ─────────────────────────────────────────────────────────────────

const PaymentRecovery = () => {
  const navigate = useNavigate();
  const [entryForm] = Form.useForm();
  const [regForm] = Form.useForm();

  // view states: 'entry' | 'processing' | 'reg_form' | 'auto_resolved' | 'error'
  const [view, setView] = useState('entry');
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvedMsg, setResolvedMsg] = useState('');
  const [resolvedId, setResolvedId] = useState(null);
  const [resolvedPayType, setResolvedPayType] = useState('');
  const [verifiedRef, setVerifiedRef] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [regStep, setRegStep] = useState(0); // 0=personal, 1=school, 2=education
  const [firstStep, setFirstStep] = useState({});
  const [secondStep, setSecondStep] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // file uploads
  const [passport, setPassport] = useState('');
  const [uploadedOl1, setUploadedOl1] = useState('');
  const [nin, setNin] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // dropdowns
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);

  // Load states + available subjects on mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await fetch('https://nga-states-lga.onrender.com/fetch');
        setStates(await res.json());
      } catch { /* ignore */ }
      finally { setLoadingStates(false); }
    };
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/course-data`);
        setSubjects(res.data || []);
      } catch { /* ignore */ }
    };
    fetchStates();
    fetchSubjects();
  }, []);

  // Try to restore sessionStorage data from a previous registration attempt
  useEffect(() => {
    try {
      const s1 = sessionStorage.getItem('reg_step1');
      const s2 = sessionStorage.getItem('reg_step2');
      if (s1) setFirstStep(JSON.parse(s1));
      if (s2) setSecondStep(JSON.parse(s2));
    } catch { /* ignore */ }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getLGAs = async (state) => {
    setLoadingLgas(true);
    try {
      const res = await fetch(`https://nga-states-lga.onrender.com/?state=${state}`);
      setLgas(await res.json());
    } catch { /* ignore */ }
    finally { setLoadingLgas(false); }
  };

  const uploadProps = (setter, type) => ({
    name: 'file',
    multiple: false,
    action: API_ENDPOINTS.UPLOAD,
    onChange(info) {
      const { status } = info.file;
      if (status === 'uploading') { setUploading(true); }
      else if (status === 'done') {
        setUploading(false);
        const fileName = info.file.response.data;
        if (type === 'passport') { setPassport(fileName); setImageUrl(`${API_ENDPOINTS.IMAGE}/${fileName}`); }
        else if (type === 'olevel') { setUploadedOl1(fileName); }
        else if (type === 'nin') { setNin(fileName); }
        message.success(`${info.file.name} uploaded successfully.`);
      } else if (status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} upload failed.`);
      }
    },
  });

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
        await handleSchoolFeeRecovery(studentId, pay_type);
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

  const handleSchoolFeeRecovery = async (studentId, payType) => {
    try {
      const updateData = {};
      if (payType === 'complete_school_fees') {
        updateData.has_paid = true;
        updateData.course_paid = true;
      } else if (payType === 'partial_school_fees') {
        updateData.has_paid = true;
      } else if (payType === 'school_fees_completion') {
        updateData.course_paid = true;
      }
      await axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${studentId}`, updateData);
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

      if (user && !user.educational_detail) {
        // Personal record exists but education details missing — submit missing steps
        setSubmitting(true);
        try {
          const educationValues = regForm.getFieldsValue();
          if (Object.keys(educationValues).some(k => educationValues[k])) {
            const educationFormData = { ...educationValues, application_number: user.id };
            await axios.post(API_ENDPOINTS.EDUCATIONALS_APPLICATION, educationFormData);
            navigate(`/registration/${user.id}/success`);
            return;
          }
        } catch { /* fall through to show form */ }
        finally { setSubmitting(false); }
        // If we can't auto-complete, show the form starting from step 3
        setRegStep(2);
        setView('reg_form');
        return;
      }

      // No record at all — show full 3-step form
      setRegStep(0);
      setView('reg_form');

    } catch (err) {
      if (err.response?.status === 404) {
        // No record found — show fresh form
        setRegStep(0);
        setView('reg_form');
      } else {
        setErrorMsg('Could not check your registration status. Please try again.');
        setView('error');
      }
    }
  };

  // ── Registration form submission ──────────────────────────────────────────

  const onRegFormFinish = async (values) => {
    if (regStep === 0) {
      setFirstStep(values);
      sessionStorage.setItem('reg_step1', JSON.stringify(values));
      setRegStep(1);
      window.scrollTo(0, 0);
    } else if (regStep === 1) {
      setSecondStep(values);
      sessionStorage.setItem('reg_step2', JSON.stringify(values));
      setRegStep(2);
      window.scrollTo(0, 0);
    } else if (regStep === 2) {
      await submitAllSteps(values);
    }
  };

  const submitAllSteps = async (thirdStepValues) => {
    setSubmitting(true);
    try {
      const personalFormData = {
        ...firstStep,
        application_number: `${thirdStepValues.exam_year}${thirdStepValues.exam_number}`,
        date_of_birth: firstStep.date_of_birth?.format
          ? firstStep.date_of_birth.format('YYYY-MM-DD')
          : firstStep.date_of_birth,
        application_reference: verifiedRef,
        passport,
        olevel1: uploadedOl1,
        nin,
      };
      const personalRes = await axios.post(API_ENDPOINTS.PERSONAL_DETAILS, personalFormData);
      const newId = personalRes.data.id;

      const schoolFormData = {
        ...secondStep,
        application_number: newId,
        p_school_from_1: secondStep.p_school_from_1?.format?.('YYYY-MM-DD') || secondStep.p_school_from_1,
        p_school_to_1:   secondStep.p_school_to_1?.format?.('YYYY-MM-DD')   || secondStep.p_school_to_1,
        p_school_from_2: secondStep.p_school_from_2?.format?.('YYYY-MM-DD') || secondStep.p_school_from_2,
        p_school_to_2:   secondStep.p_school_to_2?.format?.('YYYY-MM-DD')   || secondStep.p_school_to_2,
        s_school_from_1: secondStep.s_school_from_1?.format?.('YYYY-MM-DD') || secondStep.s_school_from_1,
        s_school_to_1:   secondStep.s_school_to_1?.format?.('YYYY-MM-DD')   || secondStep.s_school_to_1,
        s_school_from_2: secondStep.s_school_from_2?.format?.('YYYY-MM-DD') || secondStep.s_school_from_2,
        s_school_to_2:   secondStep.s_school_to_2?.format?.('YYYY-MM-DD')   || secondStep.s_school_to_2,
      };
      await axios.post(API_ENDPOINTS.SCHOOL_DETAILS, schoolFormData);

      const educationFormData = { ...thirdStepValues, application_number: newId };
      await axios.post(API_ENDPOINTS.EDUCATIONALS_APPLICATION, educationFormData);

      sessionStorage.removeItem('reg_step1');
      sessionStorage.removeItem('reg_step2');
      sessionStorage.removeItem('reg_step3');

      navigate(`/registration/${newId}/success`);
    } catch (err) {
      message.error('An error occurred while submitting your registration. Please try again.');
    } finally {
      setSubmitting(false);
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
    const stepItems = [
      { title: 'Personal Particulars', status: regStep === 0 ? 'process' : regStep > 0 ? 'finish' : 'wait' },
      { title: 'School Details',       status: regStep === 1 ? 'process' : regStep > 1 ? 'finish' : 'wait' },
      { title: 'Exam Qualifications',  status: regStep === 2 ? 'process' : 'wait' },
    ];

    return (
      <div>
        <ConfigProvider theme={{ token: { colorPrimary: '#028f64', borderRadius: 2, colorText: '#028f64', colorBgContainer: '#f6ffed' } }}>
          <Steps items={stepItems} style={{ marginBottom: 24 }} responsive />
        </ConfigProvider>

        <Alert
          message="Payment Verified"
          description={`Your registration fee payment (ref: ${verifiedRef}) has been confirmed. Please complete your details below — no payment is required.`}
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={regForm} layout="vertical" onFinish={onRegFormFinish}>

          {/* ── Step 0: Personal Particulars ── */}
          {regStep === 0 && (
            <div>
              <Title level={4}>Personal Particulars</Title>

              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                {imageUrl && <img src={imageUrl} alt="passport" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                <div>
                  <Upload {...uploadProps(setPassport, 'passport')} showUploadList={false} accept="image/*">
                    <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Passport'}
                    </Button>
                  </Upload>
                </div>
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="surname" label="Surname" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="other_names" label="Other Names" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="marital_status" label="Marital Status" rules={[{ required: true }]}>
                    <Select><Option value="single">Single</Option><Option value="married">Married</Option></Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="date_of_birth" label="Date of Birth" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}><Input /></Form.Item>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="state_of_origin" label="State of Origin" rules={[{ required: true }]}>
                    <Select placeholder="Select State" loading={loadingStates} onChange={v => { setSelectedState(v); getLGAs(v); }}>
                      {states.map(s => <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="local_government" label="Local Government" rules={[{ required: true }]}>
                    <Select placeholder="Select LGA" disabled={!selectedState} loading={loadingLgas}>
                      {lgas.map(l => <Option key={l} value={l}>{l}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="ethnic_group" label="Ethnic Group" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="religion" label="Religion" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="phone_number" label="Phone Number" initialValue={verifiedPhone} rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="name_of_father" label="Name of Father" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="father_state_of_origin" label="Father's State of Origin" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="father_place_of_birth" label="Father's Place of Birth" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="mother_place_of_birth" label="Mother's Place of Birth" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="mother_state_of_origin" label="Mother's State of Origin" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="applicant_occupation" label="Occupation" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="working_experience" label="Working Experience" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="desired_study_cent" label="Centre Location" rules={[{ required: true }]}>
                    <Select placeholder="Select Centre">
                      {CENTRES.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* ── Step 1: School Details ── */}
          {regStep === 1 && (
            <div>
              <Title level={4}>School Details</Title>
              <Title level={5}>Primary School Attended</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}><Form.Item name="p_school_name_1" label="School Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="p_school_from_1" label="From" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="p_school_to_1" label="To" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}><Form.Item name="p_school_name_2" label="School Name (2nd)"><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="p_school_from_2" label="From"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="p_school_to_2" label="To"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
              <Title level={5} style={{ marginTop: 16 }}>Secondary School Attended</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}><Form.Item name="s_school_name_1" label="School Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="s_school_from_1" label="From" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="s_school_to_1" label="To" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}><Form.Item name="s_school_name_2" label="School Name (2nd)"><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="s_school_from_2" label="From"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="s_school_to_2" label="To"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
              <Divider />
              <Title level={5}>First Choice Programme</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="first_school" label="School" rules={[{ required: true }]}>
                    <Select placeholder="Select School" onChange={v => setSelectedSchool(v)} allowClear>
                      {Object.keys(schoolsData).map(s => <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="first_course" label="Course" rules={[{ required: true }]}>
                    <Select placeholder="Select Course" disabled={!selectedSchool} allowClear>
                      {(schoolsData[selectedSchool] || []).map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Title level={5}>Second Choice Programme</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="second_school" label="School" rules={[{ required: true }]}>
                    <Select placeholder="Select School" onChange={v => setSelectedSchool(v)} allowClear>
                      {Object.keys(schoolsData).map(s => <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="second_course" label="Course" rules={[{ required: true }]}>
                    <Select placeholder="Select Course" disabled={!selectedSchool} allowClear>
                      {(schoolsData[selectedSchool] || []).map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* ── Step 2: Educational Qualifications ── */}
          {regStep === 2 && (
            <div>
              <Title level={4}>Educational Qualifications</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                  <Form.Item name="exam_type" label="Exam Type" rules={[{ required: true }]}>
                    <Select placeholder="Select Type" onChange={v => setSelectedExamType(v)}>
                      {EXAM_TYPES.map(e => <Option key={e.id} value={e.exam_type}>{e.exam_type}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="exam_number" label="Exam Number" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="exam_month" label="Exam Month" rules={[{ required: true }]}>
                    <Select placeholder="Select Month">
                      {['JUN/JUL', 'May/Jun', 'Oct/Nov', 'Nov/Dec'].map(m => <Option key={m} value={m}>{m}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="exam_year" label="Exam Year" rules={[{ required: true }]}><Input /></Form.Item>
                </Col>
              </Row>

              <Upload {...uploadProps(setUploadedOl1, 'olevel')} style={{ width: '100%' }}>
                <Button icon={<CloudUploadOutlined />} style={{ width: '100%', marginBottom: 16 }}>Upload O-Level Result</Button>
              </Upload>
              <Upload {...uploadProps(setNin, 'nin')} style={{ width: '100%' }}>
                <Button icon={<FileFilled />} style={{ width: '100%', marginBottom: 16 }}>Upload NIN Slip</Button>
              </Upload>

              {[...Array(9)].map((_, i) => (
                <Row gutter={[16, 16]} key={i}>
                  <Col xs={24} md={12}>
                    <Form.Item name={`subject_${i + 1}`} label={`Subject ${i + 1}`} rules={[{ required: i < 5 }]}>
                      <Select placeholder="Select Subject">
                        {subjects.map(s => <Option key={s.id} value={s.course}>{s.course}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={`grade_${i + 1}`} label={`Grade ${i + 1}`} rules={[{ required: i < 5 }]}>
                      <Select placeholder="Select Grade" disabled={!selectedExamType}>
                        {(GRADES[selectedExamType] || []).map(g => <Option key={g} value={g}>{g}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            {regStep > 0 && (
              <Col>
                <Button icon={<ArrowLeftOutlined />} onClick={() => setRegStep(s => s - 1)}>Back</Button>
              </Col>
            )}
            <Col flex="auto">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                style={{ background: '#028f64', borderColor: '#028f64' }}
              >
                {regStep < 2 ? 'Next' : 'Submit Registration'}
              </Button>
            </Col>
          </Row>
        </Form>
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
