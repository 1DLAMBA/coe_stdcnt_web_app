import React, { Children, useState , useEffect} from 'react';
import { Form, Input,Breadcrumb, Button, Col, Card, Row, Select, DatePicker, Typography } from 'antd';
import moment from "moment";
import './BioData.css';
import { IeOutlined, HomeFilled, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const [initialValues, setInitialValues] = useState({}); // State for form initial values
  const { id } = useParams();





  const onFinish = async (values) => {
    setLoading(true);
    console.log('Updated Values:', values);

    try {
        // Create an instance of FormData
        const formData = new FormData();
        
        // Append the userId
        formData.append('application_id', userId);

        // Append all the other form values
       // Append all the other form values
       Object.keys(values).forEach((key) => {
        // Handle the DatePicker field specifically
        if (key === 'date_of_birth' && values[key]) {
            // Format the date using moment.js
            formData.append(key, values[key].format('YYYY-MM-DD'));
        } else {
            // Append other fields as is
            formData.append(key, values[key]);
        }
    });

        // Send the form data via Axios
        const response = await axios.post(`http://127.0.0.1:8000/api/bio-data`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Response:', response.data);
        
  window.location.href = '/dashboard/bio-data';
        // Handle success (e.g., display a success message or update the UI)
    } catch (error) {
        console.error('Error saving bio-data:', error);
        // Handle error (e.g., display an error message)
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user data for:", userId);
        const response = await axios.get(`http://127.0.0.1:8000/api/bio-data/${userId}`);
        setBioData(response.data.data[0]); // Assuming the API returns an array in `data`
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    if (bioData) {
      setInitialValues({
        full_name: bioData?.full_name,
        email: bioData?.email,
        phone_number: bioData?.phone_number,
        gender: bioData?.gender,
        date_of_birth: bioData?.date_of_birth ? moment(bioData?.date_of_birth) : null,
        place_of_birth: bioData?.place_of_birth,
        marital_status: bioData?.marital_status,
        religion: bioData?.religion,
        nationality: bioData?.nationality,
        faculty: bioData?.faculty,
        department: bioData?.department,
        programme: bioData?.programme,
        level: bioData?.level,
        current_semester: bioData?.current_semester,
        current_session: bioData?.current_session,
        matric_number: bioData?.matric_number,
        mode_of_entry: bioData?.mode_of_entry,
        study_mode: bioData?.study_mode,
        entry_year: bioData?.entry_year,
        program_duration: bioData?.program_duration,
        award_in_view: bioData?.award_in_view,
        present_contact_address: bioData?.present_contact_address,
        permanent_home_address: bioData?.permanent_home_address,
        next_of_kin: bioData?.next_of_kin,
        next_of_kin_phone_number: bioData?.next_of_kin_phone_number,
        next_of_kin_relationship: bioData?.next_of_kin_relationship,
        sponsor_address: bioData?.sponsor_address,
      });

      console.log("Initial values updated:", initialValues);
    }
  }, [bioData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);


  return (
    <>
    
    <Breadcrumb style={{marginLeft:'8.7%', marginTop: '1%', backgroundColor:'white', width:'82.5%', color:'white', borderRadius:'15px', padding:'0.5%'}} itemRender={itemRender} items={items} />
    <div className="bio-data-container">

      <div bordered  className="bio-data-card">
      <div style={{ textAlign: 'center',backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center', marginBottom:'1%'}}>
        <Title level={2} style={{ color: '#fff' }}>Edit Bio Data</Title>

        </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        values={initialValues}
        style={{margin:'5%'}}
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
            <Form.Item label="Date of Birth" name="date_of_birth">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Place of Birth" name="place_of_birth">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Marital Status" name="marital_status">
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
            <Form.Item label="Current Semester" name="current_semester">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Session" name="current_session">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Matric Number" name="matric_number">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Mode of Entry" name="mode_of_entry">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Study Mode" name="study_mode">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Entry Year" name="entry_year">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Program Duration" name="program_duration">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Award in View" name="award_in_view">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Contact Information */}
        <Title level={4} className="section-title">Contact Information</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Present Address" name="present_contact_address">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Permanent Address" name="permanent_home_address">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Next of Kin" name="next_of_kin">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Next of Kin Phone Number" name="next_of_kin_phone_number">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Relationship with Next of Kin" name="next_of_kin_relationship">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Sponsor Address" name="sponsor_address">
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
      </div >
    </div>
    </>
  );
};

export default Edit_Bio;
