import './App.css';
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Main from './components/main/Main';
import Dashboard from './components/main/Dashboard';
import Bio_data from './components/main/dashboard/Bio_data';
import Course_reg from './components/main/dashboard/Course_reg';
import Edit_Bio from './components/main/dashboard/Edit_Bio';
import Panel from './components/main/dashboard/Panel';
import Admin_Panel from './components/main/dashboard/admin/Admin_Panel';
import View_applications from './components/main/dashboard/admin/admin-pages/View_Applications';
import Add_Applications from './components/main/dashboard/admin/admin-pages/Add_Application';
import Registration from './components/main/Registration';
import Reg_Success from './components/Reg_Success';
import Single_Application from './components/main/dashboard/admin/admin-pages/Single_Appliaction';
import { Admin_dashboard } from './components/main/dashboard/admin/admin-pages/Admin_dashboard';
import { View_approved } from './components/main/dashboard/admin/admin-pages/View_approved';
import Admission_Letter from './components/main/dashboard/documents/Admission_Letter';
import Acceptance_Receipt from './components/main/dashboard/documents/Acceptance_Receipt';
import Fees_Receipt from './components/main/dashboard/documents/Fees_Receipt';
import { Student_Stats } from './components/main/dashboard/admin/admin-pages/Student_Stats';
import View_student from './components/main/dashboard/admin/admin-pages/View_student';
import Exam_Card from './components/main/dashboard/documents/exam_card';
import Student_Clearance from './components/main/dashboard/Student_Clearance';
import Admin_Clearance from './components/main/dashboard/admin/Admin_Clearance';
import AdminAddStudents from './components/main/dashboard/admin/admin-pages/AdminAddStudents';
import GraduationList from './components/main/dashboard/admin/admin-pages/GraduationList';
import PaymentRecovery from './components/main/PaymentRecovery';
import StaffLogin from './components/main/dashboard/admin/StaffLogin';
import RequireStaff from './components/main/dashboard/admin/RequireStaff';
import StaffAccounts from './components/main/dashboard/admin/admin-pages/StaffAccounts';
import StaffHome from './components/main/dashboard/admin/admin-pages/StaffHome';
import Payments from './components/main/dashboard/admin/admin-pages/Payments';
import AuditLog from './components/main/dashboard/admin/admin-pages/AuditLog';
import { StaffAuthProvider } from './Authentication/StaffAuthContext';

function App() {
  return (
    <StaffAuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Main />} />
        <Route path="/admin/login" element={<StaffLogin />} />
        <Route path="/admin" element={<RequireStaff><Admin_Panel /></RequireStaff>} >
          <Route path="/admin" element={<StaffHome />} />
          <Route path="/admin/reports" element={<RequireStaff permission="stats.view"><Admin_dashboard /></RequireStaff>} />
          <Route path="/admin/view-applications" element={<RequireStaff permission="applications.view"><View_applications /></RequireStaff>} />
          <Route path="/admin/student-stats" element={<RequireStaff permission="students.view"><Student_Stats /></RequireStaff>} />
          <Route path="/admin/view-approved" element={<RequireStaff permission="applications.view"><View_approved /></RequireStaff>} />
          <Route path="/admin/view-approved/single/:id" element={<RequireStaff permission="applications.view"><View_approved /></RequireStaff>} />
          <Route path="/admin/add-applications" element={<RequireStaff permission="applications.manage"><Add_Applications /></RequireStaff>} />
          <Route path="/admin/single-application/:id" element={<RequireStaff permission="applications.view"><Single_Application /></RequireStaff>} />
          <Route path="/admin/view-student/:id" element={<RequireStaff permission="students.view"><View_student /></RequireStaff>} />
          <Route path="/admin/clearance" element={<RequireStaff permission="clearance.view"><Admin_Clearance /></RequireStaff>} />
          <Route path="/admin/add-students" element={<RequireStaff permission="students.manage"><AdminAddStudents /></RequireStaff>} />
          <Route path="/admin/graduation-list" element={<RequireStaff permission="graduation.view"><GraduationList /></RequireStaff>} />
          <Route path="/admin/staff" element={<RequireStaff permission="staff.manage"><StaffAccounts /></RequireStaff>} />
          <Route path="/admin/payments" element={<RequireStaff permission="payments.view"><Payments /></RequireStaff>} />
          <Route path="/admin/audit-log" element={<RequireStaff permission="audit.view"><AuditLog /></RequireStaff>} />
        </Route>
        <Route path="/registration" element={<Registration />} />
        <Route path="/registration/:id/success" element={<Reg_Success />} />
        <Route path="/payment-recovery" element={<PaymentRecovery />} />

        <Route path="/dashboard/:id" element={<Dashboard />}>
          <Route path="/dashboard/:id" element={<Panel />} />
          <Route path="/dashboard/:id/Bio-data" element={<Bio_data />} />
          <Route path="/dashboard/:id/Edit" element={<Edit_Bio />} />
          <Route path="/dashboard/:id/Course_reg" element={<Course_reg />} />
          <Route path="/dashboard/:id/admission-letter" element={<Admission_Letter />} />
          <Route path="/dashboard/:id/exam-card" element={<Exam_Card />} />
          <Route path="/dashboard/:id/acceptance-receipt" element={<Acceptance_Receipt />} />
          <Route path="/dashboard/:id/fees-receipt" element={<Fees_Receipt />} />
          <Route path="/dashboard/:id/clearance" element={<Student_Clearance />} />
        </Route>
        <Route path="student" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
    </StaffAuthProvider>
  );
}

export default App;
