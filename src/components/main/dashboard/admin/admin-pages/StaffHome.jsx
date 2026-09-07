import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Tag } from 'antd';
import {
    TeamOutlined,
    FileExcelOutlined,
    UserAddOutlined,
    AuditOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { useStaffAuth } from '../../../../../Authentication/StaffAuthContext';

const { Title, Paragraph, Text } = Typography;

const cardBase = {
    height: '100%',
    borderRadius: 12,
    border: '1px solid #d9eee6',
};

const StaffHome = () => {
    const navigate = useNavigate();
    const { staffUser, isCoordinator, studyCentre, hasPermission } = useStaffAuth();

    const coordinatorCards = [
        {
            step: '1',
            title: 'Upload the graduation list',
            text: 'Start here. Upload the Excel/CSV of students graduating from your centre.',
            action: 'Open graduation list',
            path: '/admin/graduation-list',
            icon: <FileExcelOutlined />,
            show: hasPermission('graduation.view'),
            primary: true,
        },
        {
            step: '2',
            title: 'Add anyone missing from the portal',
            text: 'If a name is on the list but has no portal record, create one from that screen — or add them here.',
            action: 'Add a student',
            path: '/admin/add-students',
            icon: <UserAddOutlined />,
            show: hasPermission('students.manage'),
        },
        {
            step: '3',
            title: 'Start clearance for them',
            text: 'You can start clearance from the unmatched table. The bursar gives the final approval.',
            action: 'View clearance',
            path: '/admin/clearance',
            icon: <AuditOutlined />,
            show: hasPermission('clearance.view'),
        },
        {
            step: '',
            title: 'See my students',
            text: `Search and review students at ${studyCentre || 'your centre'}.`,
            action: 'Open my students',
            path: '/admin/student-stats',
            icon: <TeamOutlined />,
            show: hasPermission('students.view'),
        },
    ];

    const bursarCards = [
        {
            title: 'Approve clearance',
            text: 'Review requests, clear departments, and give final approval. Graduates without fee records can be approved in one tap (fee override).',
            action: 'Open clearance',
            path: '/admin/clearance',
            icon: <AuditOutlined />,
            show: hasPermission('clearance.approve'),
            primary: true,
        },
        {
            title: 'Graduation lists',
            text: 'See every centre’s list and unmatched names that still need a portal record.',
            action: 'Open lists',
            path: '/admin/graduation-list',
            icon: <FileExcelOutlined />,
            show: hasPermission('graduation.view'),
        },
        {
            title: 'Students',
            text: 'Search, filter by centre, and export. Use this when a coordinator calls about a student.',
            action: 'Open students',
            path: '/admin/student-stats',
            icon: <TeamOutlined />,
            show: hasPermission('students.view'),
        },
        {
            title: 'New applications',
            text: 'Offer admission to applicants who have not yet been given a matric number.',
            action: 'Open applications',
            path: '/admin/view-applications',
            icon: <FileTextOutlined />,
            show: hasPermission('applications.view'),
        },
        {
            title: 'Reports',
            text: 'Counts, charts, and the previous admin dashboard.',
            action: 'Open reports',
            path: '/admin/reports',
            icon: <BarChartOutlined />,
            show: hasPermission('stats.view'),
        },
        {
            title: 'Staff logins',
            text: 'Create a coordinator account for each centre. They will only see their own students.',
            action: 'Manage logins',
            path: '/admin/staff',
            icon: <SafetyCertificateOutlined />,
            show: hasPermission('staff.manage'),
        },
    ];

    const cards = (isCoordinator ? coordinatorCards : bursarCards).filter((c) => c.show);

    return (
        <div data-testid="staff-home">
            <h2 className="staff-page-title">
                {isCoordinator ? `Welcome — ${studyCentre || 'your centre'}` : 'Welcome'}
            </h2>
            <p className="staff-page-lead">
                {isCoordinator
                    ? 'Follow the numbered steps. You only see students for your centre. Final clearance approval is done by the bursar.'
                    : 'Choose a task. Coordinators handle their own centre lists; you approve clearance for the college.'}
            </p>
            <Text type="secondary">
                Signed in as {staffUser?.name}
                {isCoordinator ? ` · ${studyCentre} coordinator` : ` · ${(staffUser?.role || '').replace('_', ' ')}`}
            </Text>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {cards.map((card) => (
                    <Col xs={24} md={12} key={card.title}>
                        <Card
                            style={{
                                ...cardBase,
                                borderColor: card.primary ? '#028f64' : '#d9eee6',
                                boxShadow: card.primary ? '0 4px 14px rgba(2, 143, 100, 0.12)' : undefined,
                            }}
                        >
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                {card.step ? (
                                    <Tag color="green" style={{ fontSize: 16, padding: '4px 10px' }}>
                                        Step {card.step}
                                    </Tag>
                                ) : (
                                    <span style={{ color: '#028f64', fontSize: 22 }}>{card.icon}</span>
                                )}
                                <div>
                                    <Title level={4} style={{ marginTop: 0 }}>{card.title}</Title>
                                    <Paragraph>{card.text}</Paragraph>
                                    <Button
                                        type={card.primary ? 'primary' : 'default'}
                                        style={card.primary ? { background: '#028f64', borderColor: '#028f64' } : undefined}
                                        onClick={() => navigate(card.path)}
                                    >
                                        {card.action}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default StaffHome;
