import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Divider, Tag, Typography, Alert, message, Spin, ConfigProvider, Breadcrumb, Space } from "antd";
import { FileTextOutlined, HomeFilled } from "@ant-design/icons";
import { PaystackButton } from "react-paystack";
import axios from "axios";
import API_ENDPOINTS from "../../../Endpoints/environment";
import { compressPdf } from "../../../utils/compressPdf";
import "./BioData.css";

const { Title, Text } = Typography;

const MAX_PDF_SIZE_KB = 5120;

const CLEARANCE_AMOUNT = 8731;

const Student_Clearance = () => {
  const { id } = useParams();
  const [personalDetail, setPersonalDetail] = useState(null);
  const [clearanceRequests, setClearanceRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [feesReceipt, setFeesReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const activeRequest = useMemo(() => clearanceRequests?.[0], [clearanceRequests]);
  const hasPaid = personalDetail?.has_paid == 1;
  const coursePaid = personalDetail?.course_paid == 1;
  const isEligible = hasPaid && coursePaid;
  const hasOpenRequest = activeRequest && activeRequest.status !== "rejected";
  const isRejected = activeRequest?.status === "rejected";

  const fetchPersonalDetail = async () => {
    setLoading(true);
    try {
      const personalResponse = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
      setPersonalDetail(personalResponse.data);
    } catch (error) {
      console.error("Error loading clearance data:", error);
      message.error("Unable to load clearance details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClearanceData = async () => {
    try {
      const [clearanceResponse, departmentResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.CLEARANCES, { params: { personal_detail_id: id } }),
        axios.get(API_ENDPOINTS.CLEARANCE_DEPARTMENTS),
      ]);

      setClearanceRequests(clearanceResponse.data?.data || []);
      setDepartments(departmentResponse.data || []);
    } catch (error) {
      console.error("Error loading clearance data:", error);
      message.error("Unable to load clearance details.");
    }
  };

  useEffect(() => {
    fetchPersonalDetail();
    fetchClearanceData();
  }, [id]);

  const breadcrumbItems = [
    { path: `/dashboard/${id}`, title: <HomeFilled /> },
    { path: `/dashboard/${id}/clearance`, title: "Clearance" },
  ];

  const itemRender = (currentRoute, params, items, paths) => {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;
    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={currentRoute.path}>{currentRoute.title}</Link>
    );
  };

  const handleSubmit = async () => {
    if (!isEligible) {
      message.error("You must complete school fees before requesting clearance.");
      return;
    }

    if (!feesReceipt) {
      message.error("Please upload your school fees receipt (PDF).");
      return;
    }

    try {
      setLoading(true);
      let fileToUpload = feesReceipt;

      if (feesReceipt.size / 1024 > MAX_PDF_SIZE_KB) {
        setCompressing(true);
        message.loading({ content: "Compressing PDF...", key: "compress" });
        try {
          fileToUpload = await compressPdf(feesReceipt);
          if (fileToUpload.size / 1024 > MAX_PDF_SIZE_KB) {
            message.error({
              content: "File still too large after compression. Try an online PDF compressor.",
              key: "compress",
            });
            setLoading(false);
            setCompressing(false);
            return;
          }
          message.success({ content: "PDF compressed successfully", key: "compress" });
        } catch (err) {
          console.error("Compression failed:", err);
          message.error({
            content: err?.message || "Failed to compress PDF. Try a smaller file or use an online compressor.",
            key: "compress",
          });
          setLoading(false);
          setCompressing(false);
          return;
        }
        setCompressing(false);
      }

      const formData = new FormData();
      formData.append("personal_detail_id", id);
      formData.append("fees_receipt", fileToUpload);

      await axios.post(API_ENDPOINTS.CLEARANCES, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Clearance request submitted.");
      setFeesReceipt(null);
      fetchPersonalDetail();
      fetchClearanceData();
    } catch (error) {
      console.error("Error submitting clearance:", error);
      message.error(error.response?.data?.message || "Failed to submit clearance request.");
    } finally {
      setLoading(false);
    }
  };

  const paystackProps = {
    email: personalDetail?.email,
    amount: CLEARANCE_AMOUNT * 100,
    publicKey: API_ENDPOINTS.PAYSTACK_PUBLIC_KEY,
    metadata: {
      id,
      pay_type: "clearance_acceptance",
      clearance_request_id: activeRequest?.id,
    },
    split:{
      type: "flat",
      // Daniel ALAMBA
      subaccounts: [
        { subaccount: "ACCT_1hli5sgrrcfuas9", share: 63000 },
        // COE ACCOUNT
        { subaccount: "ACCT_aan2ehxiej239du", share: 680000 },
            ]
    },
    text: `Pay ₦${CLEARANCE_AMOUNT} Clearance Fee`,
    onSuccess: async (reference) => {
      message.success("Payment successful. Updating status...");
      try {
        await axios.post(
          `${API_ENDPOINTS.CLEARANCES}/${activeRequest?.id}/mark-acceptance-paid`,
          { reference: reference?.reference || reference }
        );
      } catch (err) {
        console.error("Error updating backend:", err);
        message.warning("Payment succeeded but status update failed. Webhook may still apply.");
      }
      fetchPersonalDetail();
      fetchClearanceData();
    },
    onClose: () => message.info("Payment cancelled."),
  };

  if (loading && !personalDetail) {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", width: "83%", margin: "1% auto" }}>
        <Spin size="large" />
      </div>
    );
  }

  const themeConfig = { token: { colorPrimary: "#028f64" } };

  return (
    <ConfigProvider theme={themeConfig}>
      <>
        <Breadcrumb
          style={{
            marginLeft: "8.7%",
            marginTop: "1%",
            backgroundColor: "white",
            width: "82.5%",
            borderRadius: "15px",
            padding: "0.5%",
          }}
          itemRender={itemRender}
          items={breadcrumbItems}
        />
        <Spin spinning={loading || compressing} fullscreen tip={compressing ? "Compressing PDF..." : undefined} />
        <div
          style={{
            padding: "1rem 2%",
            backgroundColor: "#fff",
            minHeight: "70vh",
            width: "83%",
            margin: "1% auto",
            display: "flex",
            flexDirection: "column",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              backgroundColor: "#028f64",
              padding: "12px",
              color: "white",
              display: "flex",
              alignItems: "center",
              marginBottom: "1.5rem",
              borderRadius: "8px 8px 0 0",
            }}
          >
            <FileTextOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              Student Clearance
            </Title>
          </div>

          <Text style={{ marginBottom: "1rem", display: "block" }}>
            Submit your clearance request and track approvals from departments.
          </Text>

          {personalDetail && (personalDetail?.has_paid != 1 || personalDetail?.course_paid != 1) && (
            <Alert
              type="warning"
              showIcon
              message="School fees incomplete"
              description="You must complete both application and course fees before requesting clearance."
              style={{ marginBottom: "1.5rem" }}
            />
          )}

          <Card
            title="Clearance Request"
            loading={loading}
            style={{ marginBottom: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
          >
            {hasOpenRequest ? (
              <>
                <Text strong>Status:</Text>{" "}
                <Tag color={activeRequest.status === "approved" ? "green" : "gold"}>
                  {activeRequest.status.toUpperCase()}
                </Tag>

                <Divider />
                <Text strong>Departments:</Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
                  {(activeRequest.departments || []).map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Text>{item.department_name}</Text>
                      <Tag color={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "gold"}>
                        {item.status}
                      </Tag>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {isRejected && (
                  <Alert
                    type="error"
                    showIcon
                    message="Previous request rejected"
                    description={activeRequest.rejection_reason || "No reason provided"}
                    style={{ marginBottom: "1rem" }}
                  />
                )}
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <div>
                    <Text strong>School Fees Receipt (PDF)</Text>
                    <Text type="secondary" style={{ display: "block", fontSize: "12px", marginTop: "4px" }}>
                      Max 5MB. Larger files will be compressed automatically.
                    </Text>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(event) => setFeesReceipt(event.target.files?.[0])}
                      style={{
                        display: "block",
                        marginTop: "8px",
                        padding: "8px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        width: "100%",
                        maxWidth: 320,
                      }}
                    />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    style={{ backgroundColor: "#028f64", borderColor: "#028f64" }}
                    onClick={handleSubmit}
                    disabled={!isEligible || compressing}
                    loading={loading}
                  >
                    Submit Clearance Request
                  </Button>
                </Space>
              </>
            )}
          </Card>

          {activeRequest?.status === "approved" && (
            <Card
              title="Clearance Acceptance Fee"
              style={{ marginBottom: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
            >
              {activeRequest.acceptance_paid ? (
                <Alert
                  type="success"
                  showIcon
                  message="Payment completed"
                  description="You can now print your clearance acceptance letter."
                  style={{ marginBottom: "1rem" }}
                />
              ) : (
                <PaystackButton className="btn btn-green" {...paystackProps} />
              )}

              {activeRequest.acceptance_paid && (
                <>
                  <Divider />
                  <div
                    style={{
                      background: "#fafafa",
                      padding: "1.5rem",
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                    }}
                  >
                    <Title level={4} style={{ textAlign: "center" }}>
                      Clearance Acceptance Letter
                    </Title>
                    <Text>
                      This is to certify that{" "}
                      <strong>
                        {personalDetail?.surname} {personalDetail?.other_names}
                      </strong>{" "}
                      with matric number <strong>{activeRequest.matric_number}</strong> has satisfied all clearance
                      requirements and has paid the clearance acceptance fee.
                    </Text>
                    <Divider />
                    <Text>
                      Date: <strong>{new Date().toLocaleDateString()}</strong>
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    style={{ marginTop: "1rem", backgroundColor: "#028f64", borderColor: "#028f64" }}
                    onClick={() => window.print()}
                  >
                    Print Clearance Acceptance Letter
                  </Button>
                </>
              )}
            </Card>
          )}

          <Card
            title="Clearance Departments"
            style={{ borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {departments.map((department) => (
                <Tag key={department.id} color={department.is_active ? "green" : "default"} style={{ padding: "6px 12px", fontSize: "14px" }}>
                  {department.name} — {department.is_active ? "Active" : "Inactive"}
                </Tag>
              ))}
            </div>
          </Card>
        </div>
      </>
    </ConfigProvider>
  );
};

export default Student_Clearance;
