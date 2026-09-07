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
    Typography,
} from 'antd';
import { SearchOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import staffApi from '../../../../../services/staffApi';
import API_ENDPOINTS from '../../../../../Endpoints/environment';

const { Text } = Typography;

const PAY_TYPE_LABELS = {
    registration_fees: 'Registration fee',
    acceptance_fees: 'Acceptance fee',
    complete_school_fees: 'School fees (full)',
    partial_school_fees: 'School fees (60%)',
    school_fees_completion: 'School fees (completion)',
    clearance_acceptance: 'Clearance acceptance fee',
    ibbul_acceptance_fees: 'IBBUL acceptance fee',
};

const STATUS_COLOR = {
    success: 'success',
    pending: 'warning',
    failed: 'error',
};

const formatAmount = (kobo) => (kobo == null ? '—' : `₦${(kobo / 100).toLocaleString()}`);

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState(undefined);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [detail, setDetail] = useState(null);
    const [reverifying, setReverifying] = useState(false);

    const fetchPayments = async (pageNum = page) => {
        setLoading(true);
        try {
            const res = await staffApi.get(API_ENDPOINTS.ADMIN_PAYMENTS, {
                params: { search: search || undefined, status, page: pageNum },
            });
            setPayments(res.data?.data || []);
            setTotal(res.data?.total || 0);
            setPage(pageNum);
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to load payments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const openDetail = (record) => setDetail(record);

    const reverify = async (reference) => {
        setReverifying(true);
        try {
            const res = await staffApi.post(`${API_ENDPOINTS.ADMIN_PAYMENTS}/${reference}/reverify`);
            message.success('Re-verified against Paystack.');
            setDetail(res.data?.payment || null);
            fetchPayments(page);
        } catch (error) {
            message.error(error.response?.data?.message || 'Could not re-verify with Paystack.');
        } finally {
            setReverifying(false);
        }
    };

    const columns = [
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            render: (ref) => <Text code copyable>{ref}</Text>,
        },
        {
            title: 'Type',
            dataIndex: 'pay_type',
            key: 'pay_type',
            render: (type) => PAY_TYPE_LABELS[type] || type,
        },
        {
            title: 'Student',
            key: 'student',
            render: (_, record) => {
                const pd = record.personal_detail;
                if (!pd) return '—';
                return `${pd.surname || ''} ${pd.other_names || ''}`.trim() || pd.matric_number || '—';
            },
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: formatAmount,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={STATUS_COLOR[s] || 'default'}>{s}</Tag>,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (d) => (d ? new Date(d).toLocaleString() : '—'),
        },
        {
            title: '',
            key: 'actions',
            render: (_, record) => (
                <Button size="small" onClick={() => openDetail(record)}>View</Button>
            ),
        },
    ];

    return (
        <div>
            <h2 className="staff-page-title">Payments</h2>
            <p className="staff-page-lead">
                Search by reference, matric number, or phone number to verify a student&apos;s payment,
                or re-check its status directly against Paystack.
            </p>

            <div className="staff-card">
                <Space wrap style={{ marginBottom: 16, width: '100%' }}>
                    <Input
                        placeholder="Search by reference, matric number, or phone"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={() => fetchPayments(1)}
                        style={{ width: 320 }}
                        allowClear
                    />
                    <Select
                        placeholder="Status"
                        value={status}
                        onChange={setStatus}
                        allowClear
                        style={{ width: 140 }}
                        options={[
                            { value: 'success', label: 'Success' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'failed', label: 'Failed' },
                        ]}
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => fetchPayments(1)}
                        style={{ background: '#028f64', borderColor: '#028f64' }}
                    >
                        Search
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchPayments(page)}>
                        Refresh
                    </Button>
                </Space>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={payments}
                    loading={loading}
                    scroll={{ x: 900 }}
                    pagination={{
                        current: page,
                        total,
                        pageSize: 20,
                        onChange: (p) => fetchPayments(p),
                    }}
                />
            </div>

            <Modal
                open={Boolean(detail)}
                onCancel={() => setDetail(null)}
                title="Payment detail"
                footer={[
                    <Button
                        key="reverify"
                        icon={<SyncOutlined spin={reverifying} />}
                        loading={reverifying}
                        onClick={() => detail && reverify(detail.reference)}
                        style={{ background: '#028f64', borderColor: '#028f64', color: '#fff' }}
                    >
                        Re-verify with Paystack
                    </Button>,
                    <Button key="close" onClick={() => setDetail(null)}>Close</Button>,
                ]}
            >
                {detail && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Reference">
                            <Text code copyable>{detail.reference}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">
                            {PAY_TYPE_LABELS[detail.pay_type] || detail.pay_type}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">{formatAmount(detail.amount)}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={STATUS_COLOR[detail.status] || 'default'}>{detail.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Verified at">
                            {detail.verified_at ? new Date(detail.verified_at).toLocaleString() : 'Not yet verified'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Student">
                            {detail.personal_detail
                                ? `${detail.personal_detail.surname || ''} ${detail.personal_detail.other_names || ''} (${detail.personal_detail.matric_number || detail.personal_detail.application_number || '—'})`
                                : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created">
                            {detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Payments;
