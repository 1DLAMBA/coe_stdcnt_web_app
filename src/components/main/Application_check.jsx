import React, { useState } from 'react';
import './style.css';
import logo from '../../assets/logo2.png';
const Application_check=()=>{

    const [applicationNumber, setApplicationNumber] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [submitted, setSubmitted] = useState(false);
  
    const handleInputChange = (e) => {
      setApplicationNumber(e.target.value);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(applicationNumber);
      if (applicationNumber.length === '10101010') {
        setIsValid(true);
        setSubmitted(true);
      } else {
          setSubmitted(true);
        setIsValid(false);
        // setSubmitted(false)
      }
    };
  
    return (
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-6">
            <div className="card bg-light-green">
                <img src={logo} width='100px' alt="" />
              <div className="card-body">
                <h2 className="text-green text-center">College of Education Study Centre</h2>
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
                    {submitted && !isValid ? (
                      <div className="invalid-feedback">
                        Please enter a valid 10-digit application number.
                      </div>
                    ) : null}
                  </div>
                  <button type="submit" className="btn btn-green btn-block">
                    Enter
                  </button>
                </form>
                {submitted && isValid ? (
                  <div className="valid-feedback">
                    Application number valid. Proceed to next step.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Application_check;