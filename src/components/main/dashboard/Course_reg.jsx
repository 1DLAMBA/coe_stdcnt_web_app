import React, { useState } from 'react';
import { Button, Input, Table, Typography, Space } from 'antd';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Course_reg = () => {
  const [courses, setCourses] = useState([
    { title: 'INTRODUCTION TO JAVA PROGRAMMING', code: 'CSC 401', unit: 3, type: 'Core', semester: 'FIRST', session: '2023/2024' },
    { title: 'COMPILER CONSTRUCTION I', code: 'CSC 403', unit: 2, type: 'Core', semester: 'FIRST', session: '2023/2024' },
    { title: 'DATA COMMUNICATION AND NETWORK I', code: 'CSC 405', unit: 3, type: 'Core', semester: 'FIRST', session: '2023/2024' },
    { title: 'OBJECT ORIENTED ANALYSIS AND DESIGN', code: 'CSC 409', unit: 2, type: 'Core', semester: 'FIRST', session: '2023/2024' },
    { title: 'INTRODUCTION TO LINUX AND SHELL PROGRAMMING', code: 'CSC 407', unit: 2, type: 'Core', semester: 'FIRST', session: '2023/2024' },
    { title: 'THEORY AND PROBLEMS OF SOFTWARE ENGINEERING', code: 'CSC 411', unit: 3, type: 'Core', semester: 'FIRST', session: '2023/2024' },
  ]);

  const handleDelete = (code) => {
    setCourses(courses.filter(course => course.code !== code));
  };

  const columns = [
    {
      title: 'COURSE TITLE',
      dataIndex: 'title',
      key: 'title',
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
    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#028f64', padding: '10px', color: 'white', display: 'flex', alignItems: 'center' }}>
        <ArrowLeftOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Back to Dashboard</Text>
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <Title level={2} style={{ color: '#028f64' }}>Course Registration</Title>
      </div>

      <div style={{ backgroundColor: '#e6f7ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <Title level={4} style={{ color: '#028f64' }}>Add more courses</Title>
        <Input
          placeholder="Search for course title, course code"
          prefix={<SearchOutlined style={{ color: '#028f64' }} />}
          style={{ borderRadius: '8px', borderColor: '#028f64', maxWidth: '400px' }}
        />
        <Text style={{ display: 'block', marginTop: '10px', color: '#028f64' }}>
          These are the courses you have registered for the <strong>2023/2024</strong> session
        </Text>
      </div>

      <div style={{ backgroundColor: '#028f64', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px' }}>
        Your First Semester Courses to Register
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="code"
        pagination={false}
        bordered
        style={{ backgroundColor: 'white' }}
      />
    </div>
  );
};

export default Course_reg;
