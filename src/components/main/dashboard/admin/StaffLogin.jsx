import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography, message } from 'antd';
import { useStaffAuth } from '../../../../Authentication/StaffAuthContext';
import logo from '../../../../assets/logo2.png';
import './Admin_Panel.css';

const { Title, Text } = Typography;

const StaffLogin = () => {
    const { login } = useStaffAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const user = await login(values.email, values.password);
            message.success(`Welcome, ${user.name}`);
            const from = location.state?.from;
            const dest = from && from !== '/admin/login' ? from : '/admin';
            navigate(dest, { replace: true });
        } catch (error) {
            const first = error.response?.data?.errors?.email?.[0];
            message.error(first || error.response?.data?.message || 'Unable to sign in.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="staff-login">
            <Card className="staff-login-card">
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img src={logo} alt="Logo" style={{ height: 72 }} />
                    <Title level={3} style={{ color: '#028f64', marginTop: 12 }}>Staff sign in</Title>
                    <Text type="secondary">For centre coordinators and the bursar</Text>
                </div>
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Students should go back and use their matric number. This page is only for staff email logins."
                />
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input size="large" autoComplete="username" data-testid="staff-email" />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password size="large" autoComplete="current-password" data-testid="staff-password" />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={submitting}
                        style={{ background: '#028f64', borderColor: '#028f64' }}
                        data-testid="staff-signin"
                    >
                        Sign in
                    </Button>
                    <Button type="link" block onClick={() => navigate('/')} style={{ marginTop: 8 }} data-testid="back-to-students">
                        Back to student portal
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default StaffLogin;
