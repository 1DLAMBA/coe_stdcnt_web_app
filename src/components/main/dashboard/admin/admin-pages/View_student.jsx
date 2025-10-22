import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Card, 
    Row, 
    Col, 
    Spin, 
    Typography, 
    Tag, 
    Button, 
    Space, 
    message,
    ConfigProvider
} from 'antd';
import { 
    UserOutlined, 
    ArrowLeftOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    CalendarOutlined,
    IdcardOutlined,
    BookOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    CreditCardOutlined,
    PictureOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    ManOutlined,
    WomanOutlined,
    FileImageOutlined,
    EyeOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import axios from "axios";
import API_ENDPOINTS from "../../../../../Endpoints/environment";

const { Title, Text } = Typography;

const View_student = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState(null);

    const fetchStudentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
            setStudentData(response.data);
        } catch (error) {
            console.error("Error fetching student details:", error);
            setError("Failed to fetch student details");
            message.error("Failed to fetch student details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchStudentDetails();
        }
    }, [id, fetchStudentDetails]);

    const getPaymentStatus = (hasPaid, coursePaid) => {
        if (coursePaid === "1") {
            return { status: "Full Payment", color: "green", icon: <CheckCircleOutlined /> };
        } else if (hasPaid === "1") {
            return { status: "Partial Payment", color: "blue", icon: <InfoCircleOutlined /> };
        } else {
            return { status: "No Payment", color: "red", icon: <CloseCircleOutlined /> };
        }
    };

    const getAdmissionStatus = (hasAdmission) => {
        return hasAdmission ? 
            { status: "Approved", color: "green", icon: <CheckCircleOutlined /> } : 
            { status: "Not Approved", color: "red", icon: <CloseCircleOutlined /> };
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const getGenderIcon = (gender) => {
        if (gender?.toLowerCase() === 'male') return <ManOutlined />;
        if (gender?.toLowerCase() === 'female') return <WomanOutlined />;
        return <UserOutlined />;
    };

    const getPassportImageUrl = (passport) => {
        if (!passport) return null;
        return `${API_ENDPOINTS.IMAGE}/${passport}`;
    };

    const getOLevelFileUrl = (olevelFile) => {
        if (!olevelFile) return null;
        return `${API_ENDPOINTS.IMAGE}/${olevelFile}`;
    };

    const handleViewOLevel = (olevelFile, olevelType) => {
        if (!olevelFile) {
            message.warning(`${olevelType} file not available`);
            return;
        }
        
        const fileUrl = getOLevelFileUrl(olevelFile);
        window.open(fileUrl, '_blank');
    };

    const handleDownloadOLevel = (olevelFile, olevelType) => {
        if (!olevelFile) {
            message.warning(`${olevelType} file not available`);
            return;
        }
        
        const fileUrl = getOLevelFileUrl(olevelFile);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${olevelType}_${studentData.application_number}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !studentData) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                textAlign: 'center'
            }}>
                <Title level={3} type="danger">Student Not Found</Title>
                <Text type="secondary">The requested student details could not be found.</Text>
                <Button 
                    type="primary" 
                    onClick={() => navigate(-1)}
                    style={{ marginTop: 16 }}
                >
                    <ArrowLeftOutlined /> Go Back
                </Button>
            </div>
        );
    }

    const paymentStatus = getPaymentStatus(studentData.has_paid, studentData.course_paid);
    const admissionStatus = getAdmissionStatus(studentData.has_admission);
    const passportImageUrl = getPassportImageUrl(studentData.passport);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#028f64',
                    borderRadius: 8,
                },
            }}
        >
            <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Card */}
                <Card 
                    style={{ 
                        marginBottom: '24px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px'
                    }}
                >
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Space size="large">
                                <Button 
                                    icon={<ArrowLeftOutlined />} 
                                    onClick={() => navigate(-1)}
                                    size="large"
                                >
                                    Back
                                </Button>
                                <div>
                                    <Title level={2} style={{ margin: 0, color: '#028f64' }}>
                                        <UserOutlined style={{ marginRight: '8px' }} />
                                        Student Profile
                                    </Title>
                                    <Text type="secondary">Complete student information and records</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Row justify="end" gutter={[8, 8]}>
                                <Col>
                                    <Tag 
                                        color={paymentStatus.color} 
                                        icon={paymentStatus.icon}
                                        style={{ fontSize: '14px', padding: '4px 12px' }}
                                    >
                                        {paymentStatus.status}
                                    </Tag>
                                </Col>
                                <Col>
                                    <Tag 
                                        color={admissionStatus.color} 
                                        icon={admissionStatus.icon}
                                        style={{ fontSize: '14px', padding: '4px 12px' }}
                                    >
                                        {admissionStatus.status}
                                    </Tag>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                <Row gutter={[24, 24]}>
                    {/* Left Column - Personal Info & Photo */}
                    <Col xs={24} lg={8}>
                        {/* Student Photo Card */}
                        <Card 
                            title={
                                <Space>
                                    <PictureOutlined />
                                    <span>Student Photo</span>
                                </Space>
                            }
                            style={{ 
                                marginBottom: '24px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                {passportImageUrl ? (
                                    <img 
                                        src={passportImageUrl} 
                                        alt="Student Passport" 
                                        style={{ 
                                            width: '100%', 
                                            maxWidth: '200px', 
                                            height: 'auto',
                                            borderRadius: '8px',
                                            border: '2px solid #f0f0f0'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null}
                                <div 
                                    style={{ 
                                        display: passportImageUrl ? 'none' : 'block',
                                        padding: '40px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '8px',
                                        color: '#999'
                                    }}
                                >
                                    <FileImageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                    <div>No Photo Available</div>
                                </div>
                            </div>
                        </Card>

                        {/* Personal Information Card */}
                        <Card 
                            title={
                                <Space>
                                    <UserOutlined />
                                    <span>Personal Details</span>
                                </Space>
                            }
                            style={{ 
                                marginBottom: '24px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                borderRadius: '12px'
                            }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ fontSize: '16px' }}>
                                        {studentData.surname} {studentData.other_names}
                                    </Text>
                                    <div style={{ marginTop: '4px' }}>
                                        <Tag color="blue" icon={getGenderIcon(studentData.gender)}>
                                            {studentData.gender || "N/A"}
                                        </Tag>
                                    </div>
                                </div>
                                
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Application Number</Text>
                                    <div style={{ marginTop: '4px' }}>
                                        <Text code style={{ fontSize: '14px' }}>
                                            {studentData.application_number}
                                        </Text>
                                    </div>
                                </div>

                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Matric Number</Text>
                                    <div style={{ marginTop: '4px' }}>
                                        <Text code style={{ fontSize: '14px' }}>
                                            {studentData.matric_number || "Not Assigned"}
                                        </Text>
                                    </div>
                                </div>

                                <div>
                                    <Space>
                                        <MailOutlined style={{ color: '#028f64' }} />
                                        <Text>{studentData.email || "N/A"}</Text>
                                    </Space>
                                </div>

                                <div>
                                    <Space>
                                        <PhoneOutlined style={{ color: '#028f64' }} />
                                        <Text>{studentData.phone_number || "N/A"}</Text>
                                    </Space>
                                </div>

                                <div>
                                    <Space>
                                        <CalendarOutlined style={{ color: '#028f64' }} />
                                        <Text>{formatDate(studentData.date_of_birth)}</Text>
                                    </Space>
                                </div>

                                <div>
                                    <Space>
                                        <IdcardOutlined style={{ color: '#028f64' }} />
                                        <Text>{studentData.nin || "N/A"}</Text>
                                    </Space>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    {/* Right Column - Detailed Information */}
                    <Col xs={24} lg={16}>
                        <Row gutter={[24, 24]}>
                            {/* Family Information */}
                            <Col xs={24}>
                                <Card 
                                    title={
                                        <Space>
                                            <TeamOutlined />
                                            <span>Family Information</span>
                                        </Space>
                                    }
                                    style={{ 
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Father's Name</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text strong>{studentData.name_of_father || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Father's State</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.father_state_of_origin || "N/A"}</Text>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Father's Place of Birth</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.father_place_of_birth || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Mother's State</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.mother_state_of_origin || "N/A"}</Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            {/* Address Information */}
                            <Col xs={24}>
                                <Card 
                                    title={
                                        <Space>
                                            <EnvironmentOutlined />
                                            <span>Address Information</span>
                                        </Space>
                                    }
                                    style={{ 
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Address</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.address || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>State of Origin</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Tag color="green">{studentData.state_of_origin || "N/A"}</Tag>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Local Government</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.local_government || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Religion</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Tag color="blue">{studentData.religion || "N/A"}</Tag>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            {/* Academic Information */}
                            <Col xs={24}>
                                <Card 
                                    title={
                                        <Space>
                                            <BookOutlined />
                                            <span>Academic Information</span>
                                        </Space>
                                    }
                                    style={{ 
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>School</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text strong>{studentData.school || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Course</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text strong>{studentData.course || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Study Center</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Tag color="green" icon={<EnvironmentOutlined />}>
                                                        {studentData.desired_study_cent || "N/A"}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>O'Level 1</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.olevel1 || "N/A"}</Text>
                                                </div>
                                                {studentData.olevel1 && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <Space>
                                                            <Button 
                                                                size="small" 
                                                                icon={<EyeOutlined />}
                                                                onClick={() => handleViewOLevel(studentData.olevel1, "OLevel1")}
                                                                style={{ 
                                                                    backgroundColor: '#028f64', 
                                                                    borderColor: '#028f64',
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                View
                                                            </Button>
                                                            <Button 
                                                                size="small" 
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => handleDownloadOLevel(studentData.olevel1, "OLevel1")}
                                                                style={{ 
                                                                    backgroundColor: '#1890ff', 
                                                                    borderColor: '#1890ff',
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>O'Level 2</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.olevel2 || "N/A"}</Text>
                                                </div>
                                                {studentData.olevel2 && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <Space>
                                                            <Button 
                                                                size="small" 
                                                                icon={<EyeOutlined />}
                                                                onClick={() => handleViewOLevel(studentData.olevel2, "OLevel2")}
                                                                style={{ 
                                                                    backgroundColor: '#028f64', 
                                                                    borderColor: '#028f64',
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                View
                                                            </Button>
                                                            <Button 
                                                                size="small" 
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => handleDownloadOLevel(studentData.olevel2, "OLevel2")}
                                                                style={{ 
                                                                    backgroundColor: '#1890ff', 
                                                                    borderColor: '#1890ff',
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Application Date</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Space>
                                                        <CalendarOutlined style={{ color: '#028f64' }} />
                                                        <Text>{formatDate(studentData.application_date)}</Text>
                                                    </Space>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            {/* Payment Information */}
                            <Col xs={24}>
                                <Card 
                                    title={
                                        <Space>
                                            <CreditCardOutlined />
                                            <span>Payment Information</span>
                                        </Space>
                                    }
                                    style={{ 
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Application Transaction ID</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text code>{studentData.application_trxid || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Application Reference</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.application_reference || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Course Fee Date</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{formatDate(studentData.couse_fee_date)}</Text>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Course Fee Reference</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text>{studentData.course_fee_reference || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Scratch Card PIN</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text code>{studentData.scratchcard_pin_1 || "N/A"}</Text>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Scratch Card Serial</Text>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text code>{studentData.scratchcard_serial || "N/A"}</Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Action Buttons */}
                <Card 
                    style={{ 
                        marginTop: '24px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px'
                    }}
                >
                    <Row justify="center">
                        <Space size="large">
                            <Button 
                                type="primary" 
                                onClick={() => navigate(-1)}
                                size="large"
                                style={{ 
                                    backgroundColor: '#028f64', 
                                    borderColor: '#028f64',
                                    borderRadius: '8px',
                                    height: '40px',
                                    paddingLeft: '24px',
                                    paddingRight: '24px'
                                }}
                            >
                                <ArrowLeftOutlined /> Back to Students
                            </Button>
                            <Button 
                                onClick={fetchStudentDetails}
                                loading={loading}
                                size="large"
                                icon={<ReloadOutlined />}
                                style={{
                                    borderRadius: '8px',
                                    height: '40px',
                                    paddingLeft: '24px',
                                    paddingRight: '24px'
                                }}
                            >
                                Refresh Data
                            </Button>
                        </Space>
                    </Row>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default View_student;
