import React, { useEffect, useState } from 'react';
import {
    Table,
    Input,
    Select,
    Tag,
    Button,
    message,
    Descriptions,
    Modal,
    Space,
    DatePicker,
    Typography,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import staffApi from '../../../../../services/staffApi';
import API_ENDPOINTS from '../../../../../Endpoints/environment';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const ACTION_COLOR = {
    'clearance.approve': 'success',
    'clearance.approve_with_fee_override': 'warning',
    'clearance.reject': 'error',
    'payment.reverify': 'processing',
    'staff.create': 'blue',
    'staff.update': 'gold',
};

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [action, setAction] = useState(undefined);
    const [actions, setActions] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [detail, setDetail] = useState(null);

    const fetchLogs = async (pageNum = page) => {
        setLoading(true);
        try {
            const res = await staffApi.get(API_ENDPOINTS.ADMIN_AUDIT_LOGS, {
                params: {
                    search: search || undefined,
                    action,
                    from: dateRange?.[0]?.format('YYYY-MM-DD'),
                    to: dateRange?.[1]?.format('YYYY-MM-DD'),
                    page: pageNum,
                },
            });
            setLogs(res.data?.data || []);
            setTotal(res.data?.total || 0);
            setPage(pageNum);
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to load audit log.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
        staffApi.get(API_ENDPOINTS.ADMIN_AUDIT_LOG_ACTIONS)
            .then((res) => setActions(res.data?.data || []))
            .catch(() => setActions([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action]);

    const columns = [
        {
            title: 'When',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (d) => (d ? new Date(d).toLocaleString() : '—'),
            width: 180,
        },
        {
            title: 'Actor',
            dataIndex: 'actor_name',
            key: 'actor_name',
            render: (name) => name || 'System',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (a) => <Tag color={ACTION_COLOR[a] || 'default'}>{a}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button size="small" onClick={() => setDetail(record)}>View</Button>
            ),
        },
    ];

    return (
        <div>
            <h2 className="staff-page-title">Audit log</h2>
            <p className="staff-page-lead">
                A record of clearance approvals/rejections, fee overrides, payment re-verifications,
                and staff account changes — who did what, and when.
            </p>

            <div className="staff-card">
                <Space wrap style={{ marginBottom: 16, width: '100%' }}>
                    <Input
                        placeholder="Search description or actor"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={() => fetchLogs(1)}
                        style={{ width: 260 }}
                        allowClear
                    />
                    <Select
                        placeholder="Action"
                        value={action}
                        onChange={setAction}
                        allowClear
                        style={{ width: 220 }}
                        options={actions.map((a) => ({ value: a, label: a }))}
                    />
                    <RangePicker value={dateRange} onChange={setDateRange} />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => fetchLogs(1)}
                        style={{ background: '#028f64', borderColor: '#028f64' }}
                    >
                        Search
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchLogs(page)}>
                        Refresh
                    </Button>
                </Space>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={logs}
                    loading={loading}
                    scroll={{ x: 900 }}
                    pagination={{
                        current: page,
                        total,
                        pageSize: 30,
                        onChange: (p) => fetchLogs(p),
                    }}
                />
            </div>

            <Modal
                open={Boolean(detail)}
                onCancel={() => setDetail(null)}
                title="Audit entry"
                footer={[<Button key="close" onClick={() => setDetail(null)}>Close</Button>]}
            >
                {detail && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="When">
                            {new Date(detail.created_at).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Actor">{detail.actor_name || 'System'}</Descriptions.Item>
                        <Descriptions.Item label="Action">
                            <Tag color={ACTION_COLOR[detail.action] || 'default'}>{detail.action}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">{detail.description}</Descriptions.Item>
                        <Descriptions.Item label="Subject">
                            {detail.subject_type ? `${detail.subject_type} #${detail.subject_id}` : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Details">
                            {detail.metadata ? (
                                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 12 }}>
                                    {JSON.stringify(detail.metadata, null, 2)}
                                </pre>
                            ) : (
                                <Text type="secondary">None</Text>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AuditLog;
