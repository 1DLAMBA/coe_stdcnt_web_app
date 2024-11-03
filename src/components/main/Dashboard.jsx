import React, { useState } from 'react';
import './Dashboard.css';
import coverPhoto from '../../assets/backgrround.jpg';
import { BarsOutlined, PhoneOutlined, MailOutlined, UserOutlined, BookFilled } from '@ant-design/icons';
import logo from '../../assets/logo2.png';
import profilePic from '../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
import { Routes, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Button, Popover, Space, ConfigProvider, Avatar, Flex } from 'antd';
// import 'bootstrap/dist/css/bootstrap.min.css';

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


const Dashboard = () => {
  const navigate = useNavigate();

  function routeBio() {
    navigate('/dashboard/Bio-data');
  }
  function routeCourse() {
    navigate('/dashboard/Course_reg');
  }
  // routeBio
  const content = (
    <div>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: 'green',
            borderRadius: 2,
            textAlign: 'start',
            // Alias Token
            colorBgContainer: '#f6ffed',
          },
        }}
      >
        <Button style={{ textAlign: 'start' }} block color="default" variant="outlined" onClick={routeBio}>
          Bio Data
        </Button>

        <Button block color="default" variant="outlined" onClick={routeCourse}>
          Course Reg
        </Button>
        <Button block color="default" variant="outlined" onClick={routeCourse}>
          Log Out
        </Button>
      </ConfigProvider>
    </div>
  );
  // const
  return (
    <>

      <div className="dashboard-container">
        <div className="head">

          <img src={logo} alt="User" />

          <Popover content={content} trigger="click">
            <BarsOutlined style={{ fontSize: '2rem', color: '#eef5f0', fontWeight: '600px', marginRight:'7%' }} />
          </Popover>

        </div>

        {/* Cover Photo */}


        {/* User Information Card */}
      </div>
      <div className='content'>
        <div className="user-card">
          <Avatar
            size={140}
            src={bioData.photoId}
            icon={<UserOutlined />}
            className="profile-pic"
          />
          <h2 className="user-name">Alamba Daniel</h2>
          <div className='info-hold'>
            <div style={{marginRight:'20px'}}>
              <h4 className="">U19/FNS/CSC/1007</h4>
              <p className="user-info">{<BookFilled/>} {bioData.programme}</p>

            </div>

            <div style={{marginTop:'1%'}}>
              <p className="user-info"><PhoneOutlined /> 08069262613</p>

              <p className="user-info"><MailOutlined /> danielalamba15@gmail.com</p>
            </div>
          </div>


        </div>
        <div className="outlet">

          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
