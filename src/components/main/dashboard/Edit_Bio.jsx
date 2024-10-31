import React, { Children, useState } from 'react';
import { Form, Input,Breadcrumb, Button, Col, Card, Row, Select, DatePicker, Typography } from 'antd';

import './BioData.css';
import moment from 'moment';
import { IeOutlined, HomeFilled, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const bioData = {
    studentUniqueId: "d9ee9e172fc84a5dade49a8b1dfda58d",
    fullName: "ALAMBA DANIEL JUNIOR",
    email: "danielalamba15@gmail.com",
    phoneNumber: "08069592613",
    surName: "ALAMBA",
    firstName: "DANIEL",
    otherNames: "JUNIOR",
    photoId: "https://eduportalprodstg.blob.core.windows.net/eduportal-prod-ibbu-container/UNDERGRADUATE_PASSPORTS/d9ee9e172fc84a5dade49a8b1dfda58d.jpg",
    currentSemester: "SECOND SEMESTER",
    currentSession: "2023/2024",
    hasRegisteredForCurrentSession: false,
    hasHostelAccommodation: false,
    matricNumber: "U19/FNS/CSC/1007",
    level: "400",
    faculty: "NATURAL SCIENCES",
    facultyUniqueId: "b4e0d17c611c4229a1f6a2ed1bf21895",
    department: "COMPUTER SCIENCE",
    departmentUniqueId: "e07b4f9c479547d9b02e348d1c31e034",
    programme: "COMPUTER SCIENCE",
    programmeUniqueId: "8488fccc25e248aa8cc68a7d44a10f1b",
    gender: "MALE",
    dateOfBirth: "2001-10-03",
    placeOfBirth: "NIGER",
    maritalStatus: "SINGLE",
    religion: "CHRISTIAN",
    nationality: "NIGERIAN",
    state: "NIGER",
    lga: "BIDA",
    presentContactAddress: "MANDELA ROAD",
    permanentHomeAddress: "MANDELA ROAD, MINNA, NIGER STATE",
    nextOfKin: "SOLOMON ALAMBA",
    nextOfKinAddress: "MANDELA ROAD, MINNA",
    nextOfKinPhoneNumber: "08089558655",
    nextOfKinRelationship: "SIBLING",
    sponsorType: "SPONSORED",
    sponsorAddress: "MANDELA ROAD, MINNA, NIGER",
    programType: "FIRST DEGREE",
    modeOfEntry: "UTME",
    studyMode: "FULL TIME",
    entryYear: "2019",
    programDuration: "4",
    awardInView: "B.SC",
    highestQualification: "SSCE: WAEC/NECO/NABTEB",
    healthStatus: "HEALTHY",
    bloodGroup: "O+",
    disability: "NONE",
    medication: "",
    extraActivities: "",
    hasUpdatedBioData: true,
    isActive: true,
    isSpillOver: false,
    hasPaidSchoolFee: true,
    hasPaidGstFee: true,
    hasPaidFacultyFee: true,
    hasPaidEntrepreneurshipFee: true,
    hasPaidSugFee: true,
    hasChangedDefaultPassword: true,
    hasPaidNanissFee: true,
    hasPaidHostelAccommodationFee: false,
    hasBookedHostelAccommodation: false,
    registrationNumber: "96829502BD"
  };
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

  const onFinish = (values) => {
    setLoading(true);
    console.log('Updated Values:', values);
    // Add API call here to save changes
    setLoading(false);
  };

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
        initialValues={{
          fullName: bioData.fullName,
          email: bioData.email,
          phoneNumber: bioData.phoneNumber,
          gender: bioData.gender,
          dateOfBirth: bioData.dateOfBirth ? moment(bioData.dateOfBirth) : null,
          placeOfBirth: bioData.placeOfBirth,
          maritalStatus: bioData.maritalStatus,
          religion: bioData.religion,
          nationality: bioData.nationality,
          faculty: bioData.faculty,
          department: bioData.department,
          programme: bioData.programme,
          level: bioData.level,
          currentSemester: bioData.currentSemester,
          currentSession: bioData.currentSession,
          matricNumber: bioData.matricNumber,
          modeOfEntry: bioData.modeOfEntry,
          studyMode: bioData.studyMode,
          entryYear: bioData.entryYear,
          programDuration: bioData.programDuration,
          awardInView: bioData.awardInView,
          presentContactAddress: bioData.presentContactAddress,
          permanentHomeAddress: bioData.permanentHomeAddress,
          nextOfKin: bioData.nextOfKin,
          nextOfKinPhoneNumber: bioData.nextOfKinPhoneNumber,
          nextOfKinRelationship: bioData.nextOfKinRelationship,
          sponsorAddress: bioData.sponsorAddress,
        }}
      >
        {/* Personal Information */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Full Name" name="fullName">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Email" name="email">
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Phone Number" name="phoneNumber">
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
            <Form.Item label="Date of Birth" name="dateOfBirth">
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
