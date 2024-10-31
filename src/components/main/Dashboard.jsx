import React, {useState} from 'react';
import './Dashboard.css';
import coverPhoto from '../../assets/backgrround.jpg';
import {BarsOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import logo from '../../assets/logo2.png';
import profilePic from '../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Button, Popover, Space } from 'antd';
// import 'bootstrap/dist/css/bootstrap.min.css';

const content = (
  <div>
    <p>Content</p>
    <p>Content</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  function routeBio(){
    navigate('/dashboard/Bio-data');
  }
  function routeCourse(){
    navigate('/dashboard/Course_reg');
  }

    // const
  return (
    <>
    
    <div className="dashboard-container">
        <div className="head">

    <img  src={logo} alt="User" />

    <Popover content={content} title="Title" trigger="click">
    <BarsOutlined style={{ fontSize:'2rem', color:'#e9f3eb', fontWeight:'600px'} }/>
    </Popover>

        </div>

      {/* Cover Photo */}
      

      {/* User Information Card */}
    </div>
      <div className='content'>
      <div className="user-card">
        <img className="profile-pic" src={profilePic} alt="User" />
        <h2 className="user-name">Alamba Daniel</h2>
        <p className="user-info">Student, COE Study Centre</p>
        <p className="user-info"><PhoneOutlined/> 08069262613</p>
        <p className="user-info"><MailOutlined/> danielalamba15@gmail.com</p>
        <h4 className="">U19/FNS/CSC/1007</h4>
        
        {/* Action Buttons */}
        <div className="button-group">
          <button className="dashboard-button" onClick={routeBio}>Bio Data</button>
          <button className="dashboard-button" onClick={routeCourse}>Course Registration</button>
        </div>
      </div>
      <div className="outlet">

    <Outlet/>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
