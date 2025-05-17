import React, { useEffect, useState } from "react";
import { UserOutlined } from '@ant-design/icons';
import { Card, Col, ConfigProvider, Statistic, Tag, Table, Input, Select, Spin, Row } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from "axios";
import '../admin-pages/styles/application.css';
import API_ENDPOINTS from "../../../../../Endpoints/environment";

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
    }
};

export const Student_Stats = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [studentsWithPartialPayment, setStudentsWithPartialPayment] = useState(0);
    const [studentsWithFullPayment, setStudentsWithFullPayment] = useState(0);
    const [studentsWithMatric, setStudentsWithMatric] = useState(0);
    const [approvedStudents, setApprovedStudents] = useState(0);
    const [totalApplications, setTotalApplications] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [search, setSearch] = useState("");
    const [studyCent, setStudyCent] = useState("");
    const [studyCenterData, setStudyCenterData] = useState([]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/personal-details`);
            setData(response.data);
            setStudentsWithPartialPayment(response.data.filter((student) => student.has_paid == 1 && student.course_paid == 0).length);
            setStudentsWithFullPayment(response.data.filter((student) => student.course_paid == 1).length);
            setStudentsWithMatric(response.data.filter((student) => student.matric_number).length);
            setApprovedStudents(response.data.filter((student) => student.has_admission).length);
            setTotalApplications(response.data.length);

            // Process study center data    
            const centers = ['Salka', 'Mokwa', 'suleja', 'Kagara', 'New Bussa', 'Gulu', 'Gawu', 'Doko', 'Katcha', 'Rijau', 'Kontogora'];
            const centerStats = centers.map(center => {
                const centerStudents = response.data.filter(student => student.desired_study_cent === center);
                return {
                    name: center,
                    total: centerStudents.length,
                    approved: centerStudents.filter(student => student.has_admission).length
                };
            });
            setStudyCenterData(centerStats);
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchStudents(pagination.current, search, studyCent);
    }, [pagination.current, search, studyCent]);

    const fetchStudents = async (page, searchValue, studyCentValue) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/personal-details-paged`, {
                params: {
                    page,
                    search: searchValue,
                    study_cent: studyCentValue,
                    type: null,
                },
            });

            setData(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.total,
            });
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination({ ...pagination });
    };

    const handleSearch = (value) => {
        setSearch(value);
    };

    const handleFilterChange = (value) => {
        setStudyCent(value);
    };

    const pieData = [
        { name: 'Partial Payment', value: studentsWithPartialPayment },
        { name: 'Full Payment', value: studentsWithFullPayment },
        { name: 'Not Paid', value: studentsWithMatric }
    ];

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
            title: "Study Center",
            dataIndex: "desired_study_cent",
            key: "desired_study_cent",
        },
        {
            title: "Payment Status",
            key: "payment_status",
            render: (_, record) => (
                <span>
                    {record.course_paid ? (
                        <Tag color="green">Full Payment</Tag>
                    ) : record.has_paid ? (
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
    ];

    return (
        <div style={styles.container}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={styles.card}>
                        <Statistic
                            title="Students with Partial Payment (60%)"
                            value={studentsWithPartialPayment}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={styles.card}>
                        <Statistic
                            title="Students with Full Payment"
                            value={studentsWithFullPayment}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={styles.card}>
                        <Statistic
                            title="Students Not Paid"
                            value={studentsWithMatric}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={styles.card}>
                        <Statistic
                            title="Approved Students"
                            value={approvedStudents}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} md={12}>
                    <Card title="Payment Status Distribution" bordered={false} style={styles.card}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Study Center Applications" bordered={false} style={styles.card}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={studyCenterData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar 
                                    dataKey="total" 
                                    name="Total Applications" 
                                    fill="#8884d8"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar 
                                    dataKey="approved" 
                                    name="Approved Applications" 
                                    fill="#82ca9d"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

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
                    <div style={styles.searchContainer}>
                        <Search
                            placeholder="Search by Matric/Application Number"
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: '100%', maxWidth: 300 }}
                        />

                        <Select
                            placeholder="Filter by Study Center"
                            allowClear
                            onChange={handleFilterChange}
                            style={{ width: '100%', maxWidth: 200 }}
                        >
                            <Option value="Salka">Salka</Option>
                            <Option value="Mokwa">Mokwa</Option>
                            <Option value="suleja">Suleja</Option>
                            <Option value="Kagara">Kagara</Option>
                            <Option value="New Bussa">New Bussa</Option>
                            <Option value="Gulu">Gulu</Option>
                            <Option value="Gawu">Gawu</Option>
                            <Option value="Doko">Doko</Option>
                            <Option value="Katcha">Katcha</Option>
                            <Option value="Rijau">Rijau</Option>
                            <Option value="Kontogora">Kontogora</Option>
                        </Select>
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
        </div>
    );
};
