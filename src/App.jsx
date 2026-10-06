import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Doctor from './pages/doctor/Doctor'
import Receptionist from './pages/receptionist/Receptionist'
import DoctorAppointments from './pages/doctor/appointment/Appointments'
import ReceptionistAppointments from './pages/receptionist/appointment/Appointments'
import Signup from './pages/auth/Signup'
import ForgotPasswordForm from './pages/auth/ForgotPasswordForm'
import VerifyEmail from './pages/auth/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'
import RoleDashboard from './pages/dashboard/RoleDashboard'
import { ROLE_ORDER, getRoleMeta } from './config/roles'
import AdminStaffManagement from './pages/admin/AdminStaffManagement'
import AdminReports from './pages/admin/AdminReports'
import Nurse from './pages/nurse/Nurse'
import CounselorQueue from './pages/counselor/CounselorQueue'
import StudentQueue from './pages/student/StudentQueue'
import StudentProfile from './pages/student/StudentProfile'
import StudentLabRequests from './pages/student/StudentLabRequests'
import StudentNotifications from './pages/student/StudentNotifications'

// Doctor Prescription Pages
import DoctorPrescriptions from './pages/doctor/prescriptions/Prescriptions'
import CreatePrescription from './pages/doctor/prescriptions/CreatePrescription'
import ViewPrescription from './pages/doctor/prescriptions/ViewPrescription'
import Medicines from './pages/doctor/prescriptions/Medicines'

// Receptionist Prescription Pages
import ReceptionistPrescriptions from './pages/receptionist/prescriptions/Prescriptions'
import ReceptionistViewPrescription from './pages/receptionist/prescriptions/ViewPrescription'
import TokenManagement from './pages/receptionist/token/TokenManagement'
import TokenQueue from './pages/doctor/token/TokenQueue'
import TokenDisplay from './components/TokenDisplay'

// Receptionist Billing Pages
import BillingDashboard from './pages/receptionist/billing/BillingDashboard'
import CreateInvoice from './pages/receptionist/billing/CreateInvoice'
import InvoiceList from './pages/receptionist/billing/InvoiceList'
import PaymentProcessing from './pages/receptionist/billing/PaymentProcessing'
import PaymentHistory from './pages/receptionist/billing/PaymentHistory'
import InvoicePdfGenerator from './pages/receptionist/billing/InvoicePdfGenerator'
import Reports from './pages/receptionist/billing/Reports'
import FirebaseWarning from './components/FirebaseWarning'
import { isFirebaseConfigured } from './firebase/config'
import Student from './pages/student/Student'
import StudentConsultations from './pages/student/consultations/StudentConsultations'
import DoctorConsultationQueue from './pages/doctor/consultations/ConsultationQueue'
import ConsultationDetail from './pages/doctor/consultations/ConsultationDetail'
import LabTechnician from './pages/lab/LabTechnician'
import DoctorLabResults from './pages/doctor/DoctorLabResults'
import Pharmacist from './pages/pharmacist/Pharmacist'
import CounsellingSessionView from './pages/counselor/CounsellingSessionView'

// Exclude roles that have custom route implementations to prevent route conflicts
// genericRoles will only map routes for roles that use the generic RoleDashboard
const genericRoles = ROLE_ORDER.filter(role => !['doctor', 'receptionist', 'nurse', 'mentalHealthCounselor', 'hivProfessional', 'labTechnician', 'student', 'pharmacist', 'admin'].includes(role))

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseWarning />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="/queue" element={<TokenDisplay />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RoleDashboard />
          </ProtectedRoute>
        } />

        {genericRoles.map(role => (
          <Route
            key={role}
            path={getRoleMeta(role).route}
            element={
              <ProtectedRoute requiredRole={role}>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="/mental-health-counselor" element={
          <ProtectedRoute requiredRole="mentalHealthCounselor">
            <CounselorQueue role="mentalHealthCounselor" />
          </ProtectedRoute>
        } />

        <Route path="/mental-health-counselor/requests" element={
          <ProtectedRoute requiredRole="mentalHealthCounselor">
            <CounselorQueue role="mentalHealthCounselor" />
          </ProtectedRoute>
        } />

        <Route path="/mental-health-counselor/patients" element={
          <ProtectedRoute requiredRole="mentalHealthCounselor">
            <CounselorQueue role="mentalHealthCounselor" view="patients" />
          </ProtectedRoute>
        } />

        <Route path="/mental-health-counselor/session/:id" element={
          <ProtectedRoute requiredRole="mentalHealthCounselor">
            <CounsellingSessionView role="mentalHealthCounselor" />
          </ProtectedRoute>
        } />

        <Route path="/hiv-professional" element={
          <ProtectedRoute requiredRole="hivProfessional">
            <CounselorQueue role="hivProfessional" />
          </ProtectedRoute>
        } />

        <Route path="/hiv-professional/requests" element={
          <ProtectedRoute requiredRole="hivProfessional">
            <CounselorQueue role="hivProfessional" />
          </ProtectedRoute>
        } />

        <Route path="/hiv-professional/patients" element={
          <ProtectedRoute requiredRole="hivProfessional">
            <CounselorQueue role="hivProfessional" view="patients" />
          </ProtectedRoute>
        } />

        <Route path="/hiv-professional/session/:id" element={
          <ProtectedRoute requiredRole="hivProfessional">
            <CounsellingSessionView role="hivProfessional" />
          </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute requiredRole="doctor">
            <Doctor />
          </ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorAppointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor/consultations" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorConsultationQueue />
          </ProtectedRoute>
        } />
        <Route path="/doctor/consultations/:id" element={
          <ProtectedRoute requiredRole="doctor">
            <ConsultationDetail />
          </ProtectedRoute>
        } />
        <Route path="/doctor/tokens" element={
          <ProtectedRoute requiredRole="doctor">
            <TokenQueue />
          </ProtectedRoute>
        } />

        {/* Doctor Prescription Routes */}
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorPrescriptions />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/create" element={
          <ProtectedRoute requiredRole="doctor">
            <CreatePrescription />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/create/:id" element={
          <ProtectedRoute requiredRole="doctor">
            <CreatePrescription />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/view/:id" element={
          <ProtectedRoute requiredRole="doctor">
            <ViewPrescription />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/edit/:id" element={
          <ProtectedRoute requiredRole="doctor">
            <CreatePrescription />
          </ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions/medicines" element={
          <ProtectedRoute requiredRole="doctor">
            <Medicines />
          </ProtectedRoute>
        } />

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={
          <ProtectedRoute requiredRole="receptionist">
            <Receptionist />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/appointments" element={
          <ProtectedRoute requiredRole="receptionist">
            <ReceptionistAppointments />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/tokens" element={
          <ProtectedRoute requiredRole="receptionist">
            <TokenManagement />
          </ProtectedRoute>
        } />

        {/* Receptionist Prescription Routes */}
        <Route path="/receptionist/prescriptions" element={
          <ProtectedRoute requiredRole="receptionist">
            <ReceptionistPrescriptions />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/prescriptions/view/:id" element={
          <ProtectedRoute requiredRole="receptionist">
            <ReceptionistViewPrescription />
          </ProtectedRoute>
        } />

        {/* Receptionist Billing Routes */}
        <Route path="/receptionist/billing" element={
          <ProtectedRoute requiredRole="receptionist">
            <BillingDashboard />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/create" element={
          <ProtectedRoute requiredRole="receptionist">
            <CreateInvoice />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/invoices" element={
          <ProtectedRoute requiredRole="receptionist">
            <InvoiceList />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/payments" element={
          <ProtectedRoute requiredRole="receptionist">
            <PaymentProcessing />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/history" element={
          <ProtectedRoute requiredRole="receptionist">
            <PaymentHistory />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/invoices/:id" element={
          <ProtectedRoute requiredRole="receptionist">
            <InvoicePdfGenerator />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/invoices/:id/download" element={
          <ProtectedRoute requiredRole="receptionist">
            <InvoicePdfGenerator />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/invoices/:id/edit" element={
          <ProtectedRoute requiredRole="receptionist">
            <CreateInvoice />
          </ProtectedRoute>
        } />
        <Route path="/receptionist/billing/reports" element={
          <ProtectedRoute requiredRole="receptionist">
            <Reports />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <Student />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        } />
        <Route path="/student/lab-requests" element={
          <ProtectedRoute requiredRole="student">
            <StudentLabRequests />
          </ProtectedRoute>
        } />
        <Route path="/student/notifications" element={
          <ProtectedRoute requiredRole="student">
            <StudentNotifications />
          </ProtectedRoute>
        } />
        <Route path="/student/consultations/:type?" element={
          <ProtectedRoute requiredRole="student">
            <StudentConsultations />
          </ProtectedRoute>
        } />
        <Route path="/student/mental-buddy" element={
          <ProtectedRoute requiredRole="student">
            <StudentConsultations type="mental_buddy" />
          </ProtectedRoute>
        } />
        <Route path="/student/hiv-counselling" element={
          <ProtectedRoute requiredRole="student">
            <StudentConsultations type="hiv_counselling" />
          </ProtectedRoute>
        } />
        <Route path="/student/queue" element={
          <ProtectedRoute requiredRole="student">
            <StudentQueue />
          </ProtectedRoute>
        } />
        <Route path="/student/session/:id" element={
          <ProtectedRoute requiredRole="student">
            <CounsellingSessionView />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        {/* Nurse Routes */}
        <Route path="/nurse" element={
          <ProtectedRoute requiredRole="nurse">
            <Nurse />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <RoleDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute requiredRole="admin">
            <AdminStaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <AdminReports />
          </ProtectedRoute>
        } />

        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/lab-technician" element={
          <ProtectedRoute requiredRole="labTechnician">
            <LabTechnician />
          </ProtectedRoute>
        } />
        <Route path="/doctor/lab-results" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorLabResults />
          </ProtectedRoute>
        } />

        <Route path="/pharmacist" element={
          <ProtectedRoute requiredRole="pharmacist">
            <Pharmacist />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
