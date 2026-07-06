import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  Card,
  ConfigProvider,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import API_ENDPOINTS from "../../../../Endpoints/environment";
import {
  backupHasRecord,
  canRequestClearance,
  isFullyPaid,
  isNewIntakeByMatric,
  isPaidFlag,
  LAST_FEE_SESSION,
  CURRENT_FEE_SESSION,
  fetchBackupPersonalByIds,
} from "../../../../utils/schoolFeesFlags";
import "./admin-pages/styles/application.css";

const { Title, Text } = Typography;
const { Option } = Select;

const styles = {
  container: {
    padding: "1.5rem 5%",
    maxWidth: "90%",
    margin: "0 auto",
  },
};

const BACKUP_FETCH_CONCURRENCY = 6;

const Admin_Clearance = () => {
  const [clearances, setClearances] = useState([]);
  const [backupByPersonalId, setBackupByPersonalId] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deptForm] = Form.useForm();

  const fetchClearances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.CLEARANCES);
      const rows = response.data?.data || [];
      setClearances(rows);

      if (API_ENDPOINTS.PERSONAL_DETAILS_BACKUP && rows.length) {
        const ids = rows.map((r) => r.personal_detail_id);
        const map = await fetchBackupPersonalByIds(
          axios,
          ids,
          API_ENDPOINTS.PERSONAL_DETAILS_BACKUP,
          BACKUP_FETCH_CONCURRENCY
        );
        setBackupByPersonalId(map);
      } else {
        setBackupByPersonalId({});
      }
    } catch (error) {
      console.error("Error loading clearance requests:", error);
      message.error("Unable to load clearance requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CLEARANCE_DEPARTMENTS);
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading clearance departments:", error);
      message.error("Unable to load departments.");
    }
  };

  useEffect(() => {
    fetchClearances();
    fetchDepartments();
  }, [fetchClearances]);

  const handleApprove = (record) => {
    Modal.confirm({
      title: "Approve Clearance",
      content:
        "This will approve all departments and the clearance request. Do you want to continue?",
      okText: "Yes, Approve All",
      cancelText: "Cancel",
      okButtonProps: { style: { backgroundColor: "#028f64", borderColor: "#028f64" } },
      onOk: async () => {
        try {
          const deptsToApprove = (record.departments || []).filter((d) => d.status !== "approved");
          for (const dept of deptsToApprove) {
            await axios.post(
              `${API_ENDPOINTS.CLEARANCES}/${record.id}/departments/${dept.department_id}`,
              { status: "approved" }
            );
          }
          await axios.post(`${API_ENDPOINTS.CLEARANCES}/${record.id}/approve`);
          message.success("Clearance approved.");
          fetchClearances();
        } catch (error) {
          console.error("Error approving clearance:", error);
          const errors = error.response?.data?.errors;
          const firstFieldError = errors?.graduation?.[0] || errors?.payment?.[0] || errors?.departments?.[0];
          message.error(firstFieldError || error.response?.data?.message || "Unable to approve clearance.");
        }
      },
    });
  };

  const handleReject = async (record) => {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) {
      return;
    }

    try {
      await axios.post(`${API_ENDPOINTS.CLEARANCES}/${record.id}/reject`, { reason });
      message.success("Clearance rejected.");
      fetchClearances();
    } catch (error) {
      console.error("Error rejecting clearance:", error);
      message.error(error.response?.data?.message || "Unable to reject clearance.");
    }
  };

  const handleDepartmentStatus = async (clearanceId, departmentId, status) => {
    let reason = null;
    if (status === "rejected") {
      reason = window.prompt("Reason for department rejection?");
      if (!reason) {
        return;
      }
    }

    try {
      await axios.post(`${API_ENDPOINTS.CLEARANCES}/${clearanceId}/departments/${departmentId}`, {
        status,
        reason,
      });
      message.success("Department status updated.");
      fetchClearances();
    } catch (error) {
      console.error("Error updating department status:", error);
      message.error(error.response?.data?.message || "Unable to update department status.");
    }
  };

  const handleAddDepartment = async (values) => {
    try {
      await axios.post(API_ENDPOINTS.CLEARANCE_DEPARTMENTS, values);
      message.success("Department added.");
      deptForm.resetFields();
      fetchDepartments();
    } catch (error) {
      console.error("Error adding department:", error);
      message.error(error.response?.data?.message || "Unable to add department.");
    }
  };

  const handleToggleDepartment = async (department, isActive) => {
    try {
      await axios.put(`${API_ENDPOINTS.CLEARANCE_DEPARTMENTS}/${department.id}`, {
        is_active: isActive,
      });
      message.success("Department updated.");
      fetchDepartments();
    } catch (error) {
      console.error("Error updating department:", error);
      message.error(error.response?.data?.message || "Unable to update department.");
    }
  };

  const handleDeleteDepartment = async (department) => {
    try {
      await axios.delete(`${API_ENDPOINTS.CLEARANCE_DEPARTMENTS}/${department.id}`);
      message.success("Department deleted.");
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      message.error(error.response?.data?.message || "Unable to delete department.");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Student",
        dataIndex: ["student", "other_names"],
        key: "student",
        render: (_, record) => (
          <span>
            {record.student?.surname} {record.student?.other_names}
          </span>
        ),
      },
      {
        title: "Matric Number",
        dataIndex: "matric_number",
        key: "matric_number",
      },
      {
        title: "Level",
        dataIndex: ["student", "level"],
        key: "level",
        render: (level) => level || "N/A",
      },
      {
        title: "Graduation",
        dataIndex: "on_graduation_list",
        key: "on_graduation_list",
        render: (onList) => (
          <Tag color={onList ? "green" : "red"}>{onList ? "On list" : "Not on list"}</Tag>
        ),
      },
      {
        title: "Fees Status",
        key: "fees_status",
        render: (_, record) => {
          const backup = backupByPersonalId[record.personal_detail_id];
          const student = record.student;
          const isNew = isNewIntakeByMatric(student?.matric_number);
          const hasBackup = backupHasRecord(backup) && !isNew;
          const backupFull = hasBackup && isFullyPaid(backup);
          const primaryFull = isFullyPaid(student);
          const eligible = canRequestClearance(student, backup, isNew);

          const backupLabel = !hasBackup
            ? "—"
            : backupFull
              ? "Complete"
              : isPaidFlag(backup?.has_paid)
                ? "Partial"
                : "Unpaid";
          const primaryLabel = primaryFull
            ? "Complete"
            : isPaidFlag(student?.has_paid)
              ? "Partial"
              : "Unpaid";

          return (
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {LAST_FEE_SESSION} (backup): <Tag>{backupLabel}</Tag>
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {CURRENT_FEE_SESSION} (primary): <Tag>{primaryLabel}</Tag>
              </Text>
              <Tag color={eligible ? "green" : "red"}>
                Clearance: {eligible ? "Eligible" : "Blocked"}
              </Tag>
            </Space>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status === "approved" ? "green" : status === "rejected" ? "red" : "gold"}>
            {status}
          </Tag>
        ),
      },
      {
        title: "Acceptance Paid",
        dataIndex: "acceptance_paid",
        key: "acceptance_paid",
        render: (paid) => <Tag color={paid ? "green" : "default"}>{paid ? "Paid" : "Unpaid"}</Tag>,
      },
      {
        title: "Receipt",
        dataIndex: "fees_receipt_url",
        key: "fees_receipt_url",
        render: (url) =>
          url ? (
            <a href={url} target="_blank" rel="noreferrer">
              View PDF
            </a>
          ) : (
            "N/A"
          ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => {
          const backup = backupByPersonalId[record.personal_detail_id];
          const isNew = isNewIntakeByMatric(record.student?.matric_number);
          const feesEligible = canRequestClearance(record.student, backup, isNew);
          const canApprove = record.on_graduation_list && feesEligible && record.status === "pending";
          return (
            <Space wrap>
              <Button
                type="primary"
                style={{ backgroundColor: "#028f64", borderColor: "#028f64" }}
                onClick={() => handleApprove(record)}
                disabled={!canApprove}
              >
                Approve
              </Button>
              <Button danger onClick={() => handleReject(record)} disabled={record.status === "rejected"}>
                Reject
              </Button>
            </Space>
          );
        },
      },
    ],
    [backupByPersonalId]
  );

  const themeConfig = { token: { colorPrimary: "#028f64" } };

  return (
    <ConfigProvider theme={themeConfig}>
      <div style={styles.container}>
        <Title level={3}>Clearance Requests</Title>
        <Text>Review, approve, and manage student clearance requests.</Text>
        <Divider />

        <Card style={{ marginBottom: "1.5rem" }} title="Manage Clearance Departments">
          <Form
            layout="inline"
            form={deptForm}
            onFinish={handleAddDepartment}
            style={{ flexWrap: "wrap", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <Form.Item name="name" rules={[{ required: true, message: "Department name is required." }]}>
              <Input placeholder="Department name" style={{ minWidth: 160 }} />
            </Form.Item>
            <Form.Item name="is_active" valuePropName="checked" initialValue>
              <Switch />
            </Form.Item>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: "#028f64", borderColor: "#028f64" }}>
              Add Department
            </Button>
          </Form>

          <Divider />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {departments.map((department) => (
              <Card key={department.id} size="small" style={{ flex: "0 0 auto", minWidth: 140 }}>
                <Space align="center" style={{ flexWrap: "nowrap" }}>
                  <Text strong style={{ whiteSpace: "nowrap" }}>
                    {department.name}
                  </Text>
                  <Switch
                    checked={department.is_active}
                    onChange={(checked) => handleToggleDepartment(department, checked)}
                  />
                  <Popconfirm title="Delete this department?" onConfirm={() => handleDeleteDepartment(department)}>
                    <Button danger size="small">
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            ))}
          </div>
        </Card>

        <Card title="Clearance Requests">
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={clearances}
            expandable={{
              expandedRowRender: (record) => (
                <div>
                  <Title level={5}>Department Status</Title>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {(record.departments || []).map((department) => (
                      <Card key={department.id} size="small" style={{ flex: "0 0 auto", minWidth: 200 }}>
                        <Space wrap align="center">
                          <Text style={{ whiteSpace: "nowrap" }}>{department.department_name}</Text>
                          <Tag
                            color={
                              department.status === "approved"
                                ? "green"
                                : department.status === "rejected"
                                ? "red"
                                : "gold"
                            }
                          >
                            {department.status}
                          </Tag>
                          <Select
                            value={department.status}
                            onChange={(value) => handleDepartmentStatus(record.id, department.department_id, value)}
                            style={{ minWidth: 100 }}
                            size="small"
                          >
                            <Option value="pending">Pending</Option>
                            <Option value="approved">Approved</Option>
                            <Option value="rejected">Rejected</Option>
                          </Select>
                        </Space>
                        {department.reason && (
                          <Text type="secondary" style={{ display: "block", marginTop: "0.5rem" }}>
                            Reason: {department.reason}
                          </Text>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ),
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Admin_Clearance;
