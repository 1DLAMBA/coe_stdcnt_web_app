import React, { useEffect, useMemo, useState, createContext, useContext } from 'react';
import './Dashboard.css';
import coverPhoto from '../../assets/backgrround.jpg';
import {
  BarsOutlined, PhoneOutlined, MailOutlined, BookTwoTone, UserOutlined, BookFilled,
  BookOutlined,
  FileTextOutlined,
  LogoutOutlined,
  HeatMapOutlined,
  EnvironmentFilled,
  MenuOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import logo from '../../assets/logo2.png';
import profilePic from '../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
import { Routes, useNavigate } from 'react-router-dom';
import { Outlet, useParams } from 'react-router-dom';
import { Button, Popover, Skeleton, Space, ConfigProvider, Avatar, Flex, Tag, Upload, message } from 'antd';
import axios from 'axios';
import BioData from './dashboard/Bio_data';
import API_ENDPOINTS from '../../Endpoints/environment';
import { canViewSchoolFeesReceipt, isNewIntakeByMatric } from '../../utils/schoolFeesFlags';



const Dashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState('' || null);
  const [application, setApplication] = useState('');
  const [backupPersonal, setBackupPersonal] = useState(null);
  const userId = localStorage.getItem('id')
  const [loader, setLoader] = useState(true);
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handlePassportUpload = async (info) => {
    const { status } = info.file;
    if (status === 'uploading') {
      setUploading(true);
      message.loading('Uploading profile photo...', 0);
    } else if (status === 'done') {
      setUploading(false);
      message.destroy();
      const fileName = info.file.response?.data;
      if (!fileName) {
        message.error('Upload succeeded but no file reference was returned.');
        return;
      }
      try {
        await axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`, { passport: fileName });
        setApplication((prev) => ({ ...prev, passport: fileName }));
        message.success('Profile photo updated successfully.');
      } catch (error) {
        console.error('Error saving profile photo:', error);
        message.error('Photo uploaded but failed to save. Please try again.');
      }
    } else if (status === 'error') {
      setUploading(false);
      message.destroy();
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const isNewByMatric = useMemo(
    () => isNewIntakeByMatric(application?.matric_number),
    [application?.matric_number]
  );

  const canViewReceipt = useMemo(
    () => canViewSchoolFeesReceipt(application, backupPersonal, isNewByMatric),
    [application, backupPersonal, isNewByMatric]
  );


  function routeBio() {
    navigate(`/Dashboard/${id}/Bio-data`);
  }
  function routeCourse() {
    navigate(`/Dashboard/${id}/Course_reg`);
  }
  function routeLogOUt() {
    navigate('/');
  }

  function routeAdmissionLetter() {
    navigate(`/Dashboard/${id}/admission-letter`)
  }

  function routeAcceptanceFee() {
    navigate(`/dashboard/${id}/acceptance-receipt`);
  }
  function routeSchoolFees() {
    navigate(`/dashboard/${id}/fees-receipt`);
  }
  function routeExamCard() {
    navigate(`/dashboard/${id}/exam-card`);
  }
  function routeClearance() {
    navigate(`/dashboard/${id}/clearance`);
  }


  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      try {
        const primaryUrl = `${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`;
        const backupUrl = API_ENDPOINTS.PERSONAL_DETAILS_BACKUP;

        const primaryPromise = axios.get(primaryUrl);
        const bioPromise = axios.get(`${API_ENDPOINTS.BIO_REGISTRATION}/${id}`);
        const backupPromise = backupUrl
          ? axios.get(`${backupUrl}/${id}`).catch((err) => {
              console.warn('Backup personal-details unavailable:', err?.message || err);
              return null;
            })
          : Promise.resolve(null);

        const [response, responseBio, backupRes] = await Promise.all([
          primaryPromise,
          bioPromise,
          backupPromise,
        ]);

        const primaryData = response.data;
        setApplication(primaryData);
        setUser(responseBio.data);

        const skipBackup = isNewIntakeByMatric(primaryData?.matric_number);
        setBackupPersonal(
          backupRes && backupRes.data != null && !skipBackup ? backupRes.data : null
        );

        if (!primaryData.matric_number) {
          navigate('/');
        }

        setLoader(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setBackupPersonal(null);
      }
    };

    fetchUser(); // Call the async function to fetch data

  }, []); // Only re-run if `userId` changes



  // routeBio
  const content = (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'green',
          borderRadius: 2,
          // Removing textAlign from token as we'll handle it in the style
          colorBgContainer: '#f6ffed',
        },
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          block 
          type="text"
          onClick={routeBio}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <UserOutlined style={{ marginRight: '8px' }} /> Bio Data
        </Button>

        <Button
          block
          type="text"
          onClick={routeCourse}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <BookOutlined style={{ marginRight: '8px' }} /> Course Reg
        </Button>
        <div style={{ borderTop: '1px solid #e8e8e8', margin: '4px 0' }} />

        <Button
          block
          type="text"
          onClick={routeAdmissionLetter}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <FileTextOutlined style={{ marginRight: '8px' }} /> Admission Letter
        </Button>
        <Button
          block
          type="text"
          disabled={user?.level !== "100"}
          onClick={routeAcceptanceFee}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <FileTextOutlined style={{ marginRight: '8px' }} /> Acceptance Fee receipt
        </Button>
        <Button
          block
          type="text"
          disabled={!canViewReceipt}
          onClick={routeSchoolFees}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <FileTextOutlined style={{ marginRight: '8px' }} /> School Fees receipt
        </Button>
        <Button
          block
          type="text"
          disabled={application?.course_paid === "0" || application?.has_paid === "0"}
          onClick={routeExamCard}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        > 
          <FileTextOutlined style={{ marginRight: '8px' }} /> Exam Card
        </Button>
        <Button
          block
          type="text"
          onClick={routeClearance}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <FileTextOutlined style={{ marginRight: '8px' }} /> Clearance
        </Button>

        <div style={{ borderTop: '1px solid #e8e8e8', margin: '4px 0' }} />

        <Button
          block
          danger
          type="text"
          onClick={routeLogOUt}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 12px',
            height: 'auto'
          }}
        >
          <LogoutOutlined style={{ marginRight: '8px' }} /> Log Out
        </Button>
      </Space>
    </ConfigProvider>
  );
  // const
  return (
    <>

      <div className="dashboard-container">
        <div className="head">

          <img src={logo} alt="User"   style={{ marginLeft: '10%' }} />

          <ConfigProvider
      theme={{
        token: {
          // Modern color scheme
          colorPrimary: '#028f64',
          colorBgContainer: '#ffffff',
          
          // Refined radius and spacing
          borderRadius: 8,
          margin: 16,
          
          // Adding box shadow for depth
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Popover
        content={content}
        trigger="click"
        placement="bottomRight"
        overlayStyle={{ 
          width: '220px',
          borderRadius: '12px',
        }}
      >
        <Button 
          type="primary"
          shape="circle"
          size="large"
          icon={<MenuOutlined />}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '48px',
            height: '48px',
            boxShadow: '0 4px 12px rgba(163, 197, 84, 0.41)',
            transition: 'all 0.3s ease',
            marginRight: '10%'
          }}
          className="hover:shadow-lg"
        />
      </Popover>
    </ConfigProvider>

        </div>

        {/* Cover Photo */}


        {/* User Information Card */}
      </div>
      <div className='content'>
        <div className="user-card">

          <Upload
            name="file"
            showUploadList={false}
            accept="image/jpeg,image/png"
            action={API_ENDPOINTS.UPLOAD}
            beforeUpload={beforeUpload}
            onChange={handlePassportUpload}
            disabled={uploading || loader}
          >
            <div className="profile-pic-wrapper">
              <Avatar
                size={140}
                src={application?.passport ? `${API_ENDPOINTS.IMAGE}/${application.passport}` : undefined}
                icon={!application?.passport && <UserOutlined style={{ fontSize: '70px' }} />}
                className="profile-pic"
                style={{ backgroundColor: '#028f64' }}
              />
              <span className="profile-pic-overlay">
                <CameraOutlined />
              </span>
            </div>
          </Upload>

          {loader ? (<>

            <div style={{ display: 'flex', width: '30%', justifyContent: 'space-between', margin: '2%' }}>

              <Skeleton.Node
                active='true'
                style={{
                  width: 170,
                  height: 20
                }}
              />

              <Skeleton.Node
                active='true'
                style={{
                  width: 170,
                  height: 20
                }}
              />
            </div>
            <div style={{ display: 'flex', width: '30%', justifyContent: 'space-between', margin: '2%' }}>

              <Skeleton.Node
                active='true'
                style={{
                  width: 170,
                  height: 20
                }}
              />

              <Skeleton.Node
                active='true'
                style={{
                  width: 170,
                  height: 20
                }}
              />
            </div>
          </>) : (<>
            {application?.surname ? (<>
              <div className='info-hold'>
                <div style={{ marginRight: '20px' }}>
                  <h2 className="user-name">{application?.surname} {application?.other_names} </h2>

                  <p className="user-info">{<BookFilled />}{application?.matric_number}</p>
                  <p className="user-info">{<BookTwoTone />}{application?.course}</p>

                </div>

                <div style={{}}>
                  <p className="user-info"><PhoneOutlined /> {application.phone_number}</p>

                  <p className="user-info"><MailOutlined /> {application.email}</p>
                  <Tag  color="cyan" className="user-info" style={{padding:'2%'}}><EnvironmentFilled /> {application.desired_study_cent} study center</Tag>
                </div>
              </div></>) : (<>
                <div >
                  <h3>Your application number is {application.application_number}</h3>
                  <br></br>
                  <p style={{ padding: '2%', border: '1px solid red', fontWeight: 'bolder', borderRadius: '5px' }}>Please Update Personal Data</p>

                </div>
              </>)}

          </>)}




        </div>
        <div className="outlet">

          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
