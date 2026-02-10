import React, { useEffect, useState, useCallback } from "react";
import { UserOutlined, EyeOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { Card, Col, ConfigProvider, Table, Input, Select, Spin, Row, Button, Space, Modal, Tag, Form, message } from 'antd';
import axios from "axios";
import API_ENDPOINTS from "../../../../Endpoints/environment";
import '../admin/admin-pages/styles/application.css';

const { Search } = Input;
const { Option } = Select;

const styles = {
    container: {
        paddingLeft: '5%',
        paddingRight: '5%',
    },
    card: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    searchContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
    },
    '@media (min-width: 768px)': {
        searchContainer: {
            flexDirection: 'row',
        }
    },
    modalContent: {
        maxHeight: '70vh',
        overflowY: 'auto',
    },
};

const centers = ['Salka', 'Mokwa', 'suleja', 'Kagara', 'New Bussa', 'Gulu', 'Gawu', 'Doko', 'Katcha', 'Rijau', 'Kontogora', 'Bida', 'Patigi', 'Pandogari', 'Agaie'];

export const StudentList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [search, setSearch] = useState("");
    const [selectedCenter, setSelectedCenter] = useState("");
    const [centerPassword, setCenterPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    const fetchStudents = useCallback(async (page, searchValue) => {
        if (!isAuthenticated || !selectedCenter) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/personal-details-paged`, {
                params: {
                    page,
                    search: searchValue,
                    study_cent: selectedCenter,
                    type: null,
                },
            });

            setData(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
            }));
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, selectedCenter]);

    useEffect(() => {
        if (isAuthenticated && selectedCenter) {
            fetchStudents(1, search);
            setPagination(prev => ({ ...prev, current: 1 }));
        }
    }, [search, isAuthenticated, selectedCenter, fetchStudents]);

    const handleTableChange = (newPagination) => {
        setPagination({ ...newPagination });
        fetchStudents(newPagination.current, search);
    };

    const handleSearch = (value) => {
        setSearch(value);
    };

    const validatePassword = (center, password) => {
        const expectedPassword = center.toLowerCase() + "11";
        const defaultPassword = "admin11";
        return password === expectedPassword || password === defaultPassword;
    };

    const handleCenterChange = (value) => {
        setSelectedCenter(value);
    };

    const handlePasswordChange = (e) => {
        setCenterPassword(e.target.value);
    };

    const handleAuthentication = async (values) => {
        const passwordToValidate = values?.password || centerPassword;
        const centerToValidate = values?.center || selectedCenter;
        
        if (!centerToValidate || !passwordToValidate) {
            message.error("Please select a center and enter password");
            return;
        }

        setAuthLoading(true);
        try {
            if (validatePassword(centerToValidate, passwordToValidate)) {
                // Update the parent state with the final password
                setCenterPassword(passwordToValidate);
                setSelectedCenter(centerToValidate);
                
                // Small delay to ensure smooth transition
                setTimeout(() => {
                    setIsAuthenticated(true);
                    message.success(`Successfully authenticated for ${centerToValidate} center`);
                }, 100);
            } else {
                message.error("Invalid password for selected center");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            message.error("Authentication failed. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    const viewStudent = (student) => {
        setSelectedStudent(student);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "other_names",
            key: "other_names",
        },
        {
            title: "Application/ Matric Number",
            dataIndex: "application_number",
            key: "application_number",
        },
        {
            title: "Course",
            dataIndex: "course",
            key: "course",
        },
        {
            title: "Study Center",
            dataIndex: "desired_study_cent",
            key: "desired_study_cent",
        },
        {
            title: "Payment Status",
            key: "payment_status",
            render: (_, record) => (
                <span>
                    {record.course_paid === "1" ? (
                        <Tag color="green">Full Payment</Tag>
                    ) : record.has_paid === "1" ? (
                        <Tag color="blue">Partial Payment</Tag>
                    ) : (
                        <Tag color="red">No Payment</Tag>
                    )}
                </span>
            ),
        },
        {
            title: "Admission Status",
            dataIndex: "has_admission",
            key: "has_admission",
            render: (has_admission) => (
                <span>
                    {has_admission ? (
                        <Tag color="green">Approved</Tag>
                    ) : (
                        <Tag color="red">Not Approved</Tag>
                    )}
                </span>
            ),
        },
        {
            title: "View",
            dataIndex: "id",
            key: "id",
            render: (id, record) => (
                <Button 
                    icon={<EyeOutlined/>} 
                    borderRadius={10} 
                    type="primary" 
                    onClick={() => viewStudent(record)}
                >
                    View
                </Button>
            ),
        },
    ];

    const StudentDetailModal = () => {
        if (!selectedStudent) return null;

        return (
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Student Details</span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setSelectedStudent(null);
                }}
                footer={null}
                width={800}
                centered
            >
                <div style={styles.modalContent}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card size="small" title="Personal Information">
                                <p><strong>Name:</strong> {selectedStudent.other_names}</p>
                                <p><strong>Application Number:</strong> {selectedStudent.application_number}</p>
                                <p><strong>Matric Number:</strong> {selectedStudent.matric_number || 'Not assigned'}</p>
                                <p><strong>Phone:</strong> {selectedStudent.phone_number || 'Not provided'}</p>
                                <p><strong>Email:</strong> {selectedStudent.email || 'Not provided'}</p>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Academic Information">
                                <p><strong>Course:</strong> {selectedStudent.course}</p>
                                <p><strong>Study Center:</strong> {selectedStudent.desired_study_cent}</p>
                                <p><strong>School:</strong> {selectedStudent.first_school || 'Not specified'}</p>
                                <p><strong>Admission Status:</strong> 
                                    {selectedStudent.has_admission ? (
                                        <Tag color="green" style={{ marginLeft: '8px' }}>Approved</Tag>
                                    ) : (
                                        <Tag color="red" style={{ marginLeft: '8px' }}>Not Approved</Tag>
                                    )}
                                </p>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card size="small" title="Payment Information">
                                <Row gutter={[16, 16]}>
                                    <Col span={8}>
                                        <p><strong>Payment Status:</strong></p>
                                        {selectedStudent.course_paid === "1" ? (
                                            <Tag color="green">Full Payment</Tag>
                                        ) : selectedStudent.has_paid === "1" ? (
                                            <Tag color="blue">Partial Payment</Tag>
                                        ) : (
                                            <Tag color="red">No Payment</Tag>
                                        )}
                                    </Col>
                                    <Col span={8}>
                                        <p><strong>Has Paid:</strong> {selectedStudent.has_paid === "1" ? 'Yes' : 'No'}</p>
                                    </Col>
                                    <Col span={8}>
                                        <p><strong>Course Paid:</strong> {selectedStudent.course_paid === "1" ? 'Yes' : 'No'}</p>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    };

    // Memoized Password Input to prevent re-renders
    const PasswordInput = React.memo(({ value, onChange, onBlur }) => (
        <Input.Password
            placeholder="Enter center password"
            size="large"
            prefix={<LockOutlined />}
            autoComplete="current-password"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    ));

    const AuthenticationCard = () => {
        const [form] = Form.useForm();
        const [localPassword, setLocalPassword] = React.useState(centerPassword);
        
        // Handle password blur to sync with parent state
        const handlePasswordBlur = React.useCallback(() => {
            if (localPassword !== centerPassword) {
                setCenterPassword(localPassword);
                form.setFieldsValue({ password: localPassword });
            }
        }, [localPassword, centerPassword, form]);

        // Handle password change locally
        const handlePasswordChange = React.useCallback((e) => {
            setLocalPassword(e.target.value);
        }, []);

        // Initialize form values when center or password changes
        // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedCenter/centerPassword from parent; effect intentionally syncs form when they change
        React.useEffect(() => {
            form.setFieldsValue({
                center: selectedCenter,
                password: centerPassword,
                username: 'center_auth'
            });
            setLocalPassword(centerPassword);
        }, [form, selectedCenter, centerPassword]);

        // Handle form value changes
        const onValuesChange = React.useCallback((changedValues) => {
            if ('center' in changedValues) {
                setSelectedCenter(changedValues.center);
            }
        }, []);

        return (
            <Card 
                title={
                    <Space>
                        <LockOutlined />
                        <span>Center Authentication Required</span>
                    </Space>
                }
                style={{ 
                    maxWidth: 500, 
                    margin: '40px auto',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
            >
                <Form 
                    form={form}
                    layout="vertical" 
                    onFinish={(values) => {
                        // Ensure we have the latest values before submission
                        const formValues = form.getFieldsValue(true);
                        handleAuthentication(formValues);
                    }}
                    onValuesChange={onValuesChange}
                    initialValues={{
                        center: selectedCenter,
                        password: centerPassword,
                        username: 'center_auth',
                        remember: true
                    }}
                >
                    {/* Hidden username field for accessibility */}
                    <div style={{ display: 'none' }}>
                        <Form.Item name="username" noStyle>
                            <input type="text" autoComplete="username" />
                        </Form.Item>
                    </div>
                    
                    <Form.Item
                        label="Select Study Center"
                        name="center"
                        rules={[{ required: true, message: 'Please select a study center' }]}
                    >
                        <Select
                            placeholder="Select your study center"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {centers.map((center) => (
                                <Option key={center} value={center}>
                                    {center}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Center Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter the password' }]}
                    >
                        <PasswordInput 
                            value={localPassword}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={authLoading}
                            block
                            size="large"
                            style={{
                                backgroundColor: '#028f64',
                                borderColor: '#028f64',
                                height: '42px'
                            }}
                        >
                            {authLoading ? 'Authenticating...' : 'Authenticate'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        );
    };

    return (
        <div style={styles.container}>
            {!isAuthenticated ? (
                <AuthenticationCard />
            ) : (
                <Card style={{ ...styles.card, marginTop: '16px' }}>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: '#028f64',
                                borderRadius: 2,
                                margin: '20px',
                                colorBgContainer: '#f6ffed',
                            },
                        }}
                    >
                        <div className="table-header-section">
                            <div className="table-header-left">
                                <Search
                                    placeholder="Search by Matric/Application Number"
                                    allowClear
                                    onSearch={handleSearch}
                                    className="search-input"
                                />
                            </div>
                            <div className="table-header-right">
                                <Tag color="green" icon={<BankOutlined />}>
                                    Authenticated: {selectedCenter}
                                </Tag>
                            </div>
                        </div>

                        <Spin spinning={loading}>
                            <Table
                                columns={columns}
                                dataSource={data}
                                rowKey={(record) => record.id}
                                pagination={pagination}
                                onChange={handleTableChange}
                                bordered
                                scroll={{ x: true }}
                            />
                        </Spin>
                    </ConfigProvider>
                </Card>
            )}
            
            <StudentDetailModal />
        </div>
    );
};
