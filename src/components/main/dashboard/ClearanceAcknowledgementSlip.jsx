import React, { forwardRef, useMemo } from "react";
import API_ENDPOINTS from "../../../Endpoints/environment";
import logo from "../../../assets/logo2.png";
import "./ClearanceAcknowledgementSlip.css";

const CLEARANCE_AMOUNT = 8500;
const DIRECTORATE = "Directorate of Examinations and Records";

const DEPARTMENT_ORDER = ["student affairs", "bursary", "library", "department", "registry"];

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatAmount = (value) =>
  `\u20A6${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusClass = (status) => {
  if (status === "approved") return "gc-slip-status--approved";
  if (status === "rejected") return "gc-slip-status--rejected";
  return "gc-slip-status--pending";
};

const statusLabel = (status) => {
  if (status === "approved") return "Cleared";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const isBursary = (name) => /bursary/i.test(name || "");

const buildBursaryItems = (level) => {
  const numeric = parseInt(String(level || "").replace(/\D/g, ""), 10);
  const top = Number.isFinite(numeric) && numeric >= 100 ? numeric : 300;
  const levels = [];
  for (let lvl = 100; lvl <= top; lvl += 100) {
    levels.push(`${lvl} LEVEL SCHOOL FEE RECEIPT`);
  }
  return levels;
};

const sortDepartments = (departments) => {
  const copy = [...(departments || [])];
  copy.sort((a, b) => {
    const ai = DEPARTMENT_ORDER.indexOf((a.department_name || "").toLowerCase());
    const bi = DEPARTMENT_ORDER.indexOf((b.department_name || "").toLowerCase());
    const av = ai === -1 ? DEPARTMENT_ORDER.length : ai;
    const bv = bi === -1 ? DEPARTMENT_ORDER.length : bi;
    if (av !== bv) return av - bv;
    return (a.department_name || "").localeCompare(b.department_name || "");
  });
  return copy;
};

const ClearanceAcknowledgementSlip = forwardRef(function ClearanceAcknowledgementSlip(
  { personalDetail, activeRequest, bio },
  ref
) {
  const fullName = `${personalDetail?.surname || ""} ${personalDetail?.other_names || ""}`.trim();
  const matric = activeRequest?.matric_number || personalDetail?.matric_number || "";
  const phone = personalDetail?.phone_number || "";
  const email = personalDetail?.email || "";
  const department = personalDetail?.course || "";
  const school = personalDetail?.school || "";
  const session = bio?.session || "";
  const address = personalDetail?.address || "";
  const passportUrl = personalDetail?.passport
    ? `${API_ENDPOINTS.IMAGE}/${personalDetail.passport}`
    : "";
  const reference = activeRequest?.acceptance_reference || "";
  const level = bio?.level;

  const watermarkStyle = useMemo(
    () => ({ "--gc-watermark": `url(${logo})` }),
    []
  );

  const orderedDepartments = useMemo(
    () => sortDepartments(activeRequest?.departments),
    [activeRequest?.departments]
  );

  return (
    <div ref={ref} className="gc-slip" style={watermarkStyle}>
      <div className="gc-slip-header">
        <img src={logo} alt="College Logo" className="gc-slip-logo" crossOrigin="anonymous" />
        <h1 className="gc-slip-school-name">The Niger State College of Education, Minna</h1>
        <div className="gc-slip-directorate">{DIRECTORATE}</div>
      </div>

      <div className="gc-slip-title-band">Graduand Clearance Acknowledgement Slip</div>

      <div className="gc-slip-student">
        {passportUrl ? (
          <img
            src={passportUrl}
            alt="Student Passport"
            className="gc-slip-photo"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="gc-slip-photo gc-slip-photo-placeholder">No Photo</div>
        )}

        <div className="gc-slip-fields">
          <div>
            <div className="gc-slip-field-label">Full Name</div>
            <div className="gc-slip-field-value">{fullName || "—"}</div>
          </div>
          <div>
            <div className="gc-slip-field-label">Matric Number</div>
            <div className="gc-slip-field-value">{matric || "—"}</div>
          </div>
          <div>
            <div className="gc-slip-field-label">Phone Number</div>
            <div className="gc-slip-field-value">{phone || "—"}</div>
          </div>
          <div>
            <div className="gc-slip-field-label">Email Address</div>
            <div className="gc-slip-field-value gc-slip-field-value--lower">{email || "—"}</div>
          </div>
          <div>
            <div className="gc-slip-field-label">Department</div>
            <div className="gc-slip-field-value">{department || "—"}</div>
          </div>
          <div>
            <div className="gc-slip-field-label">School</div>
            <div className="gc-slip-field-value">{school || "—"}</div>
          </div>
          <div>
            <div className="gc-slip-field-label">Session</div>
            <div className="gc-slip-field-value">{session || "—"}</div>
          </div>
        </div>
      </div>

      <div className="gc-slip-address">
        <div className="gc-slip-field-label">Residential Address</div>
        <div className="gc-slip-field-value">{address || "—"}</div>
      </div>

      <div className="gc-slip-amount">
        <div className="gc-slip-amount-label">Amount Paid</div>
        <div className="gc-slip-amount-value">{formatAmount(CLEARANCE_AMOUNT)}</div>
        {reference && <div className="gc-slip-amount-ref">Ref: {reference}</div>}
      </div>

      <table className="gc-slip-table">
        <thead>
          <tr>
            <th colSpan={4}>Cleared By</th>
          </tr>
        </thead>
        <tbody>
          {orderedDepartments.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                No clearance departments recorded.
              </td>
            </tr>
          ) : (
            orderedDepartments.map((dept) => {
              const items = isBursary(dept.department_name)
                ? buildBursaryItems(level)
                : ["Unit Clearance"];
              return (
                <tr key={dept.id}>
                  <td className="gc-col-dept">{dept.department_name}</td>
                  <td className="gc-col-items">
                    <ul className="gc-slip-items-list">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className={`gc-col-status gc-slip-status ${statusClass(dept.status)}`}>
                    {statusLabel(dept.status)}
                  </td>
                  <td className="gc-col-signature">
                    <div className="gc-slip-sig">
                      <div className="gc-slip-sig-line" />
                      <div className="gc-slip-sig-name">Signature</div>
                      <div className="gc-slip-sig-date">{formatDate(dept.reviewed_at) || "—"}</div>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

export default ClearanceAcknowledgementSlip;
