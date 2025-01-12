import React, { useEffect, useState } from "react";
import { Table, Tag, Spin } from "antd";
import axios from "axios";
import '../admin-pages/styles/application.css'

const View_applications = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Full Name",
      dataIndex: ["bio_data", "full_name"],
      key: "full_name",
    },
    {
      title: "Phone Number",
      dataIndex: ["bio_data", "phone_number"],
      key: "phone_number",
    },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference",
    },

    {
      title: "Has Paid",
      dataIndex: "has_paid",
      key: "has_paid",
      render: (has_paid) => (
        <Tag color={has_paid ? "green" : "red"}>
          {has_paid ? "Yes" : "No"}
        </Tag>
      ),
    },
   
    {
      title: "Programme",
      dataIndex: "programme",
      key: "programme",
    },
    {
      title: "Application Number",
      dataIndex: "application_number",
      key: "application_number",
    },
    {
        title: "Fees Date",
        dataIndex: "fees_date",
        key: "fees_date",
      },
   
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/applications"); // Replace with your API endpoint
        setData(response.data.data); // Assume the data is returned in response.data
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (

    <>
    <div className="application_table">
        
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.id} // Use ID as a unique key
        pagination={{ pageSize: 10 }} // Pagination settings
        bordered
      />
    </Spin>
        </div>    
    </>
  );
};

export default View_applications;
