import React, { useEffect, useState, createContext, useContext } from 'react';
import './Dashboard.css';
import coverPhoto from '../../assets/backgrround.jpg';
import { BarsOutlined, PhoneOutlined, MailOutlined,BookTwoTone, UserOutlined, BookFilled } from '@ant-design/icons';
import logo from '../../assets/logo2.png';
import profilePic from '../../assets/pro-pic.png';
import { PaystackButton } from "react-paystack";
import { Routes, useNavigate } from 'react-router-dom';
import { Outlet , useParams} from 'react-router-dom';
import { Button, Popover, Skeleton,Space, ConfigProvider, Avatar, Flex } from 'antd';
import axios from 'axios';
import BioData from './dashboard/Bio_data';
import API_ENDPOINTS from '../../Endpoints/environment';



const Dashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState('' || null);
  const [application, setApplication] = useState('');
  const userId=localStorage.getItem('id')
  const [loader, setLoader] = useState(true);


  function routeBio() {
    navigate(`Bio-data`);
  }
  function routeCourse() {
    navigate(`Course_reg`);
  }
  function routeLogOUt() {
    navigate('/');
  }

  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      // console.log('check')
      try {
        const response = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
        setApplication(response.data); // Assuming the API returns user data in `response.data`
        // const responseBio = await axios.get(`http://127.0.0.1:8000/api/bio-data/${id}`);
        // if(responseBio){
        //   setUser(responseBio.data.data[0])

        //   console.log(responseBio.data.data);
        // }

        if(!response.data.matric_number){
    navigate('/');

        }


        console.log('Data',response.data.data);
        setLoader(false);

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
            src={user?.photoId}
            icon={<UserOutlined />}
            className="profile-pic"
          />

{loader ? (<>

<div style={{display:'flex',width:'30%',justifyContent:'space-between', margin:'2%'}}>

            <Skeleton.Node
              active='true'
              style={{
                width: 170,
                height:20
              }}
            />
           
            <Skeleton.Node
              active='true'
              style={{
                width: 170,
                height:20
              }}
            />
</div>
<div style={{display:'flex',width:'30%',justifyContent:'space-between',  margin:'2%'}}>

            <Skeleton.Node
              active='true'
              style={{
                width: 170,
                height:20
              }}
            />
           
            <Skeleton.Node
              active='true'
              style={{
                width: 170,
                height:20
              }}
            />
</div>
          </>) : (<>
          {application?.surname? (<>
            <div className='info-hold'>
            <div style={{marginRight:'20px'}}>
          <h2 className="user-name">{application?.surname} {application?.other_names} </h2>
             
              <p className="user-info">{<BookFilled/>}{application?.matric_number}</p>
              <p className="user-info">{<BookTwoTone/>}{application?.course}</p>

            </div>

            <div style={{}}>
              <p className="user-info"><PhoneOutlined /> {application.phone_number}</p>

              <p className="user-info"><MailOutlined /> {application.email}</p>
            </div>
          </div></>):(<>
            <div >
            <h3>Your application number is {application.application_number}</h3>
            <br></br>
            <p style={{padding:'2%', border:'1px solid red', fontWeight:'bolder', borderRadius:'5px'}}>Please Update Personal Data</p>
            
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
