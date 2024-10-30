import React, {useState} from 'react';
import './Dashboard.css';
import coverPhoto from '../../assets/backgrround.jpg';
import {BarsOutlined } from '@ant-design/icons';
import logo from '../../assets/logo2.png';
import profilePic from '../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
// import 'bootstrap/dist/css/bootstrap.min.css';


const Dashboard = () => {
    // const
  return (
    <>
    
    <div className="dashboard-container">
        <div className="head">

    <img width='15%' src={logo} alt="User" />

  
    <BarsOutlined style={{paddingRight:'20px', fontSize:'2rem', color:'white', fontWeight:'600px'} }/>
    

        </div>

      {/* Cover Photo */}
      

      {/* User Information Card */}
    </div>
      <div className='content'>
      <div className="user-card">
        <img className="profile-pic" src={profilePic} alt="User" />
        <h2 className="user-name">John Doe</h2>
        <p className="user-info">Student, COE Study Centre</p>
        
        {/* Action Buttons */}
        <div className="button-group">
          <button className="dashboard-button">Bio Data</button>
          <button className="dashboard-button">Course Registration</button>
        </div>
      </div>

      </div>
    </>
  );
};

export default Dashboard;
