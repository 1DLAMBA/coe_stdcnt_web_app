import React, { useMemo, useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Upload,
    Tabs,
    Tag,
    Space,
    Typography,
    message,
} from 'antd';
import {
    UploadOutlined,
    DownloadOutlined,
    SearchOutlined,
    UserAddOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import API_ENDPOINTS from '../../../../../Endpoints/environment';

const { Option } = Select;
const { Title, Text } = Typography;

// Mirrors Student_Stats.jsx so the same course catalogue is used everywhere
// in the admin app; keeping this colocated avoids a shared module just for
// two screens, matching the existing convention.
const schoolsData = {
    'School of Sciences': [
        'Mathematics / Geography',
        'Maths / Economics',
        'Maths / Biology',
        'Maths / Computer Science',
        'Maths / Special Education',
        'Biology / Inter Science',
        'Integrated Sciences (Double Major)',
        'Biology / Geography',
        'PHE (Double Major)',
        'Biology / Special Education',
    ],
    'School of Technical Education': [
        'Technical Education Double Major',
        'Electrical / Electronics',
        'Automobile',
        'Building',
        'Wood Work',
        'Metal Work',
    ],
    'School of Arts and Social Sciences': [
        'Geography / History',
        'Geography / Economics',
        'Geography / Social Studies',
        'History / CRS',
'Social Studies (Double Major)',
        'History / Islamic Studies',
        'Social Studies / Economics',
        'Social Studies / CRS',
        'Social Studies / Islamic Studies',
        'Islamic Studies / Special Education',
        'Eco / Special Education',
        'CRS / Special Education',
        'History / Special Education',
    ],
    'School of Education': [
        'Primary Education Studies (Double Major)',
        'Early Childhood Care Education (Double Major)',
    ],
    'School of Languages': [
        'English / History',
        'English / CRS',
        'English / Arabic',
        'English / Hausa',
        'English / Social Studies',
        'English / Islamic Studies',
        'Hausa / Islamic Studies',
        'Hausa / Arabic',
        'Hausa / Social Studies',
        'Arabic / Islamic Studies',
        'Arabic / Social Studies',
        'English / Special Education',
        'Hausa / Special Education',
    ],
    'School of Vocational Education': [
        'Agricultural Science Education (Double Major)',
        'Home Economics (Double Major)',
        'Business Education (Double Major)',
    ],
};

// Centre slugs must match backend PersonalDetail::generateMatricNumber keys
// (note 'suleja' is lowercase to match the legacy import data).
const studyCentres = [
    'Salka',
    'Mokwa',
    'suleja',
    'Kagara',
    'New Bussa',
    'Gulu',
    'Gawu',
    'Doko',
    'Katcha',
    'Rijau',
    'Kontogora',
    'Bida',
    'Patigi',
    'Pandogari',
    'Agaie',
];

const cardStyle = {
    maxWidth: 520,
    margin: '0 auto',
    padding: 20,
    background: '#f9f9f9',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const primaryButtonStyle = { background: '#028f64', borderColor: '#028f64' };

const AdminAddStudents = () => {
    const [form] = Form.useForm();
    const [school, setSchool] = useState('');
    const [matricCheck, setMatricCheck] = useState({ state: 'idle', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const [bulkCentre, setBulkCentre] = useState('');
    const [bulkFile, setBulkFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const courseOptions = useMemo(() => (school ? schoolsData[school] : []), [school]);

    const onMatricCheck = async () => {
        const matric = (form.getFieldValue('matric_number') || '').trim();
        if (!matric) {
            message.error('Enter a matric number first');
            return;
        }
        setMatricCheck({ state: 'loading', message: '' });
        try {
            const response = await axios.post(API_ENDPOINTS.ADMIN_MINIMAL_STUDENTS_CHECK, {
                matric_number: matric,
            });
            if (response.data?.exists) {
                const student = response.data.student;
                setMatricCheck({
                    state: 'taken',
                    message: student?.other_names
                        ? `Already used by ${student.other_names}`
                        : 'Already used',
                });
            } else {
                setMatricCheck({ state: 'available', message: 'Available' });
            }
        } catch (error) {
            setMatricCheck({ state: 'idle', message: '' });
            message.error(error.response?.data?.message || 'Unable to check matric number');
        }
    };

    const onSubmitSingle = async (values) => {
        if (matricCheck.state === 'taken') {
            message.error('This matric number is already in use.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                matric_number: values.matric_number.trim(),
                other_names: values.other_names ? values.other_names.trim() : null,
                course: values.course,
                desired_study_cent: values.desired_study_cent,
            };
            const response = await axios.post(API_ENDPOINTS.ADMIN_MINIMAL_STUDENTS, payload);
            message.success(response.data?.message || 'Student added successfully');
            form.resetFields();
            setSchool('');
            setMatricCheck({ state: 'idle', message: '' });
        } catch (error) {
            message.error(error.response?.data?.message || 'Could not add student');
        } finally {
            setSubmitting(false);
        }
    };

    const onDownloadSample = () => {
        // Force a real file download in a new tab; works without auth headers
        // because the route is public, matching the existing import endpoint.
        window.open(API_ENDPOINTS.IMPORT_SAMPLE_CSV, '_blank');
    };

    const onBulkUpload = async () => {
        if (!bulkCentre) {
            message.error('Select a study centre');
            return;
        }
        if (!bulkFile) {
            message.error('Choose a file to upload');
            return;
        }
        const formData = new FormData();
        formData.append('file', bulkFile);

        setUploading(true);
        try {
            const response = await axios.post(
                `${API_ENDPOINTS.IMPORT_STUDENTS}/${encodeURIComponent(bulkCentre)}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            message.success(response.data?.message || 'Students imported successfully');
            setBulkFile(null);
        } catch (error) {
            message.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const matricStatusTag = matricCheck.state === 'available'
        ? <Tag color="green">{matricCheck.message}</Tag>
        : matricCheck.state === 'taken'
            ? <Tag color="red">{matricCheck.message}</Tag>
            : null;

    const singleTab = (
        <div style={cardStyle}>
            <Title level={4} style={{ textAlign: 'center', color: '#028f64', marginTop: 0 }}>
                Add Single Student
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
                Matric number is required; name is optional. Course and study centre are stored on the row.
            </Text>
            <Form form={form} layout="vertical" onFinish={onSubmitSingle}>
                <Form.Item
                    label={(
                        <Space>
                            <span>Matric Number</span>
                            {matricStatusTag}
                        </Space>
                    )}
                    name="matric_number"
                    rules={[{ required: true, message: 'Matric number is required' }]}
                >
                    <Input.Search
                        placeholder="e.g. MK/SE/26/110001"
                        enterButton={(
                            <Button icon={<SearchOutlined />} loading={matricCheck.state === 'loading'}>
                                Check
                            </Button>
                        )}
                        onSearch={onMatricCheck}
                        onChange={() => {
                            if (matricCheck.state !== 'idle') {
                                setMatricCheck({ state: 'idle', message: '' });
                            }
                        }}
                    />
                </Form.Item>

                <Form.Item label="Student Name (optional)" name="other_names">
                    <Input placeholder="Surname and other names" />
                </Form.Item>

                <Form.Item label="School" required>
                    <Select
                        placeholder="Select a school"
                        value={school || undefined}
                        onChange={(value) => {
                            setSchool(value);
                            form.setFieldsValue({ course: undefined });
                        }}
                        allowClear
                    >
                        {Object.keys(schoolsData).map((s) => (
                            <Option key={s} value={s}>{s}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Course"
                    name="course"
                    rules={[{ required: true, message: 'Course is required' }]}
                >
                    <Select placeholder="Select a course" disabled={!school} allowClear>
                        {courseOptions.map((c) => (
                            <Option key={c} value={c}>{c}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Study Centre"
                    name="desired_study_cent"
                    rules={[{ required: true, message: 'Study centre is required' }]}
                >
                    <Select placeholder="Select a study centre" allowClear>
                        {studyCentres.map((c) => (
                            <Option key={c} value={c}>{c}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={submitting}
                        icon={<UserAddOutlined />}
                        style={primaryButtonStyle}
                        disabled={matricCheck.state === 'taken'}
                    >
                        Add Student
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );

    const bulkTab = (
        <div style={cardStyle}>
            <Title level={4} style={{ textAlign: 'center', color: '#028f64', marginTop: 0 }}>
                Bulk Upload by Centre
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
                Upload a CSV or XLSX. Course headers separate sections; each student row needs a name and matric. Re-uploading the same file updates existing rows.
            </Text>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                    block
                    icon={<DownloadOutlined />}
                    onClick={onDownloadSample}
                >
                    Download Sample CSV
                </Button>

                <div>
                    <Text strong>Study Centre</Text>
                    <Select
                        placeholder="Select a study centre"
                        value={bulkCentre || undefined}
                        onChange={setBulkCentre}
                        allowClear
                        style={{ width: '100%', marginTop: 4 }}
                    >
                        {studyCentres.map((c) => (
                            <Option key={c} value={c}>{c}</Option>
                        ))}
                    </Select>
                </div>

                <Upload
                    accept=".csv,.xlsx"
                    maxCount={1}
                    beforeUpload={(file) => {
                        setBulkFile(file);
                        return false;
                    }}
                    onRemove={() => setBulkFile(null)}
                    fileList={bulkFile ? [{
                        uid: '-1',
                        name: bulkFile.name,
                        status: 'done',
                    }] : []}
                >
                    <Button icon={<UploadOutlined />} block>Select File (CSV / XLSX)</Button>
                </Upload>

                <Button
                    type="primary"
                    block
                    loading={uploading}
                    icon={<FileExcelOutlined />}
                    style={primaryButtonStyle}
                    onClick={onBulkUpload}
                    disabled={!bulkCentre || !bulkFile}
                >
                    Upload Students
                </Button>
            </Space>
        </div>
    );

    return (
        <div style={{ padding: '24px 16px' }}>
            <Title level={3} style={{ textAlign: 'center', color: '#028f64' }}>
                Add Students
            </Title>
            <Tabs
                defaultActiveKey="single"
                centered
                items={[
                    { key: 'single', label: 'Single Student', children: singleTab },
                    { key: 'bulk', label: 'Bulk by Centre', children: bulkTab },
                ]}
            />
        </div>
    );
};

export default AdminAddStudents;
