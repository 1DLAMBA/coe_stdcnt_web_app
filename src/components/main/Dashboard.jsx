import React, { useEffect, useState, createContext, useContext } from 'react';
import './Dashboard.css';
import coverPhoto from '../../assets/backgrround.jpg';
import { BarsOutlined, PhoneOutlined, MailOutlined, UserOutlined, BookFilled } from '@ant-design/icons';
import logo from '../../assets/logo2.png';
import profilePic from '../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
import { Routes, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Button, Popover, Space, ConfigProvider, Avatar, Flex } from 'antd';
import axios from 'axios';
import BioData from './dashboard/Bio_data';



const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [application, setApplication] = useState('');
  const userId=localStorage.getItem('id')

  function routeBio() {
    navigate('/dashboard/Bio-data');
  }
  function routeCourse() {
    navigate('/dashboard/Course_reg');
  }

  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      // console.log('check')
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/applications/${userId}`);
        setApplication(response.data); // Assuming the API returns user data in `response.data`
        const responseBio = await axios.get(`http://127.0.0.1:8000/api/bio-data/${userId}`);
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
            src={user.photoId}
            icon={<UserOutlined />}
            className="profile-pic"
          />
          <h2 className="user-name">{user.full_name}</h2>
          {user.full_name? (<>
            <div className='info-hold'>
            <div style={{marginRight:'20px'}}>
              <h4 className="">{user.app_Num}</h4>
              <p className="user-info">{<BookFilled/>} {user.programme}</p>

            </div>

            <div style={{marginTop:'1%'}}>
              <p className="user-info"><PhoneOutlined /> {user.phone_number}</p>

              <p className="user-info"><MailOutlined /> {user.email}</p>
            </div>
          </div></>):(<>
            <div >
            <h3>Your application number is {application.application_number}</h3>
            <br></br>
            <p>Please Update BIO DATA</p>
            
          </div>
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
