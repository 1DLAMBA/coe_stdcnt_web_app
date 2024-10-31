import React, {useState} from 'react';
import { Card, Row, Col, Avatar, Typography, Divider, Descriptions, Badge, Button, ConfigProvider, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
// import { useResponsive } from 'antd-style';

import './BioData.css'; // Import custom CSS for dark green theme
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const BioData = () => {
  // const { xxl } = useResponsive();
    const [viewBio, setViewBio] = useState(true)
    const [editBio, setEditBio] = useState(false)
  const navigate = useNavigate();

  function routeEdit(){
    navigate('/Dashboard/Edit')
  }

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
      
      return (
        <div className="bio-data-container">
          <Card bordered={false} className="bio-data-card">
          <Button color="danger" onClick={routeEdit} variant="outlined">
            Edit
          </Button>
            <Row gutter={[16, 16]} justify="center">
              {/* Profile Section */}
              <Col xs={24} sm={24} md={8} lg={6} className="profile-section">
                <Avatar
                  size={140}
                  src={bioData.photoId}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <Title level={3} className="name">
                  {bioData.fullName}
                </Title>
                <Text className="matric-number">{bioData.matricNumber}</Text>
              </Col>
    
              {/* Basic Information Section */}
              <Col xs={24} sm={24} md={16} lg={18}>
                <Descriptions title="Personal Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
                  <Descriptions.Item label="Email">{bioData.email}</Descriptions.Item>
                  <Descriptions.Item label="Phone Number">{bioData.phoneNumber}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{bioData.gender}</Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">{bioData.dateOfBirth}</Descriptions.Item>
                  <Descriptions.Item label="Place of Birth">{bioData.placeOfBirth}</Descriptions.Item>
                  <Descriptions.Item label="Marital Status">{bioData.maritalStatus}</Descriptions.Item>
                  <Descriptions.Item label="Religion">{bioData.religion}</Descriptions.Item>
                  <Descriptions.Item label="Nationality">{bioData.nationality}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
    
            <Divider />
    
            {/* Academic Information */}
            <Descriptions title="Academic Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Faculty">{bioData.faculty}</Descriptions.Item>
              <Descriptions.Item label="Department">{bioData.department}</Descriptions.Item>
              <Descriptions.Item label="Programme">{bioData.programme}</Descriptions.Item>
              <Descriptions.Item label="Level">{bioData.level}</Descriptions.Item>
              <Descriptions.Item label="Current Semester">{bioData.currentSemester}</Descriptions.Item>
              <Descriptions.Item label="Session">{bioData.currentSession}</Descriptions.Item>
              <Descriptions.Item label="Matric Number">{bioData.matricNumber}</Descriptions.Item>
              <Descriptions.Item label="Mode of Entry">{bioData.modeOfEntry}</Descriptions.Item>
              <Descriptions.Item label="Study Mode">{bioData.studyMode}</Descriptions.Item>
              <Descriptions.Item label="Entry Year">{bioData.entryYear}</Descriptions.Item>
              <Descriptions.Item label="Program Duration">{bioData.programDuration} years</Descriptions.Item>
              <Descriptions.Item label="Award in View">{bioData.awardInView}</Descriptions.Item>
            </Descriptions>
    
            <Divider />
    
            {/* Payment Information */}
            <Descriptions title="Payment Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="School Fees">
                <Badge status={bioData.hasPaidSchoolFee ? "success" : "error"} text={bioData.hasPaidSchoolFee ? "Paid" : "Not Paid"} />
              </Descriptions.Item>
              <Descriptions.Item label="Faculty Fee">
                <Badge status={bioData.hasPaidFacultyFee ? "success" : "error"} text={bioData.hasPaidFacultyFee ? "Paid" : "Not Paid"} />
              </Descriptions.Item>
              <Descriptions.Item label="GST Fee">
                <Badge status={bioData.hasPaidGstFee ? "success" : "error"} text={bioData.hasPaidGstFee ? "Paid" : "Not Paid"} />
              </Descriptions.Item>
              <Descriptions.Item label="Entrepreneurship Fee">
                <Badge status={bioData.hasPaidEntrepreneurshipFee ? "success" : "error"} text={bioData.hasPaidEntrepreneurshipFee ? "Paid" : "Not Paid"} />
              </Descriptions.Item>
              <Descriptions.Item label="SUG Fee">
                <Badge status={bioData.hasPaidSugFee ? "success" : "error"} text={bioData.hasPaidSugFee ? "Paid" : "Not Paid"} />
              </Descriptions.Item>
              <Descriptions.Item label="Naniss Fee">
                <Badge status={bioData.hasPaidNanissFee ? "success" : "error"} text={bioData.hasPaidNanissFee ? "Paid" : "Not Paid"} />
              </Descriptions.Item>
            </Descriptions>
    
            <Divider />
    
            {/* Contact Information */}
            <Descriptions title="Contact Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Present Address">{bioData.presentContactAddress}</Descriptions.Item>
              <Descriptions.Item label="Permanent Address">{bioData.permanentHomeAddress}</Descriptions.Item>
              <Descriptions.Item label="Next of Kin">{bioData.nextOfKin}</Descriptions.Item>
              <Descriptions.Item label="Next of Kin Phone">{bioData.nextOfKinPhoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Relationship">{bioData.nextOfKinRelationship}</Descriptions.Item>
              <Descriptions.Item label="Sponsor Address">{bioData.sponsorAddress}</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      );
    };
export default BioData;
