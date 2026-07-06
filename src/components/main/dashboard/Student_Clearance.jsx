import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Divider, Tag, Typography, Alert, message, Spin, ConfigProvider, Breadcrumb, Space } from "antd";
import { DownloadOutlined, FileTextOutlined, HomeFilled, PrinterOutlined } from "@ant-design/icons";
import { PaystackButton } from "react-paystack";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import API_ENDPOINTS from "../../../Endpoints/environment";
import { compressPdf } from "../../../utils/compressPdf";
import {
  canRequestClearance as isClearanceEligible,
  getClearanceBlockReason,
  isNewIntakeByMatric,
} from "../../../utils/schoolFeesFlags";
import ClearanceAcknowledgementSlip from "./ClearanceAcknowledgementSlip";
import "./BioData.css";

const { Title, Text } = Typography;

const MAX_PDF_SIZE_KB = 5120;

const CLEARANCE_AMOUNT = 8731;

const Student_Clearance = () => {
  const { id } = useParams();
  const [personalDetail, setPersonalDetail] = useState(null);
  const [backupPersonal, setBackupPersonal] = useState(null);
  const [clearanceRequests, setClearanceRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [feesReceipt, setFeesReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [bio, setBio] = useState(null);
  const [downloading, setDownloading] = useState(false);
  // null = not yet checked; { on_list, entry } once the graduation-list check returns
  const [graduationCheck, setGraduationCheck] = useState(null);
  const slipRef = useRef(null);

  const activeRequest = useMemo(() => clearanceRequests?.[0], [clearanceRequests]);

  const isNewByMatric = useMemo(
    () => isNewIntakeByMatric(personalDetail?.matric_number),
    [personalDetail?.matric_number]
  );

  const clearanceEligible = useMemo(
    () => isClearanceEligible(personalDetail, backupPersonal, isNewByMatric),
    [personalDetail, backupPersonal, isNewByMatric]
  );

  const clearanceBlockReason = useMemo(
    () => getClearanceBlockReason(personalDetail, backupPersonal, isNewByMatric),
    [personalDetail, backupPersonal, isNewByMatric]
  );

  const hasOpenRequest = activeRequest && activeRequest.status !== "rejected";
  const isRejected = activeRequest?.status === "rejected";

  const fetchPersonalDetail = useCallback(async () => {
    setLoading(true);
    const backupUrl = API_ENDPOINTS.PERSONAL_DETAILS_BACKUP;
    const primaryUrl = `${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`;

    const primaryPromise = axios.get(primaryUrl);
    const backupPromise = backupUrl
      ? axios.get(`${backupUrl}/${id}`).catch((err) => {
          console.warn("Backup personal-details unavailable:", err?.message || err);
          return null;
        })
      : Promise.resolve(null);

    try {
      const [primaryRes, backupRes] = await Promise.all([primaryPromise, backupPromise]);
      setPersonalDetail(primaryRes.data);
      setBackupPersonal(backupRes && backupRes.data != null ? backupRes.data : null);
    } catch (error) {
      console.error("Error loading clearance data:", error);
      message.error("Unable to load clearance details.");
      setPersonalDetail(null);
      setBackupPersonal(null);
    }

    setLoading(false);
  }, [id]);

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

  const fetchBio = useCallback(async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.BIO_REGISTRATION}/${id}`);
      setBio(response.data || null);
    } catch (error) {
      console.warn("Bio registration unavailable:", error?.message || error);
      setBio(null);
    }
  }, [id]);

  useEffect(() => {
    fetchPersonalDetail();
    fetchClearanceData();
    fetchBio();
  }, [id, fetchPersonalDetail, fetchBio]);

  useEffect(() => {
    const matric = personalDetail?.matric_number;
    if (!matric) return;
    let cancelled = false;
    axios
      .get(`${API_ENDPOINTS.GRADUATION_LIST_CHECK}/${encodeURIComponent(matric)}`)
      .then((response) => {
        if (!cancelled) setGraduationCheck(response.data);
      })
      .catch((error) => {
        console.warn("Graduation list check unavailable:", error?.message || error);
        // Leave as null so the client does not block; the backend still enforces it.
        if (!cancelled) setGraduationCheck(null);
      });
    return () => {
      cancelled = true;
    };
  }, [personalDetail?.matric_number]);

  const notOnGraduationList = graduationCheck != null && !graduationCheck.on_list;

  const handleDownloadSlip = useCallback(async () => {
    if (!slipRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 1.25,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.78);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const ratio = canvas.width / canvas.height;
      let imgWidth = maxWidth;
      let imgHeight = imgWidth / ratio;
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * ratio;
      }
      const offsetX = (pageWidth - imgWidth) / 2;
      pdf.addImage(imgData, "JPEG", offsetX, margin, imgWidth, imgHeight, undefined, "FAST");
      const matric = (activeRequest?.matric_number || "slip").replace(/[^A-Za-z0-9_-]+/g, "_");
      pdf.save(`clearance-ack-${matric}.pdf`);
    } catch (error) {
      console.error("Failed to generate slip PDF:", error);
      message.error("Could not generate the slip. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [activeRequest?.matric_number]);

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
    if (notOnGraduationList) {
      message.error("You are not on the graduation list for this session. Contact the admin office.");
      return;
    }
    if (!clearanceEligible) {
      message.error(clearanceBlockReason || "You must complete school fees before requesting clearance.");
      return;
    }

    try {
      setLoading(true);
      let fileToUpload = feesReceipt;

      if (feesReceipt && feesReceipt.size / 1024 > MAX_PDF_SIZE_KB) {
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
      if (fileToUpload) {
        formData.append("fees_receipt", fileToUpload);
      }

      await axios.post(API_ENDPOINTS.CLEARANCES, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Clearance request submitted.");
      setFeesReceipt(null);
      fetchPersonalDetail();
      fetchClearanceData();
    } catch (error) {
      console.error("Error submitting clearance:", error);
      const errors = error.response?.data?.errors;
      const firstFieldError =
        errors?.graduation?.[0] || errors?.payment?.[0] || errors?.clearance?.[0];
      message.error(
        firstFieldError || error.response?.data?.message || "Failed to submit clearance request."
      );
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
    split: {
      type: "flat",
      subaccounts: [
        { subaccount: "ACCT_1hli5sgrrcfuas9", share: 57700 },
        { subaccount: "ACCT_aan2ehxiej239du", share: 687700 },
      ],
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

  const feeAlertDescription = clearanceEligible
    ? "Your school fee status is satisfied for clearance. Upload your receipt and submit below."
    : clearanceBlockReason ||
      "Complete outstanding school fees on Course Registration before requesting clearance.";

  const showFeeWarning = personalDetail && !clearanceEligible;

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

          {notOnGraduationList && (
            <Alert
              type="warning"
              showIcon
              message="Not on the graduation list"
              description="Your matric number is not on the graduation list for this session. Contact the admin office if you believe this is an error."
              style={{ marginBottom: "1.5rem" }}
            />
          )}
          {showFeeWarning && (
            <Alert
              type="warning"
              showIcon
              message="School fees incomplete"
              description={feeAlertDescription}
              style={{ marginBottom: "1.5rem" }}
            />
          )}
          {personalDetail && clearanceEligible && !hasOpenRequest && (
            <Alert
              type="info"
              showIcon
              message="School fees — ready to submit"
              description={feeAlertDescription}
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
                    <Text strong>School Fees Receipt (PDF) <Text type="secondary">(optional)</Text></Text>
                    <Text type="secondary" style={{ display: "block", fontSize: "12px", marginTop: "4px" }}>
                      Optional. Max 5MB. Larger files will be compressed automatically.
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
                    disabled={!clearanceEligible || notOnGraduationList || compressing}
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
                  description="You can now download or print your clearance acknowledgement slip."
                  style={{ marginBottom: "1rem" }}
                />
              ) : (
                <PaystackButton className="btn btn-green" {...paystackProps} />
              )}

              {activeRequest.acceptance_paid && (
                <>
                  <Divider />
                  <ClearanceAcknowledgementSlip
                    ref={slipRef}
                    personalDetail={personalDetail}
                    activeRequest={activeRequest}
                    bio={bio}
                  />
                  <div className="gc-slip-actions">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      style={{ backgroundColor: "#028f64", borderColor: "#028f64" }}
                      onClick={handleDownloadSlip}
                      loading={downloading}
                    >
                      Download Slip (PDF)
                    </Button>
                    <Button
                      size="large"
                      icon={<PrinterOutlined />}
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                  </div>
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
