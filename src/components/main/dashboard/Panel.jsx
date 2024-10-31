import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { Routes, useNavigate } from 'react-router-dom';


const { Title, Text } = Typography;

const Panel = () => {
  const navigate = useNavigate();
  function routeBio() {
    navigate('/dashboard/Bio-data');
  }
  function routeCourse() {
    navigate('/dashboard/Course_reg');
  }
  return (
    <>
   
    <div className="d-flex m-auto" style={{width:'100%',  justifyContent:'space-around', paddingTop: '2%', flexWrap:'wrap'}}>


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
          <UserOutlined style={{ fontSize: '24px', color: '#000' }} />
          <Title level={4} style={{ margin: 0, color: '#000' }}>
            MY PERSONAL DATA
          </Title>
        </Space>
        <Text type="secondary">View your biodata details here</Text>
        <Button type="primary" onClick={routeBio} style={{ backgroundColor: '#028f64', borderColor: '#028f64' }}>
          View
        </Button>
      </Space>
    </Card>
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
            Course Registration
          </Title>
        </Space>
        {/* <Text type="secondary">View your biodata details here</Text> */}
        <Button disabled variant='outlined' type="primary" onClick={routeCourse} style={{ backgroundColor: '#fff', borderColor: '#028f64' }}>
          View
        </Button>
      </Space>
    </Card>

    </div>

 
    </>
  );
};

export default Panel;
