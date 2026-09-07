import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Form,
    Input,
    Select,
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
    UserAddOutlined,
    FileTextOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import staffApi from '../../../../../services/staffApi';
import API_ENDPOINTS from '../../../../../Endpoints/environment';
import { useStaffAuth } from '../../../../../Authentication/StaffAuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const cardStyle = {
    width: '100%',
    margin: '0 0 16px',
    padding: 20,
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #d9eee6',
    boxShadow: '0 1px 3px rgba(2, 80, 56, 0.06)',
};

const primaryButtonStyle = { background: '#028f64', borderColor: '#028f64' };

const GraduationList = () => {
    const { hasPermission, isCoordinator, studyCentre } = useStaffAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    const [checkValue, setCheckValue] = useState('');
    const [checkResult, setCheckResult] = useState(null);
    const [checking, setChecking] = useState(false);

    const [unmatched, setUnmatched] = useState([]);
    const [matchSummary, setMatchSummary] = useState({ matched: 0, unmatched: 0, total: 0 });
    const [unmatchedLoading, setUnmatchedLoading] = useState(false);
    const [rowBusy, setRowBusy] = useState({});
    const [centres, setCentres] = useState([]);
    const [adding, setAdding] = useState(false);
    const [downloadingSample, setDownloadingSample] = useState(false);
    const [form] = Form.useForm();

    const fetchList = useCallback(async (page = 1, pageSize = 20, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await staffApi.get(API_ENDPOINTS.GRADUATION_LIST, {
                params: {
                    page,
                    per_page: pageSize,
                    search: searchTerm || undefined,
                    centre: isCoordinator ? studyCentre : undefined,
                },
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
    }, [isCoordinator, studyCentre]);

    const fetchUnmatched = useCallback(async () => {
        setUnmatchedLoading(true);
        try {
            const response = await staffApi.get(API_ENDPOINTS.GRADUATION_LIST_UNMATCHED);
            setUnmatched(response.data?.unmatched_rows || []);
            setMatchSummary({
                matched: response.data?.matched || 0,
                unmatched: response.data?.unmatched || 0,
                total: response.data?.total || 0,
            });
        } catch (error) {
            message.error(error.response?.data?.message || 'Could not load unmatched rows');
        } finally {
            setUnmatchedLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
        fetchUnmatched();
    }, [fetchList, fetchUnmatched]);

    useEffect(() => {
        staffApi.get(API_ENDPOINTS.STAFF_CENTRES)
            .then((response) => setCentres(response.data?.data || []))
            .catch(() => setCentres([]));
    }, []);

    useEffect(() => {
        if (isCoordinator && studyCentre) {
            form.setFieldsValue({ centre: studyCentre });
        }
    }, [form, isCoordinator, studyCentre]);

    const applyMatchReport = (data) => {
        if (!data) {
            return;
        }
        setUnmatched(data.unmatched_rows || []);
        setMatchSummary({
            matched: data.matched || 0,
            unmatched: data.unmatched || 0,
            total: data.total || 0,
        });
    };

    const onDownloadSample = async () => {
        setDownloadingSample(true);
        try {
            const response = await staffApi.get(API_ENDPOINTS.GRADUATION_LIST_SAMPLE_CSV, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'graduation_list_sample.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error('Could not download sample CSV');
        } finally {
            setDownloadingSample(false);
        }
    };

    const onUpload = async () => {
        if (!file) {
            message.error('Choose a file to upload');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await staffApi.post(API_ENDPOINTS.GRADUATION_LIST_IMPORT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const unmatchedCount = response.data?.unmatched;
            message.success(
                `${response.data?.message || 'Graduation list imported successfully'} (${response.data?.matched || 0} matched, ${unmatchedCount ?? 0} unmatched)`
            );
            setFile(null);
            fetchList(1, pagination.pageSize, search);
            applyMatchReport(response.data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const onAddStudent = async (values) => {
        setAdding(true);
        try {
            const response = await staffApi.post(API_ENDPOINTS.GRADUATION_LIST, {
                matric_number: values.matric_number,
                name: values.name,
                course: values.course || undefined,
                centre: isCoordinator ? studyCentre : values.centre,
                session: values.session || undefined,
            });
            message.success(response.data?.message || 'Student added to the graduation list.');
            form.resetFields();
            if (isCoordinator && studyCentre) {
                form.setFieldsValue({ centre: studyCentre });
            }
            fetchList(1, pagination.pageSize, search);
            applyMatchReport(response.data);
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            const first = Object.values(errors).flat()[0];
            message.error(first || error.response?.data?.message || 'Could not add student');
        } finally {
            setAdding(false);
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
            const response = await staffApi.get(
                `${API_ENDPOINTS.GRADUATION_LIST_CHECK}/${encodeURIComponent(matric)}`
            );
            setCheckResult(response.data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to check matric number');
        } finally {
            setChecking(false);
        }
    };

    const createPortalRecord = async (row) => {
        setRowBusy((prev) => ({ ...prev, [row.id]: 'create' }));
        try {
            const response = await staffApi.post(API_ENDPOINTS.ADMIN_MINIMAL_STUDENTS, {
                matric_number: row.matric_number,
                other_names: row.name,
                course: row.course || 'Undeclared',
                desired_study_cent: row.centre || studyCentre,
            });
            message.success(response.data?.message || 'Portal record created');
            fetchUnmatched();
            return response.data?.data;
        } catch (error) {
            message.error(error.response?.data?.message || 'Could not create portal record');
            return null;
        } finally {
            setRowBusy((prev) => ({ ...prev, [row.id]: null }));
        }
    };

    const startClearance = async (row) => {
        setRowBusy((prev) => ({ ...prev, [row.id]: 'start' }));
        try {
            let personalId = null;
            const check = await staffApi.post(API_ENDPOINTS.ADMIN_MINIMAL_STUDENTS_CHECK, {
                matric_number: row.matric_number,
            });
            if (check.data?.exists) {
                personalId = check.data.student?.id;
            } else {
                const created = await createPortalRecord(row);
                personalId = created?.id;
            }
            if (!personalId) {
                return;
            }
            await staffApi.post(API_ENDPOINTS.STAFF_CLEARANCES_START, {
                personal_detail_id: personalId,
            });
            message.success('Clearance request started. Bursar can approve after departments clear.');
            fetchUnmatched();
        } catch (error) {
            const first = error.response?.data?.errors?.graduation?.[0]
                || error.response?.data?.errors?.clearance?.[0];
            message.error(first || error.response?.data?.message || 'Could not start clearance');
        } finally {
            setRowBusy((prev) => ({ ...prev, [row.id]: null }));
        }
    };

    const columns = [
        { title: 'Matric Number', dataIndex: 'matric_number', key: 'matric_number' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Course', dataIndex: 'course', key: 'course' },
        { title: 'Centre', dataIndex: 'centre', key: 'centre' },
        { title: 'Session', dataIndex: 'session', key: 'session' },
    ];

    const unmatchedColumns = [
        ...columns.slice(0, 4),
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space wrap>
                    {hasPermission('students.manage') && (
                        <Button
                            size="small"
                            icon={<UserAddOutlined />}
                            loading={rowBusy[record.id] === 'create'}
                            onClick={() => createPortalRecord(record)}
                        >
                            Create portal record
                        </Button>
                    )}
                    {hasPermission('clearance.start') && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<FileTextOutlined />}
                            style={primaryButtonStyle}
                            loading={rowBusy[record.id] === 'start'}
                            onClick={() => startClearance(record)}
                        >
                            Start clearance
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2 className="staff-page-title">Graduation list</h2>
            <p className="staff-page-lead">
                {isCoordinator
                    ? `Scoped to ${studyCentre}. Add a student here, or upload a file. Then create portal records for names that are missing and start clearance.`
                    : 'Add a student on this page, or upload a file. Names with no portal record appear first so you can add them and start clearance.'}
            </p>

            {hasPermission('graduation.upload') && (
            <div>
            <div style={cardStyle}>
                <Title level={4} style={{ color: '#028f64', marginTop: 0 }}>
                    Add one student
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Use this when a name is missing from the file. Matric number is required. Saving the same matric updates the existing row.
                </Text>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onAddStudent}
                    initialValues={isCoordinator ? { centre: studyCentre } : {}}
                >
                    <div className="staff-grad-form-grid">
                        <Form.Item
                            name="matric_number"
                            label="Matric number"
                            rules={[{ required: true, message: 'Enter a matric number' }]}
                        >
                            <Input placeholder="e.g. ED/22/103873" autoComplete="off" />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label="Full name"
                            rules={[{ required: true, message: 'Enter the student name' }]}
                        >
                            <Input placeholder="Name as it should appear on the list" />
                        </Form.Item>
                        <Form.Item name="course" label="Course">
                            <Input placeholder="Optional" />
                        </Form.Item>
                        <Form.Item
                            name="centre"
                            label="Study centre"
                            rules={isCoordinator ? [] : [{ required: true, message: 'Select a centre' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Select centre"
                                disabled={isCoordinator}
                                optionFilterProp="children"
                            >
                                {(centres.length ? centres : (studyCentre ? [studyCentre] : [])).map((c) => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="session" label="Session">
                            <Input placeholder="2025/2026" />
                        </Form.Item>
                    </div>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={adding}
                        icon={<UserAddOutlined />}
                        style={primaryButtonStyle}
                    >
                        Add to graduation list
                    </Button>
                </Form>
            </div>
            <div style={cardStyle}>
                <Title level={4} style={{ color: '#028f64', marginTop: 0 }}>
                    Upload file
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Upload an XLSX or CSV with columns MATRIC NO, NAME, COURSE, CENTRE.
                    Rows are matched by matric number, so re-uploads and batch uploads are safe.
                    {' '}
                    <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        loading={downloadingSample}
                        onClick={onDownloadSample}
                        style={{ padding: 0, height: 'auto', color: '#028f64' }}
                    >
                        Download a sample CSV
                    </Button>
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
            </div>
            )}

            <div style={{ ...cardStyle, maxWidth: '100%' }}>
                <Title level={4} style={{ color: '#028f64', marginTop: 0 }}>
                    No portal record ({matchSummary.unmatched} of {matchSummary.total})
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                    These names are on the graduation list but have no student record yet.
                    <br />
                    Use <b>Create portal record</b> first, then <b>Start clearance</b>. The bursar still approves.
                </Text>
                <Table
                    rowKey="id"
                    columns={unmatchedColumns}
                    dataSource={unmatched}
                    loading={unmatchedLoading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                />
            </div>

            <div style={{ ...cardStyle, maxWidth: '100%' }}>
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
