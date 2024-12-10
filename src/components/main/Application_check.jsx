import React, { useState } from 'react';
import './style.css';
import logo from '../../assets/logo2.png';
import { useNavigate } from 'react-router-dom';
import { PaystackButton } from "react-paystack";
import axios from 'axios';
import { message } from "antd";




const ApplicationCheck = () => {
  const [applicationNumber, setApplicationNumber] = useState('');
  const navigate = useNavigate();
  const publicKey = "pk_test_3fbb14acfe497c070f67293c2f7f6bcb1b9228a9";
  const amount = 200000;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [view, setView] = useState('form'); // 'form', 'acceptance', 'dashboard', 'notFound'
  const componentProps = {
    email,
    amount,
    metadata: {
      // name,
      phone,
      // regNumber
    },
    publicKey,
    text: "Pay Now",
    onSuccess: (reference) => {
      const paidOn = new Date();
      const formData = {
        phone_no: phone,
        application_number: applicationNumber,
        reference: reference.reference,
        email: email,
        payment_date: paidOn.toISOString().split('T')[0]

      };
      localStorage.setItem('UserData', formData)
      const response = axios.post("http://localhost:5000/api/biodata", 
        formData,
      );
      navigate('/dashboard');

    },
    onClose: () => alert("Wait! Don't leave :("),
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
      // Make the API call
      const response = await axios.post("https://student-portal-backend-mu.vercel.app/api/student_check", {
        application_number: applicationNumber,
      });

      // Handle successful response
      if (response.status === 200 && response.data.message === "Student email FOUND") {
        hide(); // Hide the loading indicator
        localStorage.setItem("id", response.data.id._id);
        console.log("Student ID:", response.data.id._id);
        message.success("Student found! Redirecting to dashboard...");
        navigate("/dashboard"); // Navigate to the dashboard
      }
    } catch (error) {
      hide(); // Hide the loading indicator

      if (error.response && error.response.status === 404) {
        // Handle 404 (not found)
        message.warning("Student not found. Proceeding to fee payment.");
        localStorage.setItem('application_number', applicationNumber)
        setView("acceptance"); // Show acceptance fee prompt
      } else {
        // Handle other errors (e.g., network issues, 500 errors)
        console.error("Error checking student details:", error);
        message.error("An unexpected error occurred. Please try again later.");
      }
    }
  };


  return (
    <div className="container">
      <div className="row justify-content-center align-items-center">
        <div className="col-md-6">
          <div className="card bg-light-green">
            <img src={logo} width="100px" alt="Logo" />
            <div className="card-body">
              <h3 className="text-green text-center">College of Education Study Centre</h3>

              {view === 'form' && (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="applicationNumber">Application Number:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="applicationNumber"
                      value={applicationNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your 10-digit application number"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-green btn-block">
                    Enter
                  </button>
                </form>
              )}

              {view === 'acceptance' && (
                <div className="acceptance-view">
                  <h4 className="text-green">Acceptance Fee Payment</h4>
                  <p>Please proceed to pay your acceptance fee to continue to application and registration </p>
                  {/* Add a button or link to payment page here if needed */}

                  <input
                    type="text"
                    className="form-control"
                    id="Email"
                    value={email}
                    onChange={handleEmail}
                    placeholder="Enter your email"
                    required
                  />
                  <div className="d-flex">
                    <button className='btn-red-outline' onClick={back}> Back </button>
                    <PaystackButton className='btn btn-green' {...componentProps} />
                  </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCheck;
