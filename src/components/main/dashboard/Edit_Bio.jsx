import React, { Children, useState , useEffect} from 'react';
import { Form, Input,Breadcrumb, Button, Col, Card, Row, Select, DatePicker, Typography } from 'antd';

import './BioData.css';
import moment from 'moment';
import { IeOutlined, HomeFilled, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

  const items = [
    {
      path: '/Dashboard',
      title: <HomeFilled />,
    },
    
    {
      path: '/Bio-data',
      title: 'Bio-data',
      Children: [{
        
      }]
    },
    {
      path: '/Edit',
      title: 'Edit',
    },
  ];
  
  function itemRender(currentRoute, params, items, paths) {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;
  
    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={`/${paths.join("/")}`}>{currentRoute.title}</Link>
    );
  }

const Edit_Bio = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bioData, setBioData] = useState('');
  const userId=localStorage.getItem('id')
  let initialValues;



  const onFinish = async (values) => {
    setLoading(true);
    console.log('Updated Values:', values);

    try {
        // Create an instance of FormData
        const formData = new FormData();
        
        // Append the userId
        formData.append('application_id', userId);

        // Append all the other form values
        Object.keys(values).forEach((key) => {
            formData.append(key, values[key]);
        });

        // Send the form data via Axios
        const response = await axios.post(`http://127.0.0.1:8000/api/bio-data`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Response:', response.data);
        // location.href = '/Bio-Data'
        // Handle success (e.g., display a success message or update the UI)
    } catch (error) {
        console.error('Error saving bio-data:', error);
        // Handle error (e.g., display an error message)
    } finally {
        setLoading(false);
    }
};

  const get_user=async ()=>{
    await axios.get()
  }

  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      console.log('check', userId)
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/bio-data/${userId}`);
        const bio= await response.json()
        setBioData(bio.data.data[0]); // Assuming the API returns user data in `response.data`
        console.log('Data',bioData);
      initialValues ={
          full_name: bioData?.full_name,
          email: bioData?.email,
          phone_number: bioData?.phone_number,
          gender: bioData?.gender,
          dateOfBirth: bioData?.dateOfBirth ? moment(bioData?.dateOfBirth) : null,
          placeOfBirth: bioData?.placeOfBirth,
          maritalStatus: bioData?.maritalStatus,
          religion: bioData?.religion,
          nationality: bioData?.nationality,
          faculty: bioData?.faculty,
          department: bioData?.department,
          programme: bioData?.programme,
          level: bioData?.level,
          currentSemester: bioData?.currentSemester,
          currentSession: bioData?.currentSession,
          matricNumber: bioData?.matricNumber,
          modeOfEntry: bioData?.modeOfEntry,
          studyMode: bioData?.studyMode,
          entryYear: bioData?.entryYear,
          programDuration: bioData?.programDuration,
          awardInView: bioData?.awardInView,
          presentContactAddress: bioData?.presentContactAddress,
          permanentHomeAddress: bioData?.permanentHomeAddress,
          nextOfKin: bioData?.nextOfKin,
          nextOfKinPhoneNumber: bioData?.nextOfKinPhoneNumber,
          nextOfKinRelationship: bioData?.nextOfKinRelationship,
          sponsorAddress: bioData?.sponsorAddress,
        }

        console.log('initial values', initialValues)
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUser(); // Call the async function to fetch data
    }
  }, [userId]); // Only re-run if `userId` changes




  return (
    <>
    
    <div className="bio-data-container">
    <Breadcrumb style={{marginRight:'auto'}} itemRender={itemRender} items={items} />

      <Card bordered  className="bio-data-card">

      <Title level={2} className="form-title">Edit Bio Data</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        values={initialValues}
      >
        {/* Personal Information */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Full Name" name="full_name" > 
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Email" name="email">
              <Input  />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Phone Number" name="phone_number">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Gender" name="gender">
              <Select>
                <Option value="M">Male</Option>
                <Option value="F">Female</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Date of Birth" name="date_of_Birth">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Place of Birth" name="placeOfBirth">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Marital Status" name="maritalStatus">
              <Select>
                <Option value="Single">Single</Option>
                <Option value="Married">Married</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Religion" name="religion">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Nationality" name="nationality">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Academic Information */}
        <Title level={4} className="section-title">Academic Information</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Faculty" name="faculty">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Department" name="department">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Programme" name="programme">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Level" name="level">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Current Semester" name="currentSemester">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Session" name="currentSession">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Matric Number" name="matricNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Mode of Entry" name="modeOfEntry">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Study Mode" name="studyMode">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Entry Year" name="entryYear">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Program Duration" name="programDuration">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Award in View" name="awardInView">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Contact Information */}
        <Title level={4} className="section-title">Contact Information</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Present Address" name="presentContactAddress">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Permanent Address" name="permanentHomeAddress">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Next of Kin" name="nextOfKin">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Next of Kin Phone Number" name="nextOfKinPhoneNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Relationship with Next of Kin" name="nextOfKinRelationship">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Sponsor Address" name="sponsorAddress">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="center">
          <Button type="primary" htmlType="submit" loading={loading} className="submit-btn">
            Save Changes
          </Button>
        </Row>
      </Form>
      </Card >
    </div>
    </>
  );
};

export default Edit_Bio;
