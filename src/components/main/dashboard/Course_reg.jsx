import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Table, Typography, Space, Breadcrumb, Select

 } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, BookOutlined,HomeFilled  } from '@ant-design/icons';
import { PaystackButton } from "react-paystack";

import { Card} from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const { Option } = Select;

  const items = [
    {
      path: '/Dashboard',
      title: <HomeFilled />,
    },
    
    {
      path: '/course_reg',
      title: 'Course Registration',
      
    },
   
  ];
  
  function itemRender(currentRoute, params, items, paths) {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;
  
    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={`/${paths.join("/")}`}>{currentRoute.title}</Link>
    );
  }

const Course_reg = () => {
  const [courses, setCourses] = useState([""]); // Start with one empty course field
  const [userCourses, setUserCourses] = useState([""]); // Start with one empty course field
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(true);
  const [user, setUser] = useState('');
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const publicKey = "pk_test_3fbb14acfe497c070f67293c2f7f6bcb1b9228a9";
  const [applicationNumber, setApplicationNumber] = useState('');
  const amount = 200000;
  const [availableCourses, setAvailableCourses] = useState([]);
  const userId=localStorage.getItem('id')
  const componentProps = {
    email,
    amount,
    metadata: {
      // name,
      // phone,
      // regNumber
    },
    publicKey,
    text: "Pay Now",
    onSuccess: (reference) => {
      const paidOn = new Date();
      const formData = {
        application_number: applicationNumber,
        fees_reference: reference.reference,
        email: email,

        payment_date: paidOn.toISOString().split('T')[0],
        has_paid: true

      };
      localStorage.setItem('UserData', formData)
      localStorage.setItem('app_number', applicationNumber)
      const response = axios.post("http://127.0.0.1:8000/api/school-fees", 
        formData,
      );
      navigate('/dashboard');

    },
    onClose: () => alert("Wait! Don't leave :("),
  };

  const handleAddCourse = () => {
    setCourses([...courses, ""]); // Add a new empty field
  };

  const handleDelete = (code) => {
    setCourses(courses.filter(course => course.code !== code));
  };


  const handleCourseChange = (index, value) => {
    const newCourses = [...courses];
    newCourses[index] = value; // Update the specific course field
    setCourses(newCourses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = courses.map((course) => {
        const payload = {
          application_id: userId, // Replace with the actual application ID
          course: course.trim(),
        };
  
        return axios.post("http://127.0.0.1:8000/api/courses", payload);
      });
  
      await Promise.all(promises);
  
      alert("Courses added successfully");
      setCourses([""]); // Reset the form
    } catch (error) {
      console.error("Error adding courses:", error.response?.data || error);
      alert(`Failed to add courses: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      // console.log('check')
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/course-data`);
        setAvailableCourses(response.data || []); // Assuming the API returns user data in `response.data`
        console.log('COURSES fetched',response);
        const courses = await axios.get(`http://127.0.0.1:8000/api/courses/${userId}`);
        console.log("USER COURSES", courses)
        setUserCourses(courses.data);
        const bio = await axios.get(`http://127.0.0.1:8000/api/bio-data/${userId}`);
        if (bio.data.data[0] ==undefined){
          navigate('/dashboard/bio-data')
        } else{
          console.log("USER BIO", bio.data.data[0])
          setEmail(bio.data.data[0].application.email)
          setApplicationNumber(bio.data.data[0].application.application_number)

        }
        if(bio.data.data[0].application.has_paid){
          setView(false)
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUser(); // Call the async function to fetch data
    }
  }, [userId]); // Only re-run if `userId` changes
  

  const columns = [
    {
      title: 'COURSE TITLE',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'CODE',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'UNIT',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'CORE/ELECTIVE',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'SEMESTER',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'SESSION',
      dataIndex: 'session',
      key: 'session',
    },
    {
      title: 'DELETE',
      key: 'delete',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={() => handleDelete(record.code)}
        >
          DELETE
        </Button>
      ),
    },
  ];

  return (

    <>
       <Breadcrumb style={{marginLeft:'8.7%', marginTop: '1%', backgroundColor:'white', width:'82.5%', color:'white', borderRadius:'15px', padding:'0.5%'}} itemRender={itemRender} items={items} />

      <div style={{ padding: '0 ', backgroundColor: '#fff', minHeight: '100vh', width:'83%', margin:'1% auto' }}>
        <div style={{ textAlign: 'center',backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center'}}>
        <Title level={2} style={{ color: '#fff' }}>Course Registration</Title>

        </div>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
        </div>
{view===true && (
  <>
  <div className='' style={{margin:'2%'}}>
  <Card
      bordered={false}
      style={{
        maxWidth: 600,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        padding: '16px',
      }}
    >
      <Space direction="vertical" size="small">
        <Space>
          <BookOutlined style={{ fontSize: '24px', color: '#000' }} />
          <Title level={4} style={{ margin: 0, color: '#000' }}>
            Registration Fees payment
          </Title>
        </Space>
        {/* <Text type="secondary">View your biodata details here</Text> */}
       
  <PaystackButton className='btn btn-green' {...componentProps} />
      </Space>
    </Card>

  </div>
  </>
)}
{view===false && (
  <>
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Add Courses</h2>
      <form onSubmit={handleSubmit}>
        {courses.map((course, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <label htmlFor={`course-${index}`}>Course {index + 1}</label>
            <select
              id={`course-${index}`}
              value={course}
              onChange={(e) => handleCourseChange(index, e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="">Select a course</option>
              {availableCourses.map((availableCourse) => (
                <option key={availableCourse.id} value={availableCourse.course}>
                  {availableCourse.course}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddCourse}
          style={{
            background: "#028f64",
            color: "white",
            border: "none",
            padding: "10px 15px",
            cursor: "pointer",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          Add Course
        </button>
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          {loading ? "Saving..." : "Save Courses"}
        </button>
      </form>
    </div>
    </>
)}

        <div style={{ backgroundColor: '#028f64', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
          Your First Semester Courses to Register
        </div>

        <Table
          columns={columns}
          dataSource={userCourses}
          rowKey="code"
          pagination={false}
          bordered
          style={{ backgroundColor: 'white' , margin:'2%'}}
        />
      </div>
    </>
  );
};

export default Course_reg;
