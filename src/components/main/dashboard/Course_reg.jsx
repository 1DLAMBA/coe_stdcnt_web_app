import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  message,
  Button, Input, Spin, Table, Typography, ConfigProvider, Popover, Popconfirm, Dropdown, Space, Breadcrumb, Select, Form,
  Flex, Divider, Row, Col

} from 'antd';
import './BioData.css';
import { FieldTimeOutlined, BookFilled, NumberOutlined, BookOutlined, AppstoreAddOutlined, TagOutlined, DeleteOutlined, TrophyOutlined, CalendarOutlined, ReadOutlined, HomeFilled, SaveOutlined, FolderAddFilled, DollarOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { PaystackButton } from "react-paystack";
import { studyCenters } from "./data";
import { Card } from 'antd';
import axios from 'axios';
import API_ENDPOINTS from '../../../Endpoints/environment';
import {
  FEE_ACADEMIC_SESSIONS,
  LAST_FEE_SESSION as LAST_SESSION,
  CURRENT_FEE_SESSION as CURRENT_SESSION,
  computeCourseRegFeeState,
  allowPartial60ForSession,
  isNewIntakeByMatric,
} from '../../../utils/schoolFeesFlags';
import {
  isLastSessionFeeOnBackup,
  syncBackupSchoolFeesAfterPayment,
} from '../../../services/schoolFeesService';

const { Title, Text } = Typography;
const { Option } = Select;

const Course_reg = () => {
  const [courses, setCourses] = useState([""]); // Start with one empty course field
  const [courseInfo, setCourseInfo] = useState(''); // Start with one empty course field
  const [userCourses, setUserCourses] = useState([]); // Start with one empty course field
  const [disabled, setDisabled] = useState(true); // Start with one empty course field
  const [user2ndCourses, setUser2ndCourses] = useState([""]); // Start with one empty course field
  const [user1stCourses, setUser1stCourses] = useState([""]); // Start with one empty course field
  const [loading, setLoading] = useState(false);
  const [couseLoading, setCourseLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [view, setView] = useState(true);
  const [user, setUser] = useState('');
  const [form] = Form.useForm();
  const [modeOfCourse, setModeOfCourse] = useState("");
  const [subjectOfStudy, setSubjectOfStudy] = useState("");
  const [session, setSession] = useState("");
  const [levelOfCourse, setLevelOfCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [courseSemesterData, setCourseSemesterData] = useState([
    { course: "", semester: "", course_type: "" }
  ]);
  const [spinning, setSpinning] = useState(false);
  const [deletingAllCourses, setDeletingAllCourses] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const publicKey = API_ENDPOINTS.PAYSTACK_PUBLIC_KEY;
  const [applicationNumber, setApplicationNumber] = useState('');
  const [feePaymentSession, setFeePaymentSession] = useState('');
  const [backupUser, setBackupUser] = useState(null);
  const isFeeSessionValid = FEE_ACADEMIC_SESSIONS.includes(feePaymentSession);
  const amount = 4000000;
  const amount60 = 2400000;
  const amount40 = 1600000;
  const [availableCourses, setAvailableCourses] = useState([]);
  const userId = localStorage.getItem('id')
  const { id } = useParams();
  const [centerAccount, setCenterAccount] = useState('');

  const isNewByMatric = isNewIntakeByMatric(user?.matric_number);
  const feeState = computeCourseRegFeeState(user, backupUser, isNewByMatric);
  const {
    lastSessionPaid,
    currentSessionPaid,
    branchBPActive,
    partial40Active,
    partial40Session,
    feesCardLockedTo,
    showCourseReg,
    hasBackup,
  } = feeState;

  const paystackFeeSession =
    partial40Active && partial40Session ? partial40Session : feePaymentSession;
  const isPaystackFeeSessionValid = FEE_ACADEMIC_SESSIONS.includes(paystackFeeSession);

  useEffect(() => {
    if (!user || typeof user !== "object" || !user.id) return;
    const isNew = isNewIntakeByMatric(user.matric_number);
    const state = computeCourseRegFeeState(user, backupUser, isNew);
    if (state.partial40Session) {
      setFeePaymentSession(state.partial40Session);
    } else if (state.firstUnpaidSession) {
      setFeePaymentSession(state.firstUnpaidSession);
    }
  }, [user, backupUser]);

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

  const handleSchoolFeePaySuccess = async (reference, payType, formData) => {
    const paidOn = new Date();
    const session = isPaystackFeeSessionValid
      ? paystackFeeSession
      : isFeeSessionValid
        ? feePaymentSession
        : null;
    const lastSessionOnBackup = isLastSessionFeeOnBackup(session, backupUser);

    if (lastSessionOnBackup) {
      try {
        await syncBackupSchoolFeesAfterPayment(
          id,
          payType,
          session,
          reference.reference
        );
      } catch (error) {
        console.error('Backup fee update failed:', error);
      }
      localStorage.setItem('app_number', applicationNumber);
      const sessionQs = `?session=${encodeURIComponent(session)}`;
      window.location.href = `/dashboard/${id}/fees-receipt${sessionQs}`;
      return;
    }

    const payload = {
      couse_fee_date: reference.reference,
      course_fee_reference: paidOn.toISOString().split('T')[0],
      ...formData,
      ...(session && { fee_academic_session: session }),
    };
    localStorage.setItem('UserData', JSON.stringify(payload));
    localStorage.setItem('app_number', applicationNumber);
    try {
      await axios.put(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`, payload);
    } catch (error) {
      console.error('Primary fee update failed:', error);
    }
    if (session === LAST_SESSION) {
      await syncBackupSchoolFeesAfterPayment(
        id,
        payType,
        session,
        reference.reference
      );
    }
    const sessionQs = session
      ? `?session=${encodeURIComponent(session)}`
      : '';
    window.location.href = `/dashboard/${id}/fees-receipt${sessionQs}`;
  };

  const componentProps = {
    email,
    amount,
    disabled: !isFeeSessionValid,
    metadata: {
      id: id,
      pay_type: "complete_school_fees",
      fee_session: feePaymentSession,
      // regNumber
    },
    publicKey,
    ...(API_ENDPOINTS.ENABLE_SPLITS && {
      split: {
        type: "flat",
        subaccounts: [
          //Bantigi Oasis
          { subaccount: "ACCT_1hli5sgrrcfuas9", share: 74700 },
          // COE ACCOUNT
          { subaccount: "ACCT_aan2ehxiej239du", share: 1900000 },
          //CENTER ACCOUNT
          { subaccount: centerAccount, share: 1906200 },
        ],
      },
    }),
    text: "Pay Complete Fees Now",
    onSuccess: (reference) =>
      handleSchoolFeePaySuccess(reference, 'complete_school_fees', {
        course_paid: true,
        has_paid: true,
      }),
    onClose: () => alert("Wait! Don't leave :("),
  };

  const component60Props = {
    email,
    amount: 2400000,
    disabled: !isFeeSessionValid,
    metadata: {
      id: id,
      pay_type: "partial_school_fees",
      fee_session: feePaymentSession,
      // regNumber
    },
    publicKey,
    ...(API_ENDPOINTS.ENABLE_SPLITS && {
      split: {
        type: "flat",
        subaccounts: [
          // Daniel ALAMBA
          { subaccount: "ACCT_1hli5sgrrcfuas9", share: 65000 },
          // COE ACCOUNT
          { subaccount: "ACCT_aan2ehxiej239du", share: 1110000 },
          //CENTER ACCOUNT
          { subaccount: centerAccount, share: 1113500 },
        ],
      },
    }),
    text: "Pay 60% Now",
    onSuccess: (reference) =>
      handleSchoolFeePaySuccess(reference, 'partial_school_fees', {
        has_paid: true,
      }),
    onClose: () => alert("Wait! Don't leave :("),
  };

  const component40Props = {
    email,
    amount: 1600000,
    disabled: !isPaystackFeeSessionValid,
    metadata: {
      id: id,
      pay_type: "school_fees_completion",
      fee_session: paystackFeeSession,
      // regNumber
    },
    publicKey,
    ...(API_ENDPOINTS.ENABLE_SPLITS && {
      split: {
        type: "flat",
        subaccounts: [
          //DANIEL ALAMBA
          { subaccount: "ACCT_1hli5sgrrcfuas9", share: 43000 },
          // COE ACCOUNT
          { subaccount: "ACCT_aan2ehxiej239du", share: 738500 },
          //CENTER ACCOUNT
          { subaccount: centerAccount, share: 740000 },
        ],
      },
    }),
    text: "Pay Now",
    onSuccess: (reference) =>
      handleSchoolFeePaySuccess(reference, 'school_fees_completion', {
        has_paid: true,
        course_paid: true,
      }),
    onClose: () => alert("Wait! Don't leave :("),
  };

  const handleAddCourse = () => {
    setLoading(true)
    setCourseSemesterData([...courseSemesterData, { course: "", semester: "", course_type: "" }]);
    fetchUser()
    setLoading(false)
  };

  const handleDelete = (code) => {
    setCourses(courses.filter(course => course.code !== code));
  };



  const allowPartial60 = allowPartial60ForSession(feePaymentSession);

  const paymentPopoverContent = (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: 'green',
            borderRadius: 2,
            textAlign: 'start',
            colorBgContainer: '#f6ffed',
          },
        }}
      >
        <PaystackButton style={{ width: '100%', margin: '2%' }} className='btn btn-green' {...componentProps} />
        {allowPartial60 && (
          <>
            <br />
            <br />
            <PaystackButton style={{ width: '100%', margin: '2%' }} className='btn btn-green' {...component60Props} />
          </>
        )}
      </ConfigProvider>
    </div>
  );

  /** Old session locked card: full payment only (no 60% split). */
  const lastSessionFullPayOnlyContent = (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: 'green',
            borderRadius: 2,
            textAlign: 'start',
            colorBgContainer: '#f6ffed',
          },
        }}
      >
        <PaystackButton style={{ width: '100%', margin: '2%' }} className='btn btn-green' {...componentProps} />
      </ConfigProvider>
    </div>
  );
  const handleCourseChange = (index, value) => {
    const updatedData = [...courseSemesterData];
    updatedData[index].course = value;
    setCourseSemesterData(updatedData);
  };
  const handleSessionChange = (value) => {
    setSession(value); // ✅ Correct
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

  const splitAndSetCourses = (allCourses = []) => {
    setUserCourses(allCourses);
    setUser1stCourses(allCourses.filter((course) => course.semester === "1st"));
    setUser2ndCourses(allCourses.filter((course) => course.semester === "2nd"));
  };

  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;

    setDeletingCourseId(courseId);
    try {
      await axios.delete(`${API_ENDPOINTS.API_BASE_URL}/courses/${courseId}`);
      const updatedCourses = userCourses.filter((course) => course.id !== courseId);
      splitAndSetCourses(updatedCourses);
      if (updatedCourses.length === 0) {
        setDisabled(false);
      }
      message.success('Course deleted successfully');
    } catch (error) {
      console.error("Error deleting course:", error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleDeleteAllCourses = async () => {
    if (!user?.id) {
      message.error('Unable to resolve application ID');
      return;
    }

    setDeletingAllCourses(true);
    try {
      await axios.delete(`${API_ENDPOINTS.API_BASE_URL}/courses/application/${user.id}`);
      splitAndSetCourses([]);
      setDisabled(false);
      message.success('All registered courses deleted successfully');
    } catch (error) {
      if (error.response?.status === 404) {
        splitAndSetCourses([]);
        setDisabled(false);
        message.info('No registered courses to delete');
      } else {
        console.error("Error deleting all courses:", error.response?.data || error);
        message.error(error.response?.data?.message || 'Failed to delete registered courses');
      }
    } finally {
      setDeletingAllCourses(false);
    }
  };

  const handleSubmit = async (e) => {
    // e?.preventDefault();
    console.log("User Courses ", courses)
    setLoading(true);
    if (!courseSemesterData) {
      message.info('No course Selected')
      return;
    }
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
        navigate(`/dashboard/${id}`)
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
    // Define the function before using it
    const setCenterAccountBySite = (studyCenter) => {
      switch (studyCenter) {
        case 'New Bussa':
          return 'ACCT_p76xm5gfunxqp89';
        case 'Gulu':
          return 'ACCT_0saux3r5q758ky6';
        case 'suleja':
          return 'ACCT_n3bppexq5wd5n85';
        case 'Gawu':
          return 'ACCT_by8wdwd0a10g68u';
        case 'Mokwa':
          return 'ACCT_bvaybztnxq9r7mk';
        case 'Kagara':
          return 'ACCT_sr3hi6ohw6w5bd3';
        case 'Rijau':
          return 'ACCT_te7rbklmjj58gja';
        case 'Kontogora':
          return 'ACCT_zbec9c9igq0alsz';
        case 'Doko':
          return 'ACCT_pft4xrq2nn8z3kz';
        case 'Katcha':
          return 'ACCT_q7hpb8aop6872xk';
        case 'Salka':
          return 'ACCT_ol4nfqttt60d9my';
        case 'Bida':
          return 'ACCT_xbd6r3fuguhi807';
        case 'Patigi':
          return 'ACCT_8bh96hpa23avb1w';
        case 'Pandogari':
          return 'ACCT_5ljhtgc5cihxenj';
        case 'Agaie':
          return 'ACCT_7quhzixmwkaz3o7';
        default:
          return 'ACCT_aan2ehxiej239du'; // Default COE account
      }
    };

    try {
      const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/course-data`);
      setAvailableCourses(response.data || []);
      console.log('COURSES fetched', response);

      const backupUrl = API_ENDPOINTS.PERSONAL_DETAILS_BACKUP;
      const backupPromise = backupUrl
        ? axios.get(`${backupUrl}/${id}`).then((r) => r?.data || null).catch(() => null)
        : Promise.resolve(null);

      const [user, backupRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`),
        backupPromise,
      ]);
      console.log('USER fetched', user);
      console.log('BACKUP USER fetched', backupRes);

      handleCenterChange(user.data.desired_study_cent);
      setUser(user.data);
      setBackupUser(backupRes || null);

      const isNewByMatric = isNewIntakeByMatric(user.data.matric_number);
      const feeState = computeCourseRegFeeState(
        user.data,
        backupRes,
        isNewByMatric
      );
      setFeePaymentSession(feeState.firstUnpaidSession || '');

      // Move the center account logic here
      if (user.data.desired_study_cent) {
        const centerAccount = setCenterAccountBySite(user.data.desired_study_cent);
        setCenterAccount(centerAccount);
        console.log('Center Account', centerAccount);
      }

      const bio = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/bio-registrations/${user.data.id}`);
      console.log("USER BUI", bio);

      setCourseLoading(false);
      setSpinning(false);

      // finding the user courses
      const center = await studyCenters.find((sc) => sc.name === user.data.desired_study_cent);
      if (center && center.levels[Number(bio.data.level)]) {
        console.log(center.levels[Number(bio.data.level)]);
        setCourses(center.levels[Number(bio.data.level)]);
      }

      if (!bio.data.level) {
        navigate(`/Dashboard/${id}/bio-data`);
      } else {
        console.log("USER BIO", bio.data);
        setEmail(user.data.email);
        handleLevelChange(bio.data.level);
        setApplicationNumber(user.data.application_number);
      }

      const courses = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/courses/${user.data.id}`);
      console.log("USER COURSES", courses);
      splitAndSetCourses(courses.data || []);
      if (courses.data) {
        setDisabled(false);
      }
      form.setFieldsValue({
        mode_of_course: courses.data[0]?.mode_of_course,
        subject_of_study: courses.data[0]?.subject_of_study,
        session: courses.data[0]?.session,
        level_of_course: courses.data[0]?.level_of_course,
      });
      if (user.data.course_paid) {
        setView(false);
      }

      if (courses) {
        setView(false);
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
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete this course?"
          description="This action cannot be undone."
          onConfirm={() => handleDeleteCourse(record.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            loading: deletingCourseId === record.id,
          }}
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            disabled={!record.id}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const sessionOptionDisabled = (s) =>
    (s === LAST_SESSION && (lastSessionPaid || isNewByMatric)) ||
    (s === CURRENT_SESSION && currentSessionPaid);

  return (

    <>
      <Breadcrumb style={{ marginLeft: '8.7%', marginTop: '1%', backgroundColor: 'white', width: '82.5%', color: 'white', borderRadius: '15px', padding: '0.5%' }} itemRender={itemRender} items={items} />
      <Spin spinning={spinning} fullscreen />
      <div style={{ padding: '0 ', backgroundColor: '#fff', minHeight: '100vh', width: '83%', margin: '1% auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Title level={2} style={{ color: '#fff' }}>Course Registration</Title>

        </div>

        <div style={{ textAlign: 'center', margin: '20px' }}>
        </div>
        {(partial40Active || branchBPActive) && (
          <div style={{ maxWidth: 560, margin: '24px auto', padding: '0 16px', width: '100%' }}>
            <Card
              bordered={false}
              styles={{ body: { padding: 0 } }}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(2, 143, 100, 0.12), 0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #028f64 0%, #06a87a 100%)',
                  padding: '20px 24px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BookFilled style={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                    Complete Fees Payment
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    {branchBPActive ? 'Carry-over from previous system' : 'Outstanding 40% balance'}
                  </Text>
                </div>
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {branchBPActive
                    ? LAST_SESSION
                    : (partial40Session || feePaymentSession || 'Select session')}
                </span>
              </div>

              <div style={{ padding: '20px 24px 24px' }}>
                <div
                  style={{
                    background: '#f6fbf8',
                    border: '1px solid #d6efe2',
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginBottom: 18,
                  }}
                >
                  <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>
                    Amount due
                  </Text>
                  <Text strong style={{ color: '#028f64', fontSize: 24, lineHeight: 1.1 }}>
                    ₦16,000
                  </Text>
                </div>

                <Text type="secondary" style={{ display: 'block', marginBottom: 18, lineHeight: 1.6 }}>
                  {branchBPActive ? (
                    <>You have an outstanding 40% balance from your <strong>{LAST_SESSION}</strong> session in the previous system. Complete it below to unlock current-session fees.</>
                  ) : partial40Session ? (
                    <>Completing the outstanding 40% balance for the <strong>{partial40Session}</strong> session.</>
                  ) : (
                    <>You have an outstanding 40% balance. Select the academic session this payment belongs to and pay below.</>
                  )}
                </Text>

                <div style={{ marginBottom: 18 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
                    Academic Session
                  </Text>
                  <Select
                    placeholder="Select academic session"
                    value={branchBPActive ? LAST_SESSION : (feePaymentSession || undefined)}
                    onChange={setFeePaymentSession}
                    style={{ width: '100%' }}
                    disabled={branchBPActive || !!partial40Session}
                    size="large"
                    suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                  >
                    {FEE_ACADEMIC_SESSIONS.map((s) => (
                      <Option
                        key={s}
                        value={s}
                        disabled={branchBPActive ? s !== LAST_SESSION : sessionOptionDisabled(s)}
                      >
                        {s}
                      </Option>
                    ))}
                  </Select>
                  {!branchBPActive && !isFeeSessionValid && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
                      Choose an academic session to enable payment.
                    </Text>
                  )}
                </div>

                <PaystackButton
                  style={{ width: '100%', margin: '1%' }}
                  className='btn btn-green'
                  {...component40Props}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 10, fontSize: 12, textAlign: 'center' }}>
                  Secured by Paystack · Payment is recorded on the main system.
                </Text>
              </div>
            </Card>
          </div>
        )}

        {!partial40Active && !branchBPActive && feesCardLockedTo && (
          <div className='' style={{ margin: '2% auto' }}>
            <Card
              bordered={false}
              style={{
                maxWidth: 600,
                margin: '0 auto',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                padding: '16px',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <BookOutlined style={{ fontSize: '24px', color: '#000' }} />
                  <Title level={4} style={{ margin: 0, color: '#000' }}>
                    School Fees Payment
                  </Title>
                </Space>

                {feesCardLockedTo === LAST_SESSION ? (
                  <Text type="secondary">
                    Your <strong>{LAST_SESSION}</strong> session fees from the previous system are outstanding. Complete them before course registration is unlocked.
                  </Text>
                ) : (
                  <Text type="secondary">
                    Pay your <strong>{CURRENT_SESSION}</strong> session school fees to unlock course registration.
                  </Text>
                )}

                <div style={{ width: '100%' }}>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>
                    Academic Session
                  </Text>
                  <Select
                    value={feePaymentSession || undefined}
                    onChange={setFeePaymentSession}
                    style={{ width: '100%' }}
                    suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                  >
                    {FEE_ACADEMIC_SESSIONS.map((s) => (
                      <Option key={s} value={s} disabled={s !== feesCardLockedTo || sessionOptionDisabled(s)}>{s}</Option>
                    ))}
                  </Select>
                </div>

                <Popover
                  content={
                    feesCardLockedTo === LAST_SESSION
                      ? lastSessionFullPayOnlyContent
                      : paymentPopoverContent
                  }
                  trigger="click"
                >
                  <Button
                    style={{ textAlign: 'start' }}
                    block
                    className='btn btn-green'
                    variant="outlined"
                    disabled={!isFeeSessionValid}
                  >
                    Select Payment option
                  </Button>
                </Popover>
              </Space>
            </Card>
          </div>
        )}

        {!partial40Active && !feesCardLockedTo && !hasBackup && feeState.needsCurrentSessionPayment && (
          <div className='' style={{ margin: '2% auto' }}>
            <Card
              bordered={false}
              style={{
                maxWidth: 600,
                margin: '0 auto',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                padding: '16px',
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <BookOutlined style={{ fontSize: '24px', color: '#000' }} />
                  <Title level={4} style={{ margin: 0, color: '#000' }}>
                    Registration Fees payment
                  </Title>
                </Space>

                <Text type="secondary">Pay your school fees to unlock course registration.</Text>

                <div style={{ width: '100%' }}>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>
                    Academic Session
                  </Text>
                  <Select
                    placeholder="Select academic session"
                    value={feePaymentSession || undefined}
                    onChange={setFeePaymentSession}
                    style={{ width: '100%' }}
                    suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                  >
                    {FEE_ACADEMIC_SESSIONS.map((s) => (
                      <Option key={s} value={s} disabled={sessionOptionDisabled(s)}>{s}</Option>
                    ))}
                  </Select>
                  {!isFeeSessionValid && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                      Choose an academic session to enable payment.
                    </Text>
                  )}
                </div>

                <Popover content={paymentPopoverContent} trigger="click">
                  <Button
                    style={{ textAlign: 'start' }}
                    block
                    className='btn btn-green'
                    variant="outlined"
                    disabled={!isFeeSessionValid}
                  >
                    Select Payment option
                  </Button>
                </Popover>
              </Space>
            </Card>
          </div>
        )}

        {showCourseReg && (
          <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
                  <div className="registration-container" style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>


                      <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Row gutter={24}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Mode Of Course"
                              name="mode_of_course"
                              rules={[{ required: true, message: 'Please enter mode of course' }]}
                            >
                              <Input
                                placeholder="Mode Of Course"
                                prefix={<ReadOutlined style={{ color: '#bfbfbf' }} />}
                                value={modeOfCourse}
                                disabled={disabled}
                                onChange={(e) => setModeOfCourse(e.target.value)}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Subject Of Study"
                              name="subject_of_study"
                              rules={[{ required: true, message: 'Please enter subject of study' }]}
                            >
                              <Input
                                placeholder="Subject Of Study"
                                prefix={<BookOutlined style={{ color: '#bfbfbf' }} />}
                                value={subjectOfStudy}
                                disabled={disabled}
                                onChange={(e) => setSubjectOfStudy(e.target.value)}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={24}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Session"
                              name="session"
                              rules={[{ required: true, message: 'Please select a session' }]}
                            >
                              <Select
                                placeholder="Select a session"
                                value={session}
                                onChange={handleSessionChange}
                                suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                              >
                                <Option value="" disabled>Select a session</Option>
                                <Option value="2024/2025">2024/2025</Option>
                                <Option value="2025/2026">2025/2026</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Level Of Course"
                              name="level_of_course"
                              rules={[{ required: true, message: 'Please enter level of course' }]}
                            >
                              <Input
                                placeholder="Level Of Course"
                                prefix={<TrophyOutlined style={{ color: '#bfbfbf' }} />}
                                value={levelOfCourse}
                                disabled={disabled}
                                onChange={(e) => setLevelOfCourse(e.target.value)}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Divider orientation="left">
                          <Space>
                            <AppstoreAddOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                            <Text strong style={{ fontSize: '18px' }}>Add Courses</Text>
                          </Space>
                        </Divider>

                        {courseSemesterData.map((data, index) => (
                          <Card
                            key={index}
                            style={{ marginBottom: '16px' }}
                            size="small"
                            bordered
                            extra={
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                type="text"
                              />
                            }
                          >
                            <Row gutter={16}>
                              <Col xs={24} md={8}>
                                <Form.Item
                                  label={<Space><NumberOutlined /> Course {index + 1}</Space>}
                                  required
                                >
                                  <Input
                                    value={data.course}
                                    onChange={(e) => handleCourseChange(index, e.target.value)}
                                    placeholder="Enter course"
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </Col>

                              <Col xs={24} md={8}>
                                <Form.Item
                                  label={<Space><FieldTimeOutlined /> Semester</Space>}
                                  required
                                >
                                  <Select
                                    value={data.semester}
                                    onChange={(value) => handleSemesterChange(index, value)}
                                    placeholder="Select semester"
                                    style={{ width: '100%' }}
                                  >
                                    <Option value="">Select Semester</Option>
                                    <Option value="1st">1st Semester</Option>
                                    <Option value="2nd">2nd Semester</Option>
                                  </Select>
                                </Form.Item>
                              </Col>

                              <Col xs={24} md={8}>
                                <Form.Item
                                  label={<Space><TagOutlined /> Course Type</Space>}
                                  required
                                >
                                  <Select
                                    value={data.course_type}
                                    onChange={(value) => handleCourseType(index, value)}
                                    placeholder="Select course type"
                                    style={{ width: '100%' }}
                                  >
                                    <Option value="">Select Course Type</Option>
                                    <Option value="core">Core</Option>
                                    <Option value="elective">Elective</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                          </Card>
                        ))}

                        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '16px' }}>
                          <Button
                            type="dashed"
                            onClick={handleAddCourse}
                            icon={<PlusCircleOutlined />}
                            block
                          >
                            Add Course
                          </Button>

                          <Form.Item>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={loading}
                              icon={<SaveOutlined />}
                              size="large"
                              color='green'
                              style={{ width: '100%', height: '45px' }}
                              className='btn btn-green'
                            >
                              {loading ? "Saving..." : "Save Registration"}
                            </Button>
                          </Form.Item>
                        </Space>
                      </Form>
                    </Space>
                  </div>
          </div>
        )}


        <div style={{ backgroundColor: '#028f64', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span>Registered Courses</span>
          <Popconfirm
            title="Delete all registered courses?"
            description="This will remove every registered course for this application."
            onConfirm={handleDeleteAllCourses}
            okText="Delete All"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deletingAllCourses }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deletingAllCourses}
              disabled={deletingAllCourses || userCourses.length === 0}
            >
              Delete All Registered Courses
            </Button>
          </Popconfirm>
        </div>
        <div className="responsive-tables-container">


          <Table
            columns={columns}
            dataSource={user1stCourses}
            rowKey={(record) => record.id ?? record.code}
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
            rowKey={(record) => record.id ?? record.code}
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
