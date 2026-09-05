import React, { useEffect, useState } from 'react';
import {
    Button,
    Form,
    Input,
    Select,
    Switch,
    Table,
    Tag,
    message,
    Space,
} from 'antd';
import staffApi from '../../../../../services/staffApi';
import API_ENDPOINTS from '../../../../../Endpoints/environment';

const { Option } = Select;

const StaffAccounts = () => {
    const [users, setUsers] = useState([]);
    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const role = Form.useWatch('role', form);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const [usersRes, centresRes] = await Promise.all([
                staffApi.get(API_ENDPOINTS.STAFF_USERS),
                staffApi.get(API_ENDPOINTS.STAFF_CENTRES),
            ]);
            setUsers(usersRes.data?.data || []);
            setCentres(centresRes.data?.data || []);
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to load staff accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onCreate = async (values) => {
        try {
            await staffApi.post(API_ENDPOINTS.STAFF_USERS, values);
            message.success('Staff account created.');
            form.resetFields();
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to create account.');
        }
    };

    const toggleActive = async (record, is_active) => {
        try {
            await staffApi.put(`${API_ENDPOINTS.STAFF_USERS}/${record.id}`, {
                name: record.name,
                email: record.email,
                role: record.role,
                study_centre: record.study_centre,
                is_active,
            });
            message.success('Account updated.');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to update account.');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Role', dataIndex: 'role', key: 'role' },
        { title: 'Centre', dataIndex: 'study_centre', key: 'study_centre', render: (v) => v || '—' },
        {
            title: 'Active',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active, record) => (
                <Switch checked={active} onChange={(checked) => toggleActive(record, checked)} />
            ),
        },
    ];

    return (
        <div>
            <h2 className="staff-page-title">Staff logins</h2>
            <p className="staff-page-lead">Create centre coordinators and bursar accounts. Passwords are not shown after save.</p>

            <Form
                form={form}
                layout="vertical"
                onFinish={onCreate}
                className="staff-card"
                style={{ maxWidth: 560, margin: '0 0 24px' }}
            >
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                    <Select>
                        <Option value="centre_coordinator">Centre coordinator</Option>
                        <Option value="bursar">Bursar</Option>
                        <Option value="super_admin">Super admin</Option>
                    </Select>
                </Form.Item>
                {role === 'centre_coordinator' && (
                    <Form.Item name="study_centre" label="Study centre" rules={[{ required: true }]}>
                        <Select showSearch>
                            {centres.map((c) => (
                                <Option key={c} value={c}>{c}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                <Button type="primary" htmlType="submit" style={{ background: '#028f64', borderColor: '#028f64' }}>
                    Create account
                </Button>
            </Form>

            <div className="staff-card" style={{ overflowX: 'auto' }}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 720 }}
                />
            </div>
        </div>
    );
};

export default StaffAccounts;
