import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  Button, Input, Table, Typography, Space, Breadcrumb, Select, Form,
  Flex

} from 'antd';
import { ArrowLeftOutlined, SearchOutlined, BookOutlined, HomeFilled, SaveFilled, FolderAddFilled, PlusCircleFilled } from '@ant-design/icons';
import { PaystackButton } from "react-paystack";
import { studyCenters } from "./data";

import { Card } from 'antd';
import axios from 'axios';
import API_ENDPOINTS from '../../../Endpoints/environment';

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
  const { id } = useParams();
  const [courses, setCourses] = useState([""]); // Start with one empty course field
  const [courseInfo, setCourseInfo] = useState(''); // Start with one empty course field
  const [userCourses, setUserCourses] = useState([""]); // Start with one empty course field
  const [user2ndCourses, setUser2ndCourses] = useState([""]); // Start with one empty course field
  const [user1stCourses, setUser1stCourses] = useState([""]); // Start with one empty course field
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState("");
const [selectedLevel, setSelectedLevel] = useState("");
  const [view, setView] = useState(true);
  const [user, setUser] = useState('');
  const [modeOfCourse, setModeOfCourse] = useState("");
  const [subjectOfStudy, setSubjectOfStudy] = useState("");
  const [session, setSession] = useState("");
  const [levelOfCourse, setLevelOfCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [courseSemesterData, setCourseSemesterData] = useState([
    { course: "", semester: "", course_type: "" }
  ]);

  const [email, setEmail] = useState("danielalamba@gmail.com");
  const navigate = useNavigate();
  const publicKey = "pk_test_3fbb14acfe497c070f67293c2f7f6bcb1b9228a9";
  const [applicationNumber, setApplicationNumber] = useState('');
  const amount = 200000;
  const [availableCourses, setAvailableCourses] = useState([]);
  const userId = localStorage.getItem('id')
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
        couse_fee_date: reference.reference,

        course_fee_reference: paidOn.toISOString().split('T')[0],
        course_paid: true

      };
      localStorage.setItem('UserData', formData)
      localStorage.setItem('app_number', applicationNumber)
      const response = axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`,
        formData,
      );
      navigate('/dashboard');

    },
    onClose: () => alert("Wait! Don't leave :("),
  };

  const handleAddCourse = () => {
    setCourseSemesterData([...courseSemesterData, { course: "", semester: "", course_type: "" }]);
  };

  const handleDelete = (code) => {
    setCourses(courses.filter(course => course.code !== code));
  };


  const handleCourseChange = (index, value) => {
    const updatedData = [...courseSemesterData];
    updatedData[index].course = value;
    setCourseSemesterData(updatedData);
  };

  const handleSemesterChange = (index, value) => {
    const updatedData = [...courseSemesterData];
    updatedData[index].semester = value;
    setCourseSemesterData(updatedData);
  };

  const handleCourseType = (index, value) => {
    const updatedData = [...courseSemesterData];
    updatedData[index].course_type = value;
    setCourseSemesterData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("User Courses ", courses)
    setLoading(true);
    if (userCourses[0]?.mode_of_course) {
      try {
        const promises = courseSemesterData.map((item) => {
          const payload = {

            application_id: user.id, // Replace with the actual application ID
            course: item.course.trim(),
            semester: item.semester.trim(),
            course_type: item.course_type.trim(),
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

    } else {
      try {
        const promises = courseSemesterData.map((item) => {
          const payload = {
            mode_of_course: modeOfCourse,
            subject_of_study: subjectOfStudy,
            session: session,
            level_of_course: levelOfCourse,
            application_id: user.id, // Replace with the actual application ID
            course: item.course.trim(),
            semester: item.semester.trim(),
            course_type: item.course_type.trim(),
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
    }

  };

  useEffect(() => {
    // console.log('check')
    const fetchUser = async () => {
      // console.log('check')
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/course-data`);
        setAvailableCourses(response.data || []); // Assuming the API returns user data in `response.data`
        console.log('COURSES fetched', response);
        const user = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
        console.log('USER fetched', user);
        handleCenterChange(user.data.desired_study_cent);

        setUser(user.data)
        if (user.data.course_paid) {
          setView(false)
        }
        const bio = await axios.get(`http://127.0.0.1:8000/api/bio-registrations/${user.data.id}`);
        console.log("USER BUI", bio)

        if (!bio.data.application_number) {
          navigate(`/Dashboard/${id}/bio-data`)
        } else {
          console.log("USER BIO", bio.data)
          setEmail(user.data.email)
        handleLevelChange(bio.data.level);

          setApplicationNumber(user.data.application_number)

        }

        const courses = await axios.get(`http://127.0.0.1:8000/api/courses/${user.data.id}`);
        console.log("USER COURSES", courses)
        setUserCourses(courses.data);
        const toBeFiltered = courses.data;
        const filteredCourses = toBeFiltered.filter(
          (course) => course.semester === "1st"
        );
        const filtered2ndCourses = toBeFiltered.filter(
          (course) => course.semester === "2nd"
        );

      

        setUser1stCourses(filteredCourses)
        setUser2ndCourses(filtered2ndCourses)

        if (courses) {
          setView(false)
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };


      fetchUser(); // Call the async function to fetch data
    
  }, []); // Only re-run if `userId` changes

// Handle level change
const handleLevelChange = (stDlevel) => {
  const level = stDlevel;
  setSelectedLevel(level);

  // Find the selected center and fetch the courses for the level
  const centerData = studyCenters.find((center) => center.name === selectedCenter);
  if (centerData && centerData.levels[level]) {
    setAvailableCourses(centerData.levels[level]);
  } else {
    setCourses([]);
  }
};


  const handleCenterChange = (DESIREDCourse) => {
    const center = DESIREDCourse;
    setSelectedCenter(center);
    setSelectedLevel(""); // Reset level and courses
    setAvailableCourses([]);
  };

  const columns = [
    {
      title: 'COURSE TITLE',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'CORE/ELECTIVE',
      dataIndex: 'course_type',
      key: 'course_type',
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
    // {
    //   title: 'DELETE',
    //   key: 'delete',
    //   render: (_, record) => (
    //     <Button
    //       type="primary"
    //       danger
    //       onClick={() => handleDelete(record.code)}
    //     >
    //       DELETE
    //     </Button>
    //   ),
    // },
  ];

  return (

    <>
      <Breadcrumb style={{ marginLeft: '8.7%', marginTop: '1%', backgroundColor: 'white', width: '82.5%', color: 'white', borderRadius: '15px', padding: '0.5%' }} itemRender={itemRender} items={items} />

      <div style={{ padding: '0 ', backgroundColor: '#fff', minHeight: '100vh', width: '83%', margin: '1% auto' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Title level={2} style={{ color: '#fff' }}>Course Registration</Title>

        </div>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
        </div>
        {view === true && (
          <>
            <div className='' style={{ margin: '2%' }}>
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
        {view === false && (
          <>
            <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
              {!userCourses[0]?.mode_of_course ? (
                <>
 <div
      style={{
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Course Details
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          lineHeight: "1.5",
        }}
      >
        <div>
          <strong>Mode of Course:</strong>
          <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0]?.mode_of_course}</p>
        </div>
        <div>
          <strong>Subject of Study:</strong>
          <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0].subject_of_study}</p>
        </div>
        <div>
          <strong>Session:</strong>
          <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0].session}</p>
        </div>
        <div>
          <strong>Level of Course:</strong>
          <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0].level_of_course}</p>
        </div>
      </div>
    </div>
                </>
              ) : (
                <>
                  <form onSubmit={handleSubmit}>


                    <div style={{ display: 'flex' }}>
                      <div style={{ display: '' }}>
                        <label htmlFor='mode_of_course'>Mode Of Course</label>

                        <input value={modeOfCourse}
                          onChange={(e) => setModeOfCourse(e.target.value)}
                          placeholder="Mode Of Course"
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }} />

                      </div>
                      <div style={{ display: '' }}>
                        <label htmlFor='subject_of_study'>Subject Of Study</label>

                        <input value={subjectOfStudy}
                          onChange={(e) => setSubjectOfStudy(e.target.value)}
                          placeholder="Subject Of study"
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }} />

                      </div>
                    </div>

                    <div style={{ display: 'flex' }}>
                      <div style={{ display: '' }}>
                        <label htmlFor='session'>Session</label>

                        <select value={session}
                          onChange={(e) => setSession(e.target.value)}
                          placeholder="Session"
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }} >
                            <option key='2024/2025' value="2024/2025">
                            2024/2025
                            </option> 
                            </select>

                      </div>
                      <div style={{ display: '' }}>
                        <label htmlFor='level_of_course'>Level Of Course</label>

                        <input value={levelOfCourse}
                          onChange={(e) => setLevelOfCourse(e.target.value)}
                          placeholder="Level Of Course"
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }} />

                      </div>
                    </div>


                    <h2>Add Courses</h2>

                    {courseSemesterData.map((data, index) => (
                      <>
                        <div className='' style={{ display: 'flex', justifyContent: 'space-between' }}>


                          <div key={index} style={{ margin: '1%' }}>
                            <label htmlFor={`course-${index}`}>Course {index + 1}</label>
                            <select
                              id={`course-${index}`}
                              value={data.course}
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

                          <div key={index} style={{ margin: '1%' }}>
                            <label htmlFor={`semester-${index}`}>semester {index + 1}</label>
                            <select
                              id={`semester-${index}`}
                              value={data.semester}
                              onChange={(e) => handleSemesterChange(index, e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                            >
                              <option value="">Select Semester</option>

                              <option key="1" value="1st">
                                1st Semester
                              </option>
                              <option key="2" value="2nd">
                                2nd Semester
                              </option>

                            </select>

                          </div>

                          <div key={index} style={{ margin: '1%' }}>
                            <label htmlFor={`course_type-${index}`}>Course Type </label>
                            <select
                              id={`course_type-${index}`}
                              value={data.course_type}
                              onChange={(e) => handleCourseType(index, e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                            >
                              <option value="">Select Course Type</option>

                              <option key="1" value="core">
                                Core
                              </option>
                              <option key="2" value="elective">
                                Elective
                              </option>

                            </select>

                          </div>
                        </div>
                      </>

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
                      <PlusCircleFilled />
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
                      <SaveFilled /> &nbsp;
                      {loading ? "Saving..." : "Save "}
                    </button>
                  </form>
                </>
              )}

            </div>
          </>
        )}

        <div style={{ backgroundColor: '#028f64', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
          Registered Courses
        </div>
        <Flex style={{justifyContent:'space-evenly'}}>


        <Table
          columns={columns}
          dataSource={user1stCourses}
          rowKey="code"
          title={() => 'First Semester'}
          pagination={false}
          bordered
          style={{ backgroundColor: 'white', margin: '2%' }}
        />

        <Table
          columns={columns}
          dataSource={user2ndCourses}
          title={() => 'Second Semester'}
          rowKey="code"
          pagination={false}
          bordered
          style={{ backgroundColor: 'white', margin: '2%' }}
        />
        </Flex>
      </div>
    </>
  );
};

export default Course_reg;
