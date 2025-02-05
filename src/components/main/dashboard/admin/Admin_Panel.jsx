import React, { useEffect, useState, createContext, useContext } from 'react';

import coverPhoto from '../../../../assets/backgrround.jpg';
import { BarsOutlined, PhoneOutlined, MailOutlined, UserOutlined, BookFilled } from '@ant-design/icons';
import logo from '../../../../assets/logo2.png';
import profilePic from '../../../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
import { Routes, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Button, Popover, Space, ConfigProvider, Avatar, Flex } from 'antd';
import axios from 'axios';
import BioData from './../../dashboard/Bio_data';

import './../../Dashboard.css';
import API_ENDPOINTS from '../../../../Endpoints/environment';


const Admin_Panel = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState('' || null);
    const [application, setApplication] = useState('');
    const userId=localStorage.getItem('id')
  
    function routeViewApplications() {
      navigate('/admin/view-applications');
    }
    function routeCourse() {
      navigate('/admin/add-applications');
    }
    function routeLogOUt() {
      navigate('/');
    }
  
    useEffect(() => {
      // console.log('check')
      const fetchUser = async () => {
        // console.log('check')
        try {
          const response = await axios.get(`${API_ENDPOINTS}/applications/${userId}`);
          setApplication(response.data); // Assuming the API returns user data in `response.data`
          const responseBio = await axios.get(`${API_ENDPOINTS}/bio-data/${userId}`);
          if(responseBio){
            setUser(responseBio.data.data[0])
  
            console.log(responseBio.data.data);
          }
  
  
          console.log('Data',response.data.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
  
      if (userId) {
        fetchUser(); // Call the async function to fetch data
      }
    }, [userId]); // Only re-run if `userId` changes
  
  
  
    // routeViewApplications
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
          <Button style={{ textAlign: 'start' }} block color="default" variant="outlined" onClick={routeViewApplications}>
            View Applications
          </Button>
  
          <Button block color="default" variant="outlined" onClick={routeCourse}>
            Add Applications
          </Button>
          <Button block color="default" variant="outlined" onClick={routeLogOUt}>
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
  
            <img src={logo} style={{}} alt="User" />

            <h2 className='school-name'>COLLEGE OF EDUCATION</h2>
  
            <Popover content={content} trigger="click">
              <BarsOutlined style={{ fontSize: '2rem', color: '#eef5f0', fontWeight: '600px', marginRight:'7%' }} />
            </Popover>
  
          </div>
  
          {/* Cover Photo */}
  
  
          {/* User Information Card */}
        </div>
        <div className='content'>
          <div className="user-card">
            {/* <Avatar
              size={140}
              src={user?.photoId}
              icon={<UserOutlined />}
              className="profile-pic"
            /> */}
            <h1 style={{ fontFamily: "'Ubuntu', serif" }} >ADMIN PANEL</h1>
           
            
  
  
          </div>
          <div className="outlet">
  
            <Outlet />
          </div>
        </div>
      </>
    );
  };

export default Admin_Panel;