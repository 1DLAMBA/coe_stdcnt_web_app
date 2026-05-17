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
    CLEARANCES: `${API_BASE_URL}/clearances`,
    CLEARANCE_DEPARTMENTS: `${API_BASE_URL}/clearance-departments`,
    ADMIN_MINIMAL_STUDENTS: `${API_BASE_URL}/admin/minimal-students`,
    ADMIN_MINIMAL_STUDENTS_CHECK: `${API_BASE_URL}/admin/minimal-students/check-matric`,
    IMPORT_SAMPLE_CSV: `${API_BASE_URL}/import/sample-csv`,
    IMPORT_STUDENTS: `${API_BASE_URL}/import`,
};

export default API_ENDPOINTS;
