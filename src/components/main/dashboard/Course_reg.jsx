import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  message,
  Button, Input, Spin, Table, Typography, ConfigProvider, Popover, Dropdown, Space, Breadcrumb, Select, Form,
  Flex

} from 'antd';
import './BioData.css';
import { ArrowLeftOutlined, SearchOutlined, BookOutlined, HomeFilled, SaveFilled, FolderAddFilled, PlusCircleFilled } from '@ant-design/icons';
import { PaystackButton } from "react-paystack";
import { studyCenters } from "./data";
import { Card } from 'antd';
import axios from 'axios';
import API_ENDPOINTS from '../../../Endpoints/environment';

const { Title, Text } = Typography;

const { Option } = Select;


const Course_reg = () => {
  const [courses, setCourses] = useState([""]); // Start with one empty course field
  const [courseInfo, setCourseInfo] = useState(''); // Start with one empty course field
  const [userCourses, setUserCourses] = useState([""]); // Start with one empty course field
  const [user2ndCourses, setUser2ndCourses] = useState([""]); // Start with one empty course field
  const [user1stCourses, setUser1stCourses] = useState([""]); // Start with one empty course field
  const [loading, setLoading] = useState(false);
  const [couseLoading, setCourseLoading] = useState(true);
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
  const [spinning, setSpinning] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const publicKey = "pk_live_a0e748b1c573eab4ee5c659fe004596ecd25a232";
  const [applicationNumber, setApplicationNumber] = useState('');
  const amount = 4000000;
  const amount60 = 2400000;
  const amount40 = 1600000;
  const [availableCourses, setAvailableCourses] = useState([]);
  const userId = localStorage.getItem('id')
  const { id } = useParams();

  const itemLink = [
    {
      key: '1',
      label: '1st item',
    },
    {
      key: '2',
      label: '2nd item',
    },
    {
      key: '3',
      label: '3rd item',
    },
  ];

  const items = [
    {
      path: `/Dashboard/${id}`,
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
  const componentProps = {
    email,
    amount,
    metadata: {
      // name,
      // phone,
      // regNumber
    },
    publicKey,
    split: {
      type: "flat",
      subaccounts: [
        //Daniel Alamba
        { subaccount: "ACCT_32iz48sbi1fshex", share: 69000 },
        // COE ACCOUNT
        { subaccount: "ACCT_aan2ehxiej239du", share: 3800000 },

        // { subaccount: "ACCT_32iz48sbi1fshex", share: 50000 },
      ]
    },
    text: "Pay Complete Fees Now",
    onSuccess: (reference) => {
      const paidOn = new Date();
      const formData = {
        couse_fee_date: reference.reference,

        course_fee_reference: paidOn.toISOString().split('T')[0],
        course_paid: true,
        has_paid: true

      };
      localStorage.setItem('UserData', formData)
      localStorage.setItem('app_number', applicationNumber)
      const response = axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`,
        formData,
      );
      navigate(`/dashboard/${id}`);

    },
    onClose: () => alert("Wait! Don't leave :("),
  };

  const component60Props = {
    email,
    amount: 2400000,
    metadata: {
      // name,
      // phone,
      // regNumber
    },
    publicKey,
    split: {
      type: "flat",
      subaccounts: [
        // Daniel ALAMBA
        { subaccount: "ACCT_32iz48sbi1fshex", share: 69000 },
        // COE ACCOUNT
        { subaccount: "ACCT_aan2ehxiej239du", share: 2220000 },

        // { subaccount: "ACCT_32iz48sbi1fshex", share: 50000 },
      ]
    },
    text: "Pay 60% Now",
    onSuccess: (reference) => {
      const paidOn = new Date();
      const formData = {
        couse_fee_date: reference.reference,

        course_fee_reference: paidOn.toISOString().split('T')[0],
        has_paid: true

      };
      localStorage.setItem('UserData', formData)
      localStorage.setItem('app_number', applicationNumber)
      const response = axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`,
        formData,
      );
      navigate(`/dashboard/${id}`);

    },
    onClose: () => alert("Wait! Don't leave :("),
  };

  const component40Props = {
    email,
    amount: 1600000,
    metadata: {
      // name,
      // phone,
      // regNumber
    },
    publicKey,
    split: {
      type: "flat",
      subaccounts: [
        //DANIEL ALAMBA
        { subaccount: "ACCT_32iz48sbi1fshex", share: 40000 },
        // COE ACCOUNT
        { subaccount: "ACCT_aan2ehxiej239du", share: 1480000 },

        // { subaccount: "ACCT_32iz48sbi1fshex", share: 50000 },
      ]
    },
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
      navigate(`/dashboard/${id}`);

    },
    onClose: () => alert("Wait! Don't leave :("),
  };

  const handleAddCourse = () => {
    setCourseSemesterData([...courseSemesterData, { course: "", semester: "", course_type: "" }]);
    fetchUser()
  };

  const handleDelete = (code) => {
    setCourses(courses.filter(course => course.code !== code));
  };



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
        <PaystackButton style={{width:'100%', margin:'2%'}} className='btn btn-green' {...componentProps} />
        <br/>
        <br/>

        <PaystackButton style={{width:'100%', margin:'2%'}} className='btn btn-green' {...component60Props} />

      </ConfigProvider>
    </div>
  );
  const handleCourseChange = (index, value) => {
    const updatedData = [...courseSemesterData];
    updatedData[index].course = value;
    setCourseSemesterData(updatedData);
  };
  const handleSessionChange = (e) => {
    setSession(e.target.value);
    console.log("Selected session:", e.target.value);
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

          return axios.post(`${API_ENDPOINTS.API_BASE_URL}/courses`, payload);
        });

        await Promise.all(promises);
        // navigate(`/dashboard/${id}`);

        // alert("Courses added successfully PLEASE LOG OUT AND LOG IN AGAIN!!");
        // fetchUser();
        setCourses([""]); // Reset the form
      } catch (error) {
        console.error("Error adding courses:", error.response?.data || error);
        alert(`Failed to add courses: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
        navigate(`dashboard/${id}`)
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

          return axios.post(`${API_ENDPOINTS.API_BASE_URL}/courses`, payload);
        });

        await Promise.all(promises);

        message.success("Courses added successfully!");
        window.location.href = `/dashboard/${id}/`;

      } catch (error) {
        console.error("Error adding courses:", error.response?.data || error);
        alert(`Failed to add courses: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }

  };

  const fetchUser = async () => {
    // console.log('check')
    try {
      const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/course-data`);
      setAvailableCourses(response.data || []); // Assuming the API returns user data in `response.data`
      console.log('COURSES fetched', response);
      const user = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
      console.log('USER fetched', user);
      handleCenterChange(user.data.desired_study_cent);

      setUser(user.data)

      const bio = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/bio-registrations/${user.data.id}`);
      console.log("USER BUI", bio)

      setCourseLoading(false)

      setSpinning(false)

      // finding the user courses
      const center = await studyCenters.find((sc) => sc.name === user.data.desired_study_cent)
      if (center && center.levels[Number(bio.data.level)]) {
        console.log(center.levels[Number(bio.data.level)])

        setCourses(center.levels[Number(bio.data.level)])
      }
      if (!bio.data.application_number) {
        navigate(`/Dashboard/${id}/bio-data`)
      } else {
        console.log("USER BIO", bio.data)
        setEmail(user.data.email)
        handleLevelChange(bio.data.level);

        setApplicationNumber(user.data.application_number)

      }

      const courses = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/courses/${user.data.id}`);
      console.log("USER COURSES", courses)
      setUserCourses(courses.data);
      const toBeFiltered = courses.data;
      const filteredCourses = toBeFiltered.filter(
        (course) => course.semester === "1st"
      );
      const filtered2ndCourses = toBeFiltered.filter(
        (course) => course.semester === "2nd"
      );


      if (user.data.course_paid) {
        setView(false)
      }
      setUser1stCourses(filteredCourses)
      setUser2ndCourses(filtered2ndCourses)

      if (courses) {
        setView(false)
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    setSpinning(true)
    // console.log('check')


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
      <Spin spinning={spinning}  fullscreen />
      <div style={{ padding: '0 ', backgroundColor: '#fff', minHeight: '100vh', width: '83%', margin: '1% auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Title level={2} style={{ color: '#fff' }}>Course Registration</Title>

        </div>

        <div style={{ textAlign: 'center', margin: '20px' }}>
        </div>
        {!user.course_paid ? (
          <>
            <div className='' style={{ margin: '2% auto' }}>
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
                  {user.has_paid && !user.course_paid ? (<>
                    <Space>


                      <BookOutlined style={{ fontSize: '24px', color: '#000' }} />
                      <Title level={4} style={{ margin: 0, color: '#000' }}>
                        Continue Registration Fees payment
                      </Title>
                    </Space>
                    {/* <Text type="secondary">View your biodata details here</Text> */}

                    <PaystackButton className='btn btn-green' {...component40Props} />
                  </>) : !user.has_paid && !user.course_paid ? (<>
                    <Space>


                      <BookOutlined style={{ fontSize: '24px', color: '#000' }} />
                      <Title level={4} style={{ margin: 0, color: '#000' }}>
                        Registration Fees payment
                      </Title>
                    </Space>
                    <Popover content={content} trigger="click">


                      <Button style={{ textAlign: 'start' }} block className='btn btn-green' variant="outlined">
                        Select Payment option
                      </Button>
                    </Popover>
                  </>) : (<></>)}
                </Space>
              </Card>

            </div>
          </>
        ) : (

          <>
            <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
              {userCourses[0]?.mode_of_course ? (
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
                        <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0]?.subject_of_study}</p>
                      </div>
                      <div>
                        <strong>Session:</strong>
                        <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0]?.session}</p>
                      </div>
                      <div>
                        <strong>Level of Course:</strong>
                        <p style={{ margin: "5px 0", color: "#555" }}>{userCourses[0]?.level_of_course}</p>
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

                        <select
                          value={session}
                          onChange={handleSessionChange}
                          style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <option value="" disabled>
                            Select a session
                          </option>
                          <option value="2024/2025">2024/2025</option>
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
                            {courses ? (
                              <>
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
                                  {courses.map((course, index) => (
                                    <option key={index} value={course}>
                                      {course}
                                    </option>
                                  ))}
                                </select>
                              </>
                            ) : (
                              <></>
                            )}

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
                      Add <PlusCircleFilled />
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
        {/* {view === false && (
          <>
           
          </>
        )} */}

        <div style={{ backgroundColor: '#028f64', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
          Registered Courses
        </div>
        <div className="responsive-tables-container">


        <Table
    columns={columns}
    dataSource={user1stCourses}
    rowKey="code"
    title={() => 'First Semester'}
    pagination={false}
    bordered
    style={{ 
      backgroundColor: 'white', 
      marginBottom: '20px',
      width: '100%'
    }}
    scroll={{ x: true }}
    size="small"
    className="course-table"
  />

  <Table
    columns={columns}
    dataSource={user2ndCourses}
    title={() => 'Second Semester'}
    rowKey="code"
    pagination={false}
    bordered
    style={{ 
      backgroundColor: 'white', 
      width: '100%'
    }}
    scroll={{ x: true }}
    size="small"
    className="course-table"
  />
        </div>
      </div>
    </>
  );
};

export default Course_reg;
