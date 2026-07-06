import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Input,
    Space,
    Table,
    Tag,
    Typography,
    Upload,
    message,
} from 'antd';
import {
    FileExcelOutlined,
    SearchOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import API_ENDPOINTS from '../../../../../Endpoints/environment';

const { Title, Text } = Typography;

const cardStyle = {
    maxWidth: 520,
    margin: '0 auto 24px',
    padding: 20,
    background: '#f9f9f9',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const primaryButtonStyle = { background: '#028f64', borderColor: '#028f64' };

const GraduationList = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    const [checkValue, setCheckValue] = useState('');
    const [checkResult, setCheckResult] = useState(null);
    const [checking, setChecking] = useState(false);

    const fetchList = useCallback(async (page = 1, pageSize = 20, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await axios.get(API_ENDPOINTS.GRADUATION_LIST, {
                params: { page, per_page: pageSize, search: searchTerm || undefined },
            });
            setRows(response.data?.data || []);
            setPagination({
                current: response.data?.current_page || page,
                pageSize,
                total: response.data?.total || 0,
            });
        } catch (error) {
            message.error(error.response?.data?.message || 'Could not load graduation list');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const onUpload = async () => {
        if (!file) {
            message.error('Choose a file to upload');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await axios.post(API_ENDPOINTS.GRADUATION_LIST_IMPORT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const total = response.data?.total;
            message.success(
                `${response.data?.message || 'Graduation list imported successfully'}${total != null ? ` (${total} students on list)` : ''}`
            );
            setFile(null);
            fetchList(1, pagination.pageSize, search);
        } catch (error) {
            message.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const onCheckMatric = async () => {
        const matric = checkValue.trim();
        if (!matric) {
            message.error('Enter a matric number first');
            return;
        }
        setChecking(true);
        setCheckResult(null);
        try {
            const response = await axios.get(
                `${API_ENDPOINTS.GRADUATION_LIST_CHECK}/${encodeURIComponent(matric)}`
            );
            setCheckResult(response.data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to check matric number');
        } finally {
            setChecking(false);
        }
    };

    const columns = [
        { title: 'Matric Number', dataIndex: 'matric_number', key: 'matric_number' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Course', dataIndex: 'course', key: 'course' },
        { title: 'Centre', dataIndex: 'centre', key: 'centre' },
        { title: 'Session', dataIndex: 'session', key: 'session' },
    ];

    return (
        <div style={{ padding: '24px 16px' }}>
            <Title level={3} style={{ textAlign: 'center', color: '#028f64' }}>
                Graduation List
            </Title>

            <div style={cardStyle}>
                <Title level={4} style={{ textAlign: 'center', color: '#028f64', marginTop: 0 }}>
                    Upload Graduands
                </Title>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
                    Upload an XLSX or CSV with columns MATRIC NO, NAME, COURSE, CENTRE.
                    Rows are matched by matric number, so re-uploads and batch uploads are safe.
                </Text>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Upload
                        accept=".csv,.xlsx,.xls"
                        maxCount={1}
                        beforeUpload={(selected) => {
                            setFile(selected);
                            return false;
                        }}
                        onRemove={() => setFile(null)}
                        fileList={file ? [{ uid: '-1', name: file.name, status: 'done' }] : []}
                    >
                        <Button icon={<UploadOutlined />} block>Select File (XLSX / CSV)</Button>
                    </Upload>
                    <Button
                        type="primary"
                        block
                        loading={uploading}
                        icon={<FileExcelOutlined />}
                        style={primaryButtonStyle}
                        onClick={onUpload}
                        disabled={!file}
                    >
                        Upload Graduation List
                    </Button>
                </Space>
            </div>

            <div style={{ ...cardStyle, maxWidth: 900 }}>
                <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                    <Input.Search
                        placeholder="Search matric number or name"
                        allowClear
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onSearch={(value) => fetchList(1, pagination.pageSize, value)}
                        style={{ width: 280 }}
                    />
                    <Input.Search
                        placeholder="Check matric e.g. ED/22/103873"
                        value={checkValue}
                        onChange={(e) => {
                            setCheckValue(e.target.value);
                            setCheckResult(null);
                        }}
                        enterButton={(
                            <Button icon={<SearchOutlined />} loading={checking}>Check</Button>
                        )}
                        onSearch={onCheckMatric}
                        style={{ width: 320 }}
                    />
                    {checkResult && (
                        checkResult.on_list
                            ? <Tag color="green">On list{checkResult.entry?.name ? ` — ${checkResult.entry.name}` : ''}</Tag>
                            : <Tag color="red">Not on list</Tag>
                    )}
                </Space>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={rows}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `${total} students on the graduation list`,
                    }}
                    onChange={(pag) => fetchList(pag.current, pag.pageSize, search)}
                    scroll={{ x: true }}
                />
            </div>
        </div>
    );
};

export default GraduationList;
