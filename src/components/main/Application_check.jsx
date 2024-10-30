import React, { useState } from 'react';
import './style.css';
import logo from '../../assets/logo2.png';
import { useNavigate } from 'react-router-dom';
import { PaystackButton } from "react-paystack";




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
        // reg_number: regNumber,
        reference: reference.reference,
        payment_date: paidOn.toISOString().split('T')[0]

      };
      // alert("Thanks for doing business with us! Come back soon!!");
      // axios.post(`${API_ENDPOINTS.PHONE_NO}`, formData);
      // navigate('/login')
      // Optionally navigate or perform additional actions after payment
    },
    onClose: () => alert("Wait! Don't leave :("),
  };
  const handleInputChange = (e) => {
    setApplicationNumber(e.target.value);
  };
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check application number and update the view accordingly
    if (applicationNumber === '1010101010') {
      setView('acceptance'); // Show acceptance fee prompt
    } else if (applicationNumber === '0000000000') {
      navigate('/dashboard')

    } else {
      setView('notFound'); // Show application number not found message
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
                  <p>Please proceed to pay your acceptance fee.</p>
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
                  <PaystackButton className='btn btn-green' {...componentProps} />

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
