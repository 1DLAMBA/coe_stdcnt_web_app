import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowDownOutlined, ArrowUpOutlined, EyeFilled, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { Card, Col, ConfigProvider, Statistic, Tag, Button, Table, Input, Select, Spin, Row } from 'antd';
import staffApi from "../../../../../services/staffApi";
import '../admin-pages/styles/application.css';
import API_ENDPOINTS from "../../../../../Endpoints/environment";
import { useStaffAuth } from "../../../../../Authentication/StaffAuthContext";

const { Search } = Input;
const { Option } = Select;

const styles = {
    container: {
        width: '100%',
    },
    card: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        height: '100%',
    },
    kpiCard: {
        padding: '12px 16px',
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

export const Admin_dashboard = () => {
    const [data, setData] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noAdmissionCount, setNoAdmissionCount] = useState(0);
    const [matricNumberCount, setMatricNumberCount] = useState(0);
    const [approvedStudents, setApprovedStudents] = useState(0);
    const [clearanceCount, setClearanceCount] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [search, setSearch] = useState("");
    const [studyCent, setStudyCent] = useState("");
    const navigate = useNavigate();
    const { isCoordinator, studyCentre } = useStaffAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await staffApi.get(API_ENDPOINTS.STAFF_STUDENTS_SUMMARY);
            setNoAdmissionCount(response.data.no_admission);
            setMatricNumberCount(response.data.with_matric);
            setApprovedStudents(response.data.approved_without_matric);
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClearances = async () => {
        try {
            const response = await staffApi.get(API_ENDPOINTS.STAFF_CLEARANCES);
            setClearanceCount(response.data?.data?.length || 0);
        } catch (error) {
            console.error("Error fetching clearance count:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchClearances();
    }, []);

    useEffect(() => {
        fetchStudents(pagination.current, search, studyCent);
    }, [pagination.current, search, studyCent]);

    const fetchStudents = async (page, searchValue, studyCentValue) => {
        setLoading(true);
        try {
            const response = await staffApi.get(API_ENDPOINTS.STAFF_STUDENTS, {
                params: {
                    page,
                    search: searchValue,
                    study_cent: isCoordinator ? studyCentre : studyCentValue,
                    type: null,
                },
            });

            setStudents(response.data.data); // Laravel paginates in `data`
            setPagination({
                ...pagination,
                total: response.data.total, // Total count for pagination
            });
            console.log(response.data);
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

    const columns = [
        {
            title: "Name",
            key: "full_name",
            render: (_, record) => {
                const surname = record.surname || "";
                const otherNames = record.other_names || "";
                return `${surname} ${otherNames}`.trim();
            },
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
        }, {
            title: "Has Admission",
            dataIndex: "has_admission",
            key: "has_admission",
            render: (has_admission) => (
                <span>
                    {has_admission ? (
                        <Tag color="green">Yes</Tag>
                    ) : (
                        <Tag color="red">No</Tag>
                    )}
                </span>
            ),
        },
        {
            title: "Programme Type",
            dataIndex: "bio_registration.mode_of_entry",
            key: "programme_type",
            render: (_, record) => {
                const modeOfEntry = record.bio_registration?.mode_of_entry;
                return (
                    <span>
                        {modeOfEntry === 'pre_nce' ? (
                            <Tag color="green">Pre NCE</Tag>
                        ) : (
                            <Tag color="cyan">{modeOfEntry || 'Direct NCE'}</Tag>
                        )}
                    </span>
                );
            },
        },
    ];

    return (
        <div style={styles.container}>
            <h2 className="staff-page-title">Reports</h2>
            <p className="staff-page-lead">College-wide counts from the previous admin dashboard.</p>
            <Row gutter={[12, 12]}>
                <Col xs={12} sm={12} md={6} lg={6}>
                    <Card bordered={false} size="small" bodyStyle={styles.kpiCard} style={styles.card}>
                        <Statistic
                            title="New Applications"
                            value={noAdmissionCount}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<UserOutlined />}
                        />
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
                            <Button type="primary" ghost size="small" onClick={() => navigate('/admin/view-applications')}>
                                View List
                            </Button>
                        </ConfigProvider>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                    <Card bordered={false} size="small" bodyStyle={styles.kpiCard} style={styles.card}>
                        <Statistic
                            title="Students Statistics"
                            value={matricNumberCount}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
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
                            <Button icon={<EyeFilled />} size="small" onClick={() => navigate('/admin/student-stats')} type="primary">
                                View
                            </Button>
                        </ConfigProvider>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                    <Card bordered={false} size="small" bodyStyle={styles.kpiCard} style={styles.card}>
                        <Statistic
                            title="Approved Students"
                            value={approvedStudents}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
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
                            <Button type="primary" ghost size="small" onClick={() => navigate('/admin/view-approved')}>
                                View List
                            </Button>
                        </ConfigProvider>
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                    <Card bordered={false} size="small" bodyStyle={styles.kpiCard} style={styles.card}>
                        <Statistic
                            title="Clearance Requests"
                            value={clearanceCount}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<FileTextOutlined />}
                        />
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
                            <Button type="primary" ghost size="small" onClick={() => navigate('/admin/clearance')}>
                                View
                            </Button>
                        </ConfigProvider>
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: '16px' }}>
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
                            <Option value="Bida">Bida</Option>
                            <Option value="Patigi">Patigi</Option>
                            <Option value="Pandogari">Pandogari</Option>
                            <Option value="Agaie">Agaie</Option>


                        </Select>
                    </div>
                    <Spin spinning={loading}>
                        <Table
                            columns={columns}
                            dataSource={students}
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