import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowDownOutlined, ArrowUpOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, ConfigProvider, Statistic, Tag,Button, Table, Input, Select, Spin } from 'antd';
import axios from "axios";
import '../admin-pages/styles/application.css';
import API_ENDPOINTS from "../../../../../Endpoints/environment";


const { Search } = Input;
const { Option } = Select;

export const Admin_dashboard = () => {
    const [data, setData] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noAdmissionCount, setNoAdmissionCount] = useState(0);
    const [matricNumberCount, setMatricNumberCount] = useState(0);
    const [approvedStudents, setApprovedStudents] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [search, setSearch] = useState("");
    const [studyCent, setStudyCent] = useState("");
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/personal-details`);
            console.log(response)
            const filteredData = response.data.filter((student) => !student.matric_number);
            setData(filteredData);
            setNoAdmissionCount(response.data.filter((student) => !student.has_admission).length);
            setMatricNumberCount(response.data.filter((student) => student.matric_number).length);
            setApprovedStudents(response.data.filter((student) => student.has_admission && !student.matric_number).length);
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);







    useEffect(() => {
        fetchStudents(pagination.current, search, studyCent);
      }, [pagination.current, search, studyCent]);
  const fetchStudents = async (page, searchValue, studyCentValue) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINTS.API_BASE_URL}/personal-details-paged`, {
        params: {
          page,
          search: searchValue,
          study_cent: studyCentValue,
          type: null,
        },
      });

      setStudents(response.data.data); // Laravel paginates in `data`
      setPagination({
        ...pagination,
        total: response.data.total, // Total count for pagination
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination({ ...pagination });
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleFilterChange = (value) => {
    setStudyCent(value);
  };

  const columns = [
    {
        title: "Name",
        dataIndex: "other_names",
        key: "other_names",
      },
    
    {
      title: "Application/ Matric Number",
      dataIndex: "application_number",
      key: "application_number",
    },
    {
      title: "Study Center",
      dataIndex: "desired_study_cent",
      key: "desired_study_cent",
    },{
      title: "Has Admission",
      dataIndex: "has_admission",
      key: "has_admission",
      render: (has_admission) => (
        <span>
          {has_admission ? (
           <Tag color="green">Yes</Tag>
          ) : (
            <Tag color="red">No</Tag>
          )}
        </span>
      ),},
       {
          title: "Programme Type",
          dataIndex: "bio_registration.mode_of_entry",
          key: "programme_type",
          render: (_, record) => {
            const modeOfEntry = record.bio_registration?.mode_of_entry;
            return (
              <span>
                {modeOfEntry === 'pre_nce' ? (
                  <Tag color="green">Pre NCE</Tag>
                ) : (
                  <Tag color="cyan">{modeOfEntry || 'Direct NCE'}</Tag>
                )}
              </span>
            );
          },
        },
    
  ];

    return (
        <div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', marginTop: '1%' }}>
                <Col span={5}>
                    <Card bordered={false}>
                        <Statistic
                            title="New Applications"
                            value={noAdmissionCount}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<UserOutlined />}
                        />
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

                        <Button type="primary" ghost onClick={() => navigate('/admin/view-applications')}>
                            View List
                        </Button>
                    </ConfigProvider>
                    </Card>
                </Col>
                <Col span={5}>
                    <Card bordered={false}>
                        <Statistic
                            title="Students with Matric Number"
                            value={matricNumberCount}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
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
                        <Button disabled type="primary" >
                            View List
                        </Button>
                    </ConfigProvider>
                    </Card>
                </Col>
                <Col span={5}>
                    <Card bordered={false}>
                        <Statistic
                            title="Approved Students"
                            value={approvedStudents}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
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
                        <Button type="primary" ghost onClick={()=>navigate('/admin/view-approved')} >
                            View List
                        </Button>
                    </ConfigProvider>
                    </Card>
                </Col>
                </div>

            <div style={{ width: '85%', display: '', justifyContent: 'space-around', margin: '2% auto' }}>
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
                <div className="flex gap-4 mb-4">
        <Search
          placeholder="Search by Matric/Application Number"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />

        <Select
          placeholder="Filter by Study Center"
          allowClear
          onChange={handleFilterChange}
          style={{ width: 200 }}
        >
          <Option value="Salka">Salka</Option>
          <Option value="Mokwa">Mokwa</Option>
          <Option value="suleja">Suleja</Option>
          <Option value="Kagara">Kagara</Option>
          <Option value="New Bussa">New Bussa</Option>
          <Option value="Gulu">Gulu</Option>
          <Option value="Gawu">Gawu</Option>
          <Option value="Doko">Doko</Option>
          <Option value="Katcha">Katcha</Option>
        </Select>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={students}
          rowKey={(record) => record.id}
          pagination={pagination}
          onChange={handleTableChange}
          bordered
        />
      </Spin>
      </ConfigProvider>

            </div>
        </div>
    );
};