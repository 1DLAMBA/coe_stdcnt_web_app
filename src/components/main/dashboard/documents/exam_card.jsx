import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  message,
  Button,
  Spin,
  Typography,
  Row,
  Col,
  Divider,
  Table,
  Tag,
  Avatar,
  Breadcrumb
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HomeFilled,
  DownloadOutlined
} from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import API_ENDPOINTS from '../../../../Endpoints/environment';
import './exam_card.css';
import logo from '../../../../assets/logo2.png';

const { Text } = Typography;

const ExamCard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const examCardRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
        const userData = userResponse.data;

        // Fetch user's courses
        const coursesResponse = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/courses/${id}`);
        const coursesData = coursesResponse.data;

        setUser(userData);
        setCourses(coursesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load exam card data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const ensureCoursePaid = useCallback(() => {
    if (!user?.course_paid) {
      message.error('You need to pay for your courses before downloading the exam card');
      navigate(`/dashboard/${id}/course_reg`);
      return false;
    }
    return true;
  }, [user?.course_paid, id, navigate]);

  const handleDownloadPdf = useCallback(async () => {
    if (!ensureCoursePaid()) return;
    if (!examCardRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(examCardRef.current, {
        scale: 1.25,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.78);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // ~40% total padding (20% each side) so the card sits compact and centered on the page
      const paddingRatio = 0.2;
      const maxWidth = pageWidth * (1 - paddingRatio * 2);
      const maxHeight = pageHeight * (1 - paddingRatio * 2);
      const ratio = canvas.width / canvas.height;
      let imgWidth = maxWidth;
      let imgHeight = imgWidth / ratio;
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * ratio;
      }
      const offsetX = (pageWidth - imgWidth) / 2;
      const offsetY = (pageHeight - imgHeight) / 2;
      const boxPadding = 4;
      pdf.setDrawColor(217, 217, 217);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(
        offsetX - boxPadding,
        offsetY - boxPadding,
        imgWidth + boxPadding * 2,
        imgHeight + boxPadding * 2,
        2,
        2,
        'S'
      );
      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgWidth, imgHeight, undefined, 'FAST');
      const matric = (user?.matric_number || 'exam-card').replace(/[^A-Za-z0-9_-]+/g, '_');
      pdf.save(`exam-card-${matric}.pdf`);
    } catch (error) {
      console.error('Failed to generate exam card PDF:', error);
      message.error('Could not generate the exam card PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [ensureCoursePaid, user?.matric_number]);

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'Course Type',
      dataIndex: 'course_type',
      key: 'course_type',
      render: (text) => (
        <Tag className="exam-card-tag" color={text === 'core' ? 'blue' : 'green'}>
          {text?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
   function itemRender(currentRoute, params, items, paths) {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;

    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={`/${paths.join("/")}`}>{currentRoute.title}</Link>
    );
  }
  const items = [
    {
      path: `/Dashboard/${id}`,
      title: <HomeFilled />,
    },

    {
      path: `/Dashboard/${id}/course_reg`,
      title: 'Course Registration',

    },

    {
      path: `/Dashboard/${id}/exam_card`,
      title: 'Exam Card',

    },

  ];

  return (
  <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
  
      <Breadcrumb style={{  marginTop: '1%', marginBottom: '1%', marginRight: '1%', backgroundColor: 'white', width: '82.5%', color: 'white', borderRadius: '15px', padding: '0.5%' }} itemRender={itemRender} items={items} />
    <div className="exam-card-container">

      <div className="print-button-container">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPdf}
          loading={downloading}
          className="print-button"
          style={{ backgroundColor: '#028f64', borderColor: '#028f64' }}
        >
          Download PDF
        </Button>
      </div>

      <div className="exam-card" ref={examCardRef}>
        <div className="exam-card-header">
          <img src={logo} alt="School Logo" className="school-logo" />
          <p className="exam-card-institution">College of Education</p>
          <p className="exam-card-subtitle">Examination Card</p>
        </div>

        <Divider className="exam-card-divider" />

        <div className="student-info">
          <Row gutter={[8, 6]}>
            <Col span={24} className="exam-card-photo-col">
              <Avatar
                size={52}
                src={user?.passport ? `${API_ENDPOINTS.API_BASE_URL}/file/get/${user.passport}` : undefined}
                icon={!user?.passport && <UserOutlined />}
                className="profile-pic"
                style={{ backgroundColor: '#028f64' }}
              />
            </Col>
            <Col span={12}>
              <div className="exam-card-field">
                <Text className="exam-card-label" strong><UserOutlined /> Full Name</Text>
                <Text className="exam-card-value">{user?.surname} {user?.other_names}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="exam-card-field">
                <Text className="exam-card-label" strong><FileTextOutlined /> Matric No.</Text>
                <Text className="exam-card-value">{user?.matric_number}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="exam-card-field">
                <Text className="exam-card-label" strong><BookOutlined /> Course</Text>
                <Text className="exam-card-value">{user?.course}</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="exam-card-field">
                <Text className="exam-card-label" strong><EnvironmentOutlined /> Study Center</Text>
                <Text className="exam-card-value">{user?.desired_study_cent}</Text>
              </div>
            </Col>
          </Row>
        </div>

        <Divider className="exam-card-divider" />

        <div className="courses-section">
          <p className="exam-card-section-title">Registered Courses</p>
          <Table
            className="exam-card-table"
            columns={columns}
            dataSource={courses}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
          />
        </div>

        <div className="exam-card-footer">
          <div className="signature-section">
            <div className="signature-box">
              <Text className="exam-card-signature-label">Student&apos;s Signature</Text>
              <div className="signature-line" />
            </div>
            <div className="signature-box">
              <Text className="exam-card-signature-label">Examination Officer&apos;s Signature</Text>
              <div className="signature-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ExamCard;
