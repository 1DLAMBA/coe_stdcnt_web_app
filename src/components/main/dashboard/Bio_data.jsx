import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Avatar, Skeleton, Typography, Divider, Descriptions, Badge, Button, ConfigProvider, Flex } from 'antd';
import { UserOutlined, HomeFilled } from '@ant-design/icons';
import { Breadcrumb } from 'antd';

import './BioDataPage.css'; // Import custom CSS for dark green theme
import { Link, useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const BioData = () => {
  // const { xxl } = useResponsive();
  const [viewBio, setViewBio] = useState(true)
  const [editBio, setEditBio] = useState(false)
  const [user, setUser] = useState('' || null);
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = localStorage.getItem('id');
  const [active, setActive] = useState(false);
  const [loader, setLoader] = useState(true);


  function routeEdit() {
    navigate(`/Dashboard/${id}/Edit`)
  }
  const items = [
    {
      path: '/Dashboard',
      title: <HomeFilled />,
    },

    {
      path: '/Bio-data',
      title: 'Bio-data',
    },
  ];

  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      // console.log('check')
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/bio-data/${userId}`);
        setUser(response.data.data[0]); // Assuming the API returns user data in `response.data`
        console.log('Data', response.data);
        setLoader(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUser(); // Call the async function to fetch data
    }
  }, [userId]); // Only re-run if `userId` changes


  function itemRender(currentRoute, params, items, paths) {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;

    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={`/${paths.join("/")}`}>{currentRoute.title}</Link>
    );
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
    <>
      <Breadcrumb style={{ marginLeft: '8.7%', marginTop: '1%', backgroundColor: 'white', width: '82.5%', color: 'white', borderRadius: '15px', padding: '0.5%' }} itemRender={itemRender} items={items} />

      <div className="bio-data-container">
        <div bordered={false} style={{ padding: '0 !important' }} className="bio-data-card">
          <div style={{ textAlign: 'center', backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center', marginBottom: '1%' }}>
            <Title level={2} style={{ color: '#fff' }}>Bio Data</Title>

          </div>
          <Col className="profile-section" style={{ padding: '1%' }}>
            <div className="div">

              <Title level={4} className="name">
                {user?.fullName}
              </Title>
              <Text className="matric-number">{user?.matricNumber}</Text>
            </div>
            <div>
              <Button color="danger" onClick={routeEdit} variant="outlined">
                Update
              </Button>

            </div>
          </Col>
          <hr />

          {/* Profile Section */}

          {/* Basic Information Section */}


          {loader ? (<>
            <Skeleton.Node
              active='true'
              style={{
                width: '80vw',
                marginLeft:'10'
              }}
            />
          </>) : (<>

            {user?.full_name ? (<>
              <div style={{ padding: '1%' }}>
                <Descriptions title="Personal Information" style={{ padding: '1%' }} bordered column={{ xs: 1, sm: 1, md: 2 }}>
                  <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                  <Descriptions.Item label="Phone Number">{user?.phone_number}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{user?.gender}</Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">{user?.date_of_birth}</Descriptions.Item>
                  <Descriptions.Item label="Place of Birth">{user?.place_of_birth}</Descriptions.Item>
                  <Descriptions.Item label="Marital Status">{user?.marital_status}</Descriptions.Item>
                  <Descriptions.Item label="Religion">{user?.religion}</Descriptions.Item>
                  <Descriptions.Item label="Nationality">{user?.nationality}</Descriptions.Item>
                </Descriptions>



                <Divider />

                {/* Academic Information */}
                <Descriptions title="Academic Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
                  <Descriptions.Item label="Faculty">{user?.faculty}</Descriptions.Item>
                  <Descriptions.Item label="Department">{user?.department}</Descriptions.Item>
                  <Descriptions.Item label="Programme">{user?.programme}</Descriptions.Item>
                  <Descriptions.Item label="Level">{user?.level}</Descriptions.Item>
                  <Descriptions.Item label="Current Semester">{user?.current_semester}</Descriptions.Item>
                  <Descriptions.Item label="Session">{user?.current_session}</Descriptions.Item>
                  <Descriptions.Item label="Matric Number">{user?.matric_number}</Descriptions.Item>
                  <Descriptions.Item label="Mode of Entry">{user?.mode_of_entry}</Descriptions.Item>
                  <Descriptions.Item label="Study Mode">{user?.study_mode}</Descriptions.Item>
                  <Descriptions.Item label="Entry Year">{user?.entry_year}</Descriptions.Item>
                  <Descriptions.Item label="Program Duration">{user?.program_duration} years</Descriptions.Item>
                  <Descriptions.Item label="Award in View">{user?.award_in_view}</Descriptions.Item>
                </Descriptions>

                <Divider />

                {/* Payment Information */}
                {/* <Descriptions title="Payment Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
            <Descriptions.Item label="School Fees">
              <Badge status={user?.hasPaidSchoolFee ? "success" : "error"} text={user?.hasPaidSchoolFee ? "Paid" : "Not Paid"} />
            </Descriptions.Item>
            <Descriptions.Item label="Faculty Fee">
              <Badge status={user?.hasPaidFacultyFee ? "success" : "error"} text={user?.hasPaidFacultyFee ? "Paid" : "Not Paid"} />
            </Descriptions.Item>
            <Descriptions.Item label="GST Fee">
              <Badge status={user?.hasPaidGstFee ? "success" : "error"} text={bioData.hasPaidGstFee ? "Paid" : "Not Paid"} />
            </Descriptions.Item>
            <Descriptions.Item label="Entrepreneurship Fee">
              <Badge status={bioData.hasPaidEntrepreneurshipFee ? "success" : "error"} text={bioData.hasPaidEntrepreneurshipFee ? "Paid" : "Not Paid"} />
            </Descriptions.Item>
            <Descriptions.Item label="SUG Fee">
              <Badge status={bioData.hasPaidSugFee ? "success" : "error"} text={bioData.hasPaidSugFee ? "Paid" : "Not Paid"} />
            </Descriptions.Item>
            <Descriptions.Item label="Naniss Fee">
              <Badge status={bioData.hasPaidNanissFee ? "success" : "error"} text={user?.hasPaidNanissFee ? "Paid" : "Not Paid"} />
            </Descriptions.Item>
          </Descriptions> */}

                <Divider />

                {/* Contact Information */}
                <Descriptions title="Contact Information" bordered column={{ xs: 1, sm: 1, md: 2 }}>
                  <Descriptions.Item label="Present Address">{user?.present_contact_address}</Descriptions.Item>
                  <Descriptions.Item label="Permanent Address">{user?.permanent_home_address}</Descriptions.Item>
                  <Descriptions.Item label="Next of Kin">{user?.next_of_kin}</Descriptions.Item>
                  <Descriptions.Item label="Next of Kin Phone">{user?.next_of_kin_phone_number}</Descriptions.Item>
                  <Descriptions.Item label="Relationship">{user?.next_of_kin_relationship}</Descriptions.Item>
                  <Descriptions.Item label="Sponsor Address">{user?.sponsor_address}</Descriptions.Item>
                </Descriptions>
              </div>
            </>) : (<>

              <h2>You do not have Bio Data registered, please update Bio Data record</h2>
            </>)}

          </>)}


        </div>
      </div>

    </>

  );
};
export default BioData;
