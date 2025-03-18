import React, { useState } from 'react';
import './style.css';
import logo from '../../assets/logo2.png';
import { useNavigate } from 'react-router-dom';
import { PaystackButton } from "react-paystack";
import axios from 'axios';
import { message , Result, Button, ConfigProvider,Card,Alert, Modal,Input,Typography} from "antd";
import { WarningFilled, UserOutlined } from "@ant-design/icons";
import API_ENDPOINTS from '../../Endpoints/environment';




const ApplicationCheck = () => {
  const [applicationNumber, setApplicationNumber] = useState('');
  const navigate = useNavigate();
  const publicKey = "pk_live_a0e748b1c573eab4ee5c659fe004596ecd25a232";
  const amount = 300000;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [view, setView] = useState('form'); // 'form', 'acceptance', 'dashboard', 'notFound'
  const componentProps = {
    email,
    amount,
    metadata: {
      phone,
    },
    split:{
      type: "flat",
      subaccounts: [
        // Daniel Alamba
        { subaccount: "ACCT_32iz48sbi1fshex", share: 41000 },
        // COE ACCOUNT
        { subaccount: "ACCT_aan2ehxiej239du", share: 200000 },

        // { subaccount: "ACCT_32iz48sbi1fshex", share: 50000 },
      ]
    },
    publicKey,
    text: "Pay Now",
    onSuccess: async (reference) => {
      const paidOn = new Date();
      const formData = {
        application_reference: reference.reference,
        email: email,
        application_date: paidOn.toISOString().split('T')[0],
        
      };


  
      // Store temporary data in localStorage
      localStorage.setItem('UserData', JSON.stringify(formData)); // Ensure the data is stored as JSON
      localStorage.setItem('app_number', applicationNumber);
  
      try {
        // Send the form data to the API
        const response = await axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${applicationNumber.id}`, formData);
  
        console.log('Server response:', response);
        if (response && response.data.id) {
  
          // Store the ID from the response
          localStorage.setItem("id", response.data.id);
  
          // Navigate to the dashboard
          navigate(`/dashboard/${response.data.id}`);
        } else {
          console.error("No ID returned in the response.");
          alert("Payment successful, but we couldn't process your data. Please contact support.");
        }
      } catch (error) {
        console.error("Error sending user data:", error);
        alert("An error occurred while processing your payment. Please try again.");
      }
    },
    onClose: () => alert("Wait! Don't leave :("),
  };
  const correctPasskey = "coe@admin11";
  const handleOk = () => {
    if (passkey === correctPasskey) {
      message.success("Access granted!");
      navigate("/admin");
    } else {
      message.error("Incorrect passkey!");
    }
  };

  const handleInputChange = (e) => {
    setApplicationNumber(e.target.value);
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const back = () => {
    setView('form')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hide = message.loading("Checking student details...", 0); // Display a loading indicator

    try {
      const response = await axios.post(`${API_ENDPOINTS.STUDENT_CHECK}`, {
        application_number: applicationNumber,
      });
    
      if (response.status === 200) {
        hide();
        if (response.data.matric_number) {
          // Student has matric number, redirect to dashboard
          localStorage.setItem("id", response.data.id);
          console.log("Student ID:", response);
          message.success("Student found! Redirecting to dashboard...");
          navigate(`/dashboard/${response.data.id}`);
        } else if (response.data.message === "acceptance") {
          // Student found but acceptance fee is required
          hide();
          message.success("Student found! Redirecting to Acceptance...");
          console.log("Student Details:", response);
          setApplicationNumber(response.data.user)
          setEmail(response.data.user.email)
          setView("acceptance"); // Show acceptance fee prompt
        }
      } else if (response.status === 425) {
        // Pending status
        hide();
        message.warning("Student admission is pending.");
        setView("pending"); // Set the view to show a pending status
      }
    } catch (error) {
      hide();
    
      if (error.response) {
        const { status, data } = error.response;
    
        if (status === 404) {
          // Handle 404 (not found)
          message.warning("Student not found. Proceeding to fee payment.");
         
        } else if (data.message === "pending") {
          // Handle pending response
          message.info("Student admission is pending.");
          setView("pending");
        } else {
          // Handle unexpected backend errors
          console.error("Error checking student details:", error);
          message.error("An unexpected error occurred. Please try again later.");
        }
      } else {
        // Handle network or unexpected errors
        console.error("Error checking student details:", error);
        message.error("A network error occurred. Please try again later.");
      }
    }
    
  };


  return (
    <div className="container">
        <Modal
        title="Admin Authentication"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Login"
      >
        <Input.Password
          placeholder="Enter Admin Passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
        />
      </Modal>
      <div className="row justify-content-center align-items-center">
        <div className="col-md-6">
       
          <div className="card bg-light-green">
            <img src={logo} width="100px" alt="Logo" />
            <div className="card-body">
              <h3 className="text-green text-center">College of Education Study Centre</h3>

              {view === 'form' && (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="applicationNumber">Application Number/Matric Number:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="applicationNumber"
                      value={applicationNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your application number or Matric Number"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-green btn-block">
                    Enter
                  </button>
                  <Alert
      message="Information"
      description="New Applicants should Input their Application Number, returning students should input thier Matriculation Number"
      type="warning"
      className='alert'
      
    />
                </form>
              )}

              {view === 'acceptance' && (
                <div className="acceptance-view">
                  <h4 className="text-green">Acceptance Fee Payment</h4>
                  <p>Congratulations!! you have been offered admission to study <b>  {applicationNumber.course}</b> <br/>Please proceed to pay your acceptance fee of ₦3,000 to continue to application and registration </p>
                  {/* Add a button or link to payment page here if needed */}
                <h3>{applicationNumber.other_names}</h3>
                <h3>{applicationNumber.application_number}</h3>
                <h3>{applicationNumber.email}</h3>
                  <div className="d-flex">
                    <button className='btn-red-outline' onClick={back}> Back </button>
                    <PaystackButton className='btn btn-green' {...componentProps} />
                  </div>

                </div>
              )}
{view === 'pending' && (
                 <div className="pending-view">
      <Card className="pending-card" bordered={false}>
        <Result
          icon={<WarningFilled className="icon-style" style={{color:'green'}}/>}
          title={
            <Typography.Title level={3} className="title-text">
              Admission Status: Not Offered
            </Typography.Title>
          }
          subTitle={
            <Typography.Text className="subtitle-text">
              We regret to inform you that you have not been offered admission yet. However, keep checking for updates, as statuses may change over time.
            </Typography.Text>
          }
          extra={
            <div className="action-buttons">
              <button className="btn btn-green btn-block" onClick={() => window.location.reload()}>
                Refresh Status
              </button>
              <Button type="default" size="large" onClick={() => console.log("Contact Support")}>
                Contact Support
              </Button>
            </div>
          }
        />
       
      </Card>
    </div>
              )}
              {view === 'dashboard' && (
                <div className="dashboard-view">
                  <h4 className="text-green">Welcome to Your Dashboard</h4>
                  <p>You have successfully logged in.</p>
                  {/* Add dashboard link or redirect here if needed */}
                </div>
              )}

              {view === 'notFound' && (
                <div className="invalid-feedback">
                  Application number does not exist. Please check and try again.
                </div>
              )}
            </div>
            <div style={{backgroundColor:'white', marginTop:'4%', padding:'2%', borderRadius:'10px', justifyContent:'space-between', display:'flex'}}>
              Click Here if you wish to register
              <ConfigProvider
                        theme={{
                          token: {
                            // Seed Token
                            colorPrimary: '#028f64',
                            borderRadius: 2,

                            // Alias Token
                            margin: '20px',
                            colorBgContainer: '#f6ffed',
                          },
                        }}
                      >
              <Button className="btn outline btn-block" onClick={() => navigate('/registration')}>
                Register
              </Button>
              <Button
        className="btn outline btn-block"
        style={{ position: "absolute", bottom: "10px" }}
        onClick={() => setIsModalVisible(true)}
      >
        <UserOutlined /> Admin Portal
      </Button>
              </ConfigProvider>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default ApplicationCheck;
