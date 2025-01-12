import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Typography, Row, message, Steps, theme, Card, Col, ConfigProvider, Divider } from 'antd';
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import './style.css';
import logo from '../../assets/logo2.png';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { PaystackButton } from "react-paystack";
import API_ENDPOINTS from '../../Endpoints/environment';

const steps = [
  {
    title: 'Personal Particulars',
    content: 'First-content',
    icon: <UserOutlined />
  },
  {
    title: 'School Details',
    content: 'Second-content',
  },
  {
    title: 'Educational Qualifications',
    content: 'Last-content',
  },
];

const schoolsData = {
  "School of Sciences": [
    "Mathematics / Geography",
    "Maths / Economics",
    "Maths / Biology",
    "Maths / Special Education",
    "Integrated Sciences (Double Major)",
    "Biology / Geography",
    "PHE (Double Major)",
    "Biology / Special Education",
  ],
  "School of Technical Education": [
    "Technical Education Double Major",
    "Electrical / Electronics",
    "Automobile",
    "Building",
    "Wood Work",
    "Metal Work",
  ],
  "School of Arts and Social Sciences": [
    "Geography / History",
    "Geography / Economics",
    "Geography / Social Studies",
    "History / CRS",
    "History / Islamic Studies",
    "Social Studies / Economics",
    "Social Studies / CRS",
    "Social Studies / Islamic Studies",
    "Islamic Studies / Special Education",
    "Eco / Special Education",
    "CRS / Special Education",
    "History / Special Education",
  ],
  "School of Education": [
    "Primary Education Studies (Double Major)",
    "Early Childhood Care Education (Double Major)",
  ],
  "School of Languages": [
    "English / History",
    "English / CRS",
    "English / Arabic",
    "English / Hausa",
    "English / Social Studies",
    "Hausa / Islamic Studies",
    "Hausa / Arabic",
    "Hausa / Social Studies",
    "Arabic / Islamic Studies",
    "Arabic / Social Studies",
    "English / Special Education",
    "Hausa / Special Education",
  ],
  "School of Vocational Education": [
    "Agricultural Science Education (Double Major)",
    "Home Economics (Double Major)",
    "Business Education (Double Major)",
  ],
};

const { Title, Text } = Typography;
const { Option } = Select;

const Registration = () => {
  const publicKey = "pk_test_3fbb14acfe497c070f67293c2f7f6bcb1b9228a9";
  const [step, setStep] = useState('step1')
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [examTypes, setExamTypes] = useState([]);
  const [grades, setGrades] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("");
  const [firstStep, setFirstStep] = useState({});
  const [secondStep, setSecondStep] = useState(null);
  const [thirdStep, setThirdStep] = useState(null);
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const amount = 200000;
  const [email, setEmail] = useState('danielalamba15@gmail.com');
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));



  const onFinish = async (values) => {
    if (step === 'step1') {
      setFirstStep(values)
      console.log('First Form Values:', firstStep);
      setStep('step2')
      next()
      window.scrollTo(0, 0)

    } else if (step === 'step2') {
      setSecondStep(values);
      console.log('second Form Values:', secondStep);
      console.log('First Form Values:', firstStep);
      next()
      window.scrollTo(0, 0)


      setStep('step3')
    } else {
      setThirdStep(values)
      // setEmail(firstStep.email);

      setStep('step4')

      // console.log(values)
      // const personalResponse = await axios.post(API_ENDPOINTS.PERSONAL_DETAILS, firstStep);
      // console.log(personalResponse);
      // const schoolResponse = await axios.post(API_ENDPOINTS.SCHOOL_DETAILS, secondStep);
      // console.log(schoolResponse);
      // const finalResponse = await axios.post(API_ENDPOINTS.EDUCATIONALS_APPLICATION, values)
      // console.log(finalResponse);



    }
  };

  const componentProps = {
    email,
    amount,
    metadata: {
      phone: firstStep.phone_number,
    },
    publicKey,
    text: "Pay Now",
    onSuccess: async (reference) => {
      sendDetails(reference)
    },
    onClose: () => alert("Wait! Don't leave :("),
  };

  const sendDetails = async (reference) => {
    try {
      // console.log(values)
      const adjustedDOB = firstStep.date_of_birth.format('YYYY-MM-DD');
      const personalFormData = { ...firstStep, application_number: reference.reference, date_of_birth: adjustedDOB };
      const personalResponse = await axios.post(API_ENDPOINTS.PERSONAL_DETAILS, personalFormData);
      console.log(personalResponse);

      const adjustedPSF1 = secondStep.p_school_from_1.format('YYYY-MM-DD');
      const adjustedPST1 = secondStep.p_school_to_1.format('YYYY-MM-DD');
      const adjustedPSF2 = secondStep.p_school_from_2.format('YYYY-MM-DD');
      const adjustedPST2 = secondStep.p_school_to_2.format('YYYY-MM-DD');

      const adjustedSSF1 = secondStep.s_school_from_1.format('YYYY-MM-DD');
      const adjustedSST1 = secondStep.s_school_to_1.format('YYYY-MM-DD');
      const adjustedSSF2 = secondStep.s_school_from_2.format('YYYY-MM-DD');
      const adjustedSST2 = secondStep.s_school_to_2.format('YYYY-MM-DD');
      
      const schoolFormData = { 
        ...secondStep,
         application_number: reference.reference,
        p_school_from_1: adjustedPSF1,
        p_school_to_1:adjustedPST1,
        p_school_from_2:adjustedPSF2,
        p_school_to_2:adjustedPST2,
        s_school_from_1: adjustedSSF1,
        s_school_to_1:adjustedSST1,
        s_school_from_2:adjustedSSF2,
        s_school_to_2:adjustedSST2,
      
      }
      const schoolResponse = await axios.post(API_ENDPOINTS.SCHOOL_DETAILS, schoolFormData);
      console.log(schoolResponse);


      const educationFormData = { ...thirdStep, application_number: reference.reference }
      const finalResponse = await axios.post(API_ENDPOINTS.EDUCATIONALS_APPLICATION, educationFormData)
      console.log(finalResponse);
      if (finalResponse) {

        // Store the ID from the response
        // localStorage.setItem("id", response.data.data.id);

        // Navigate to the dashboard
        navigate('/dashboard');
      } else {
        console.error("No ID returned in the response.");
        alert("Payment successful, but we couldn't process your data. Please contact support.");
      }
    } catch (error) {
      console.error("Error sending user data:", error);
      alert("An error occurred while processing your payment. Please try again.");
    }
  }

  function stepper() {
    if (step === 'step1') {

      setStep('step2')
    } else if (step === 'step2') {
      setStep('step3')
    } else {
      return;
    }

  }
  function stepback() {
    if (step === 'step4') {
      setStep('step3')
      prev()
      window.scrollTo(0, 0)

    }else if (step === 'step3') {

      setStep('step2')
      prev()
      window.scrollTo(0, 0)

    } else if (step === 'step2') {
      setStep('step1')
      prev()
      window.scrollTo(0, 0)

    } else {
      return;
    }

  }

  const handleSchoolChange = (value) => {
    setSelectedSchool(value); // Update the state when a school is selected
  };

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
  };

  useEffect(() => {
    // Mock API data
    setExamTypes([
      { id: 1, exam_type: "WAEC", exam_code: "W" },
      { id: 3, exam_type: "NECO", exam_code: "N" },
      { id: 6, exam_type: "NABTEB", exam_code: "T" },
      { id: 7, exam_type: "GRADE II TEACHERS CERT.", exam_code: "G" },
      { id: 8, exam_type: "NBAIS", exam_code: "NB" },
    ]);

    setGrades({
      W: ["A1", "B2", "B3", "C4", "C5", "C6", "A.R"],
      N: ["A1", "B2", "B3", "C4", "C5", "C6", "A.R"],
      T: ["A1", "B2", "B3", "C4", "C5", "C6", "A.R"],
      G: ["A", "B", "C", "D", "A.R"],
      NB: ["A", "B2", "B3", "C5", "C6", "A.R"],
    });

    setSubjects([
      "Mathematics",
      "English Language",
      "Biology",
      "Chemistry",
      "Physics",
      "Geography",
      "Economics",
    ]);
  }, []);

  const handleExamTypeChange = (value) => {
    setSelectedExamType(value);
  };

  return (
    <>


      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="header">
          <span style={{ margin: 'auto', display: 'flex' }}>


            <img
              src={logo}
              alt="College Logo"
              className="form-logo"
            />
            <Title level={3} className="form-title">
              Niger State College of Education, Minna
            </Title>
          </span>
        </div>
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="application-form"
        >
          <div className="form-container">
            <div className="form-header">

              <b className="form-subtitle">
                Application for Admission into NCE Programme (LVSP)
              </b>
              <ConfigProvider
                theme={{
                  token: {
                    // Seed Token
                    colorPrimary: '#028f64',
                    borderRadius: 2,

                    // Alias Token
                    colorText: 'white',
                    colorBgContainer: '#f6ffed',
                  },
                }}
              >
                {/* <Steps current={current} items={items} style={{color:'white'}} /> */}
              </ConfigProvider>
            </div>
            {step === 'step1' && (
              <div style={{ padding: '1% 2%' }}>
                <ConfigProvider
                  theme={{
                    token: {
                      // Seed Token
                      colorPrimary: '#028f64',
                      borderRadius: 2,

                      // Alias Token
                      colorText: '#028f64',
                      colorBgContainer: '#f6ffed',
                    },
                  }}
                >


                  <Steps
                    items={[
                      {
                        title: 'Personal Particulars',
                        status: 'process',
                        icon: <UserOutlined />,
                      },
                      {
                        title: 'School Details',
                        status: 'wait',
                        icon: <SolutionOutlined />,
                      },
                      {
                        title: 'Educational Qualifications',
                        status: 'wait',
                        icon: <SolutionOutlined />,
                      },
                      {
                        title: 'Done',
                        status: 'wait',
                        icon: <SmileOutlined />,
                      },
                    ]}
                    style={{ marginBottom: '2%' }}
                  />
                </ConfigProvider>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Surname"
                      name="surname"
                      rules={[{ required: true, message: 'Please enter your surname' }]}
                    >
                      <Input placeholder="Enter your surname" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Other Names"
                      name="other_names"
                      rules={[{ required: true, message: 'Please enter your other names' }]}
                    >
                      <Input placeholder="Enter your other names" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Marital Status"
                      name="marital_status"
                      rules={[{ required: true, message: 'Please select your marital status' }]}
                    >
                      <Select placeholder="Select marital status">
                        <Option value="single">Single</Option>
                        <Option value="married">Married</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Date of Birth"
                      name="date_of_birth"
                      rules={[{ required: true, message: 'Please select your date of birth' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={24}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[{ required: true, message: 'Please enter your Address' }]}
                    >
                      <Input placeholder="Enter your Address" />
                    </Form.Item>
                  </Col>

                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={12} md={8}>
                    <Form.Item
                      label="Local Government"
                      name="local_government"
                      rules={[{ required: true, message: 'Please enter your local government' }]}
                    >
                      <Input placeholder="Enter your local government" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8}>
                    <Form.Item
                      label="State of Origin"
                      name="state_of_origin"
                      rules={[{ required: true, message: 'Please enter your state of origin' }]}
                    >
                      <Input placeholder="Enter your state of origin" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8}>
                    <Form.Item
                      label="Ethnic Group"
                      name="ethnic_group"
                      rules={[{ required: true, message: 'Please enter your Ethnic Group' }]}
                    >
                      <Input placeholder="Enter your Ethnic Group" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Religion"
                      name="religion"
                      rules={[{ required: true, message: 'Please enter your religion' }]}
                    >
                      <Input placeholder="Enter your religion" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Phone Number"
                      name="phone_number"
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <Input placeholder="Enter your phone number" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={12} md={8}>
                    <Form.Item
                      label="Name of Father"
                      name="name_of_father"
                      rules={[{ required: true, message: "Please enter your Father's name" }]}
                    >
                      <Input placeholder="Enter your Father's name" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8}>
                    <Form.Item
                      label="Father's State of Origin"
                      name="father_state_of_origin"
                      rules={[{ required: true, message: "Please enter your Father's State of Origin" }]}
                    >
                      <Input placeholder="Enter your Father's State of Origin" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8}>
                    <Form.Item
                      label="Father's Place of Birth"
                      name="father_place_of_birth"
                      rules={[{ required: true, message: "Please enter your Father's Place of Birth" }]}
                    >
                      <Input placeholder="Enter your Father's Place of Birth" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>

                    <Form.Item
                      label="Mother's Place of Birth"
                      name="mother_place_of_birth"
                      rules={[{ required: true, message: "Please enter your Mother's Place of Birth" }]}
                    >
                      <Input placeholder="Enter your Mother's Place of Birth" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>

                    <Form.Item
                      label="Mother's State of Origin"
                      name="mother_state_of_origin"
                      rules={[{ required: true, message: "Please enter your Mother's State of Origin" }]}
                    >
                      <Input placeholder="Enter your Mother's State of Origin" />
                    </Form.Item>
                  </Col>

                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={12} md={8}>


                    <Form.Item
                      label="Applicant's Occupation"
                      name="applicant_occupation"
                      rules={[{ required: true, message: "Please enter your Occupation" }]}
                    >
                      <Input placeholder="Enter your Occupation" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8}>


                    <Form.Item
                      label="Working Experience"
                      name="working_experience"
                      rules={[{ required: true, message: "Please enter your Working Experience" }]}
                    >
                      <Input placeholder="Enter your Working Experience" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={8}>


                    <Form.Item
                      label="Centre Location"
                      name="desired_study_cent"
                      rules={[{ required: true, message: "Please enter your Centre Location" }]}
                    >
                      <Input placeholder="Enter your Centre Location" />
                    </Form.Item>
                  </Col>

                </Row>

              </div>
            )}
            {step === 'step2' && (
              <div style={{ padding: '1% 2%' }}>
                <ConfigProvider
                  theme={{
                    token: {
                      // Seed Token
                      colorPrimary: '#028f64',
                      borderRadius: 2,

                      // Alias Token
                      colorText: '#028f64',
                      colorBgContainer: '#f6ffed',
                    },
                  }}
                >

                  <Steps
                    items={[
                      {
                        title: 'Personal Particulars',
                        status: 'finish',
                        icon: <UserOutlined />,
                      },
                      {
                        title: 'School Details',
                        status: 'process',
                        icon: <SolutionOutlined />,
                      },
                      {
                        title: 'Educational Qualifications',
                        status: 'wait',
                        icon: <SolutionOutlined />,
                      },

                      {
                        title: 'Done',
                        status: 'wait',
                        icon: <SmileOutlined />,
                      },
                    ]}
                    style={{ marginBottom: '2%' }}
                  />
                </ConfigProvider>

                <div style={{ padding: "20px" }}>
                  <h2>School and Course Selection</h2>

                  {/* School Dropdown */}

                  <h4>School Attended</h4>
                  <h5>Primary</h5>
                  <Row gutter={[16, 16]}>

                    <b>1</b>
                    <Col xs={12} md={8}>
                      <Form.Item
                        label="School Name"
                        name="p_school_name_1"
                        rules={[{ required: true, message: "Please enter School Name" }]}
                      >
                        <Input placeholder="Enter School name" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="From"
                        name="p_school_from_1"
                        rules={[{ required: true, message: "Please enter your arrival date in the school" }]}
                      >
                        <DatePicker style={{ width: '100%' }} />

                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="To"
                        name="p_school_to_1"
                        rules={[{ required: true, message: "Please enter when you exited the school" }]}
                      >
                        <DatePicker style={{ width: '100%' }} />

                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>

                    <b>2</b>
                    <Col xs={12} md={8}>
                      <Form.Item
                        label="School Name"
                        name="p_school_name_2"

                      >
                        <Input placeholder="Enter School name" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="From"
                        name="p_school_from_2"
                      >
                        <DatePicker style={{ width: '100%' }} />

                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="To"
                        name="p_school_to_2"
                      >
                        <DatePicker style={{ width: '100%' }} />

                      </Form.Item>
                    </Col>
                  </Row>


                  <h5>Secondary</h5>
                  <Row gutter={[16, 16]}>

                    <b>1</b>
                    <Col xs={12} md={8}>
                      <Form.Item
                        label="School Name"
                        name="s_school_name_1"
                        rules={[{ required: true, message: "Please enter School Name" }]}
                      >
                        <Input placeholder="Enter School name" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="From"
                        name="s_school_from_1"
                        rules={[{ required: true, message: "Please enter your Father's State of Origin" }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="To"
                        name="s_school_to_1"
                        rules={[{ required: true, message: "Please enter your Father's Place of Birth" }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>

                    <b>2</b>
                    <Col xs={12} md={8}>
                      <Form.Item
                        label="School Name"
                        name="s_school_name_2"

                      >
                        <Input placeholder="Enter School name" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="From"
                        name="s_school_from_2"
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        label="To"
                        name="s_school_to_2"
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="choice">
                    <div>

                      <h5>First Choice</h5>
                      <div className="choice-sub">

                        <div style={{ marginBottom: "20px", marginRight: '1%' }}>
                          <Form.Item
                            label="Select School"
                            name="first_school"
                            rules={[
                              { required: true, message: "Please select a school!" },
                            ]}
                          >
                            <Select
                              placeholder="-- Select a School --"
                              value={selectedSchool}
                              onChange={handleSchoolChange}
                              allowClear
                            >
                              {Object.keys(schoolsData).map((school, index) => (
                                <Option key={index} value={school}>
                                  {school}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>

                        {/* Course Dropdown */}
                        <div style={{ marginBottom: "20px" }}>
                          <Form.Item
                            label="Select Course"
                            name="first_course"
                            rules={[
                              {
                                required: true,
                                message: "Please select a course!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="-- Select a Course --"
                              allowClear
                              value={selectedCourse}
                              disabled={!selectedSchool} // Disable if no school is selected
                            >
                              {selectedSchool &&
                                schoolsData[selectedSchool].map((course, index) => (
                                  <Option key={index} value={course}>
                                    {course}
                                  </Option>
                                ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div>

                      <h5>Second Choice</h5>
                      <div className="choice-sub">

                        <div style={{ marginBottom: "20px", marginRight: '1%' }}>
                          <Form.Item
                            label="Select School"
                            name="second_school"
                            rules={[
                              { required: true, message: "Please select a school!" },
                            ]}
                          >
                            <Select
                              placeholder="-- Select a School --"
                              value={selectedSchool}
                              onChange={handleSchoolChange}
                              allowClear
                            >
                              {Object.keys(schoolsData).map((school, index) => (
                                <Option key={index} value={school}>
                                  {school}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>

                        {/* Course Dropdown */}
                        <div style={{ marginBottom: "20px" }}>
                          <Form.Item
                            label="Select Course"
                            name="second_course"
                            rules={[
                              {
                                required: true,
                                message: "Please select a course!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="-- Select a Course --"
                              allowClear
                              value={selectedCourse}
                              disabled={!selectedSchool} // Disable if no school is selected
                            >
                              {selectedSchool &&
                                schoolsData[selectedSchool].map((course, index) => (
                                  <Option key={index} value={course}>
                                    {course}
                                  </Option>
                                ))}
                            </Select>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                  </div>



                  {/* Display Selected Values */}
                  {/* <div>
                    <p>
                        <strong>Selected School:</strong> {selectedSchool || "None"}
                    </p>
                    <p>
                        <strong>Selected Course:</strong> {selectedCourse || "None"}
                    </p>
                </div> */}
                </div>
              </div>
            )}
            {step === 'step3' && (
              <>

                <div style={{ padding: "30px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                  <ConfigProvider
                    theme={{
                      token: {
                        // Seed Token
                        colorPrimary: '#028f64',
                        borderRadius: 2,

                        // Alias Token
                        colorText: '#028f64',
                        colorBgContainer: '#f6ffed',
                      },
                    }}
                  >

                    <Steps
                      items={[
                        {
                          title: 'Personal Particulars',
                          status: 'finish',
                          icon: <UserOutlined />,
                        },
                        {
                          title: 'School Details',
                          status: 'finish',
                          icon: <SolutionOutlined />,
                        },
                        {
                          title: 'Educational Qualifications',
                          status: 'process',
                          icon: <SolutionOutlined />,
                        },

                        {
                          title: 'Done',
                          status: 'wait',
                          icon: <SmileOutlined />,
                        },
                      ]}
                      style={{ marginBottom: '2%' }}
                    />
                  </ConfigProvider>
                  <Card
                    style={{
                      maxWidth: "1200px",
                      margin: "0 auto",
                      borderRadius: "10px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h2 style={{ textAlign: "center", color: "#028f64", marginBottom: "20px" }}>
                      Examination Details Form
                    </h2>

                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          label="Examination Type"
                          name="exam_type"
                          rules={[{ required: true, message: "Please select an exam type!" }]}
                        >
                          <Select placeholder="Select Type" onChange={handleExamTypeChange}>
                            {examTypes.map((exam) => (
                              <Option key={exam.id} value={exam.exam_code}>
                                {exam.exam_type}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="Examination Number"
                          name="exam_number"
                          rules={[{ required: true, message: "Please enter the exam number!" }]}
                        >
                          <Input placeholder="Enter Examination Number" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="Examination Month"
                          name="exam_month"
                          rules={[{ required: true, message: "Please select the month!" }]}
                        >
                          <Select placeholder="Select Month">
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
                              (month) => (
                                <Option key={month} value={month}>
                                  {month}
                                </Option>
                              )
                            )}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="Examination Year"
                          name="exam_year"
                          rules={[{ required: true, message: "Please enter the year!" }]}
                        >
                          <Input placeholder="Enter Examination Year" />
                        </Form.Item>
                      </Col>
                    </Row>

                    {[...Array(9)].map((_, index) => (
                      <Row gutter={24} key={index}>
                        <Col span={12}>
                          <Form.Item
                            label={`Subject ${index + 1}`}
                            name={`subject_${index + 1}`}
                            rules={[{ required: index < 5, message: "Please select a subject!" }]}
                          >
                            <Select placeholder="Select Subject">
                              {subjects.map((subject) => (
                                <Option key={subject} value={subject}>
                                  {subject}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label={`Grade ${index + 1}`}
                            name={`grade_${index + 1}`}
                            rules={[{ required: index < 5, message: "Please select a grade!" }]}
                          >
                            <Select placeholder="Select Grade" disabled={!selectedExamType}>
                              {(grades[selectedExamType] || []).map((grade) => (
                                <Option key={grade} value={grade}>
                                  {grade}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}


                  </Card>
                </div>
              </>
            )}

            {step === 'step4' && (
                         <div style={{ padding: '1% 2%' }}>

                <ConfigProvider
                  theme={{
                    token: {
                      // Seed Token
                      colorPrimary: '#028f64',
                      borderRadius: 2,

                      // Alias Token
                      colorText: '#028f64',
                      colorBgContainer: '#f6ffed',
                    },
                  }}
                >

                  <Steps
                    items={[
                      {
                        title: 'Personal Particulars',
                        status: 'finish',
                        icon: <UserOutlined />,
                      },
                      {
                        title: 'School Details',
                        status: 'finish',
                        icon: <SolutionOutlined />,
                      },
                      {
                        title: 'Educational Qualifications',
                        status: 'finish',
                        icon: <SolutionOutlined />,
                      },

                      {
                        title: 'Done',
                        status: 'process',
                        icon: <SmileOutlined />,
                      },
                    ]}
                    style={{ marginBottom: '2%' }}
                  />
                </ConfigProvider> <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <Card
        style={{
          width: 400,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
        title={<Title level={4}>Complete Your Application</Title>}
      >
        <Text style={{ fontSize: "16px" }}>
          To submit your application, you need to pay the application fee.
        </Text>
        <Divider />
        <div style={{ margin: "1rem 0" }}>
        {/* <Form
          layout="vertical"
          onFinish={handleEmail}
          className="application-form"
        >
          <Col xs={12} md={8}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Please enter Email" }]}
                      >
                        <Input placeholder="Enter School name" />
                      </Form.Item>
                    </Col>
          </Form> */}
          <Text strong style={{ fontSize: "18px", color: "#028f64" }}>
            Fee Amount: ₦5,000
          </Text>
        </div>
        
        <PaystackButton className='btn btn-green' {...componentProps} />

        <Divider />
        <Button type="link" style={{ color: "#028f64" }}>
          Need help with payment?
        </Button>
      </Card>
    </div>
              </div>
            )}
            <div style={{ display: 'flex', padding: '2%' }}>


              <Button color='danger' onClick={stepback}>
                Back
              </Button> &nbsp;
              <ConfigProvider
                theme={{
                  token: {
                    // Seed Token
                    colorPrimary: '#028f64',
                    borderRadius: 2,

                    // Alias Token
                    colorText: 'white',
                    colorBgContainer: '#f6ffed',
                  },
                }}
              >
                <Button
                  // type="primary"
                  htmlType="submit"
                  block
                  style={{
                    backgroundColor: "#028f64",
                    borderColor: "#028f64",
                    padding: "10px 40px",
                    color: 'white',
                    width: 'max-content'
                  }}
                >
                  Proceed
                </Button>
              </ConfigProvider>
            </div>
          </div>

        </Form>

      </div>



    </>

  );
};

export default Registration;
