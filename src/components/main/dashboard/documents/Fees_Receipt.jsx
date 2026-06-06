import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Spin, Typography, Row, Divider, Col, ConfigProvider, Breadcrumb, Select, message } from "antd";
import { DownloadOutlined, HomeFilled } from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import API_ENDPOINTS from "../../../../Endpoints/environment";
import axios from "axios";
import "./docstyle.css";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import logo from "../../../../assets/logo2.png";
import {
  LAST_FEE_SESSION,
  CURRENT_FEE_SESSION,
  FEE_ACADEMIC_SESSIONS,
  getSchoolFeeDisplayAmount,
  getAvailableReceiptSessions,
  resolveReceiptPaymentRecord,
} from "../../../../utils/schoolFeesFlags";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const formatPaymentDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const Fees_Receipt = () => {
  const letterRef = useRef(null);
  const [primary, setPrimary] = useState(null);
  const [backup, setBackup] = useState(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [spinning, setSpinning] = useState(false);
  const navigate = useNavigate();

  const isNewByMatric = useMemo(
    () =>
      typeof primary?.matric_number === "string" &&
      primary.matric_number.includes("/26/"),
    [primary?.matric_number]
  );

  const availableSessions = useMemo(
    () => getAvailableReceiptSessions(primary, backup, isNewByMatric),
    [primary, backup, isNewByMatric]
  );

  const activePaymentRecord = useMemo(
    () =>
      selectedSession
        ? resolveReceiptPaymentRecord(selectedSession, primary, backup, isNewByMatric)
        : null,
    [selectedSession, primary, backup, isNewByMatric]
  );

  const amountDisplay = useMemo(
    () =>
      getSchoolFeeDisplayAmount(
        activePaymentRecord?.has_paid,
        activePaymentRecord?.course_paid
      ),
    [activePaymentRecord]
  );

  useEffect(() => {
    if (availableSessions.length === 0) return;
    const fromQuery = searchParams.get("session");
    if (fromQuery && availableSessions.includes(fromQuery)) {
      setSelectedSession(fromQuery);
      return;
    }
    if (!selectedSession || !availableSessions.includes(selectedSession)) {
      setSelectedSession(availableSessions[0]);
    }
  }, [availableSessions, searchParams, selectedSession]);

  const items = [
    { path: `/Dashboard/${id}`, title: <HomeFilled /> },
    { path: "/fees-receipt", title: "School Fees Receipt" },
  ];

  useEffect(() => {
    setSpinning(true);
    const fetchUser = async () => {
      try {
        const primaryRes = await axios.get(`${API_ENDPOINTS.PERSONAL_DETAILS}/${id}`);
        const primaryData = primaryRes.data;
        setPrimary(primaryData);

        if (!primaryData?.matric_number) {
          setSpinning(false);
          navigate("/");
          return;
        }

        const skipBackup =
          typeof primaryData.matric_number === "string" &&
          primaryData.matric_number.includes("/26/");
        const backupUrl = API_ENDPOINTS.PERSONAL_DETAILS_BACKUP;
        if (backupUrl && !skipBackup) {
          try {
            const backupRes = await axios.get(`${backupUrl}/${id}`);
            setBackup(backupRes?.data || null);
          } catch {
            setBackup(null);
          }
        } else {
          setBackup(null);
        }
        setSpinning(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSpinning(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleDownloadPdf = useCallback(async () => {
    if (!letterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(letterRef.current, {
        scale: 1.25,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.78);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
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
      const matric = (primary?.matric_number || "receipt").replace(/[^A-Za-z0-9_-]+/g, "_");
      const sessionSlug = (selectedSession || "fees").replace(/\//g, "-");
      pdf.save(`school-fees-receipt-${sessionSlug}-${matric}.pdf`);
    } catch (error) {
      console.error("Failed to generate school fees receipt PDF:", error);
      message.error("Could not generate the receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [primary?.matric_number, selectedSession]);

  function itemRender(currentRoute, params, items, paths) {
    const isLast = currentRoute?.path === items[items.length - 1]?.path;
    return isLast ? (
      <span>{currentRoute.title}</span>
    ) : (
      <Link to={`/${paths.join("/")}`}>{currentRoute.title}</Link>
    );
  }

  const showSessionSelect = availableSessions.length > 1;

  return (
    <>
      <Breadcrumb
        style={{
          margin: " 1% auto",
          backgroundColor: "white",
          width: "82.5%",
          color: "white",
          borderRadius: "15px",
          padding: "0.5%",
        }}
        itemRender={itemRender}
        items={items}
      />
      <div
        className=""
        style={{
          padding: 20,
          textAlign: "center",
          backgroundColor: "white",
          backgroundSize: "contain",
        }}
      >
        <Spin spinning={spinning} fullscreen />

        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#028f64",
              borderRadius: 2,
              margin: "20px",
              colorBgContainer: "#f6ffed",
            },
          }}
        >
          <div
            style={{
              maxWidth: 820,
              margin: "0 auto 16px",
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {showSessionSelect && (
              <div style={{ minWidth: 220, textAlign: "left" }}>
                <Text strong style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  Academic session
                </Text>
                <Select
                  value={selectedSession || undefined}
                  onChange={setSelectedSession}
                  style={{ width: "100%" }}
                  placeholder="Select session"
                >
                  {FEE_ACADEMIC_SESSIONS.map((s) => (
                    <Option
                      key={s}
                      value={s}
                      disabled={!availableSessions.includes(s)}
                    >
                      {s}
                      {!availableSessions.includes(s) ? " (no payment)" : ""}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              ghost
              onClick={handleDownloadPdf}
              loading={downloading}
              disabled={!activePaymentRecord || spinning}
            >
              Download receipt
            </Button>
          </div>
        </ConfigProvider>

        {primary && (
          <Card
            ref={letterRef}
            className="admission-letter"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "40px",
              textAlign: "left",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              border: "1px solid #ddd",
              margin: "20px auto",
              fontFamily: "Arial, sans-serif",
            }}
            align="middle"
            justify="space-around"
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Row align="middle" justify="space-around">
                <Col span={16}>
                  <Title type="success" level={3} className="text-green-600 m-auto">
                    NIGER STATE COLLEGE OF EDUCATION
                  </Title>
                </Col>
              </Row>
              <Row className="mt-2" gutter={[0, 4]} justify="space-between">
                <Col style={{ textAlign: "left" }} span={10}>
                  <Text strong>Provost:</Text> Professor Yakubu M. Auna
                  <br />
                  <Text>B. Sc, MSc</Text>
                  <br />
                  <Text strong>Registrar:</Text> Haj. Zainab Sidi Aliyu
                </Col>
                <Col span={4}>
                  <img
                    src={logo}
                    alt="College logo"
                    crossOrigin="anonymous"
                    style={{ width: "100px" }}
                  />
                </Col>
                <Col style={{ textAlign: "right" }} span={9} className="text-right">
                  <Text>Private mail bag 39,</Text>
                  <br />
                  <Text>Telephone: 080-232060 222205</Text>
                  <br />
                  <Text>E-mail: coedu@yahoo.com</Text>
                  <br />
                  <Text>Minna, Niger State</Text>
                </Col>
              </Row>
              <Row className="mt-4 mb-2">
                <Col span={24} className="text-right">
                  <Text>Date: {formatPaymentDate(primary.created_at)}</Text>
                </Col>
              </Row>
              <Divider />
            </div>
            <Title
              level={3}
              style={{ textAlign: "center", color: "#333", fontFamily: "courier" }}
            >
              SCHOOL FEE RECEIPT
            </Title>
            <Divider />
            <Paragraph>
              <Text strong>Student Name:</Text> {primary.surname} {primary.other_names}
              <br />
              <Text strong>Matric Number:</Text> {primary.matric_number}
              <br />
              <Text strong>Department:</Text> {primary.course}
              <br />
              <Text strong>Academic Session:</Text> {selectedSession || "—"}
            </Paragraph>
            <Divider />
            <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>
                    Description
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>
                    Amount (₦)
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    Date
                  </th>
                  <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>School Fee</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>
                    {amountDisplay.paid ? (
                      amountDisplay.label
                    ) : (
                      <span style={{ color: "red" }}>NOT PAID</span>
                    )}
                  </td>
                  <td
                    style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
                  >
                    {formatPaymentDate(activePaymentRecord?.course_fee_reference)}
                  </td>
                  <td
                    style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}
                  >
                    {activePaymentRecord?.couse_fee_date ||
                      activePaymentRecord?.course_fee_date ||
                      "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
            <Divider />
            <Paragraph>
              <Text strong>Total Amount Paid:</Text> ₦
              {amountDisplay.paid ? (
                amountDisplay.label
              ) : (
                <span style={{ color: "red" }}>NOT PAID</span>
              )}
              <br />
              <Text strong>Payment Method:</Text> Online Payment
            </Paragraph>
            <Divider />
            <Paragraph>
              This receipt serves as confirmation of your School fee payment. Please keep it for
              your records.
            </Paragraph>
            <Divider />
            <Paragraph style={{ textAlign: "center" }}>
              <Text strong>OFFICIAL RECEIPT</Text>
              <br />
              <Text>Niger State College of Education</Text>
            </Paragraph>
            <Paragraph style={{ textAlign: "right" }}>
              <Text strong>Bursary Department</Text>
              <br />
              <Text>Date: {new Date().toLocaleDateString()}</Text>
            </Paragraph>
          </Card>
        )}
      </div>
    </>
  );
};

export default Fees_Receipt;
