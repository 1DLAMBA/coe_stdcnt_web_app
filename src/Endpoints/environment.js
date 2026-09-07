// Use env vars for production (e.g. Vercel); fallback for local dev
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Backup API: explicit env (e.g. environments/.env.development when using `npm start`).
// If unset, default local backup in development only so requests still fire when the dev
// server is started without env-cmd (IDE "Run" uses plain react-scripts and skips that file).
const BACKUP_FROM_ENV = (process.env.REACT_APP_BACKUP_API_BASE_URL || '').trim();
const BACKUP_API_BASE_URL = (
  BACKUP_FROM_ENV ||
  (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8001/api' : '')
)
  .trim()
  .replace(/\/$/, '');
const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '';
const ENABLE_SPLITS = process.env.REACT_APP_ENABLE_SPLITS === 'true';

const PERSONAL_DETAILS_BACKUP = BACKUP_API_BASE_URL
  ? `${BACKUP_API_BASE_URL}/personal-details`
  : '';

if (
  process.env.NODE_ENV === "production" &&
  !BACKUP_API_BASE_URL
) {
  console.warn(
    "[COE] REACT_APP_BACKUP_API_BASE_URL is not set. Clearance and exam card cannot verify 2024/2025 fees on the backup API."
  );
}

const API_ENDPOINTS = {
    API_BASE_URL: `${API_BASE_URL}`,
    BACKUP_API_BASE_URL: BACKUP_API_BASE_URL || '',
    PERSONAL_DETAILS_BACKUP,
    PAYSTACK_PUBLIC_KEY,
    ENABLE_SPLITS,
    IMAGE: `${API_BASE_URL}/file/get`,
    STUDENT_CHECK: `${API_BASE_URL}/student_check`,
    UPLOAD: `${API_BASE_URL}/upload`,
    LOGIN: `${API_BASE_URL}/login`,
    BIO_REGISTRATION: `${API_BASE_URL}/bio-registrations`,
    PERSONAL_DETAILS: `${API_BASE_URL}/personal-details`,
    SCHOOL_DETAILS: `${API_BASE_URL}/student-details`,
    EDUCATIONALS_APPLICATION: `${API_BASE_URL}/educational-details`,
    APPROVE: `${API_BASE_URL}/approve`,
    APPROVE_PRENCE: `${API_BASE_URL}/approve_prence`,
    VERIFY_REFERENCE: `${API_BASE_URL}/verify_reference`,
    VERIFY_PAYSTACK: `${API_BASE_URL}/verify-paystack`,
    PAYMENTS_INITIATE: `${API_BASE_URL}/payments/initiate`,
    ADMIN_PAYMENTS: `${API_BASE_URL}/admin/payments`,
    ADMIN_AUDIT_LOGS: `${API_BASE_URL}/admin/audit-logs`,
    ADMIN_AUDIT_LOG_ACTIONS: `${API_BASE_URL}/admin/audit-logs/actions`,
    CLEARANCES: `${API_BASE_URL}/clearances`,
    CLEARANCE_DEPARTMENTS: `${API_BASE_URL}/clearance-departments`,
    ADMIN_MINIMAL_STUDENTS: `${API_BASE_URL}/admin/minimal-students`,
    ADMIN_MINIMAL_STUDENTS_CHECK: `${API_BASE_URL}/admin/minimal-students/check-matric`,
    IMPORT_SAMPLE_CSV: `${API_BASE_URL}/import/sample-csv`,
    IMPORT_STUDENTS: `${API_BASE_URL}/import`,
    GRADUATION_LIST: `${API_BASE_URL}/graduation-list`,
    GRADUATION_LIST_SAMPLE_CSV: `${API_BASE_URL}/graduation-list/sample-csv`,
    GRADUATION_LIST_IMPORT: `${API_BASE_URL}/graduation-list/import`,
    GRADUATION_LIST_UNMATCHED: `${API_BASE_URL}/graduation-list/unmatched`,
    // append '/' + encodeURIComponent(matric) — matric numbers contain slashes
    GRADUATION_LIST_CHECK: `${API_BASE_URL}/graduation-list/check`,
    STAFF_LOGIN: `${API_BASE_URL}/staff/login`,
    STAFF_LOGOUT: `${API_BASE_URL}/staff/logout`,
    STAFF_ME: `${API_BASE_URL}/staff/me`,
    STAFF_STUDENTS: `${API_BASE_URL}/staff/students`,
    STAFF_STUDENTS_SUMMARY: `${API_BASE_URL}/staff/students/summary`,
    STAFF_CLEARANCES: `${API_BASE_URL}/staff/clearances`,
    STAFF_CLEARANCES_START: `${API_BASE_URL}/staff/clearances/start`,
    STAFF_USERS: `${API_BASE_URL}/staff/users`,
    STAFF_CENTRES: `${API_BASE_URL}/staff/centres`,
};

export default API_ENDPOINTS;
