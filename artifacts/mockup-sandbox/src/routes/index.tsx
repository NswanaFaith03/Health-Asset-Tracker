import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
import StudentLayout from '../components/StudentLayout';
import StudentDashboard from '../pages/student/Home';
import StudentProfile from '../pages/student/Profile';
import StudentConsultations from '../pages/student/Consultations';
import StudentPrescriptions from '../pages/student/Prescriptions';
import StudentLab from '../pages/student/Lab';
import StudentLabResults from '../pages/student/LabResults';
import StudentQueue from '../pages/student/Queue';
import StudentMentalBuddy from '../pages/student/MentalBuddy';
import StudentHivAids from '../pages/student/HivAids';
import StudentNotifications from '../pages/student/Notifications';
import NewConsultation from '../pages/student/NewConsultation';
import StudentMedicalReport from '../pages/student/MedicalReport';
import DoctorLayout from '../components/DoctorLayout';
import DoctorQueue from '../pages/doctor/Queue';
import DoctorConsultations from '../pages/doctor/Consultations';
import DoctorPrescriptions from '../pages/doctor/Prescriptions';
import DoctorLabRequests from '../pages/doctor/LabRequests';
import PharmacistLayout from '../components/PharmacistLayout';
import PharmacistPrescriptions from '../pages/pharmacist/Prescriptions';
import PharmacistHistory from '../pages/pharmacist/History';
import LabLayout from '../components/LabLayout';
import LabRequests from '../pages/lab/Requests';
import LabResults from '../pages/lab/Results';
import CounselorLayout from '../components/CounselorLayout';
import CounselorSessions from '../pages/counselor/Sessions';
import HivLayout from '../components/HivLayout';
import HivSessions from '../pages/hiv/Sessions';
import HivResources from '../pages/hiv/Resources';
import AdminLayout from '../components/AdminLayout';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminUsers from '../pages/admin/Users';
import AdminAudit from '../pages/admin/Audit';
import NurseLayout from '../components/NurseLayout';
import NurseQueue from '../pages/nurse/Queue';
import NurseReports from '../pages/nurse/Reports';

// Protected route component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(222, 47%, 5%)"
      }}>
        <div style={{ color: "white" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('User role:', user.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Role-based redirect component
function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(222, 47%, 5%)"
      }}>
        <div style={{ color: "white" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Route based on role
  switch (user?.role) {
    case "student":
      return <Navigate to="/student/home" replace />;
    case "doctor":
      return <Navigate to="/doctor/queue" replace />;
    case "pharmacist":
      return <Navigate to="/pharmacist/prescriptions" replace />;
    case "lab_technician":
      return <Navigate to="/lab/requests" replace />;
    case "mental_health_counselor":
      return <Navigate to="/counselor/sessions" replace />;
    case "hiv_professional":
      return <Navigate to="/hiv/sessions" replace />;
    case "admin":
      return <Navigate to="/admin/analytics" replace />;
    case "nurse":
      return <Navigate to="/nurse/queue" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleBasedRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Student routes
  {
    path: "/student",
    element: (
      <ProtectedRoute allowedRoles={["student"]}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/student/home" replace /> },
      { path: "home", element: <StudentDashboard /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "consultations", element: <StudentConsultations /> },
      { path: "consultations/new", element: <NewConsultation /> },
      { path: "prescriptions", element: <StudentPrescriptions /> },
      { path: "lab", element: <StudentLab /> },
      { path: "lab-results", element: <StudentLabResults /> },
      { path: "lab/medical-report", element: <StudentMedicalReport /> },
      { path: "queue", element: <StudentQueue /> },
      { path: "mental-buddy", element: <StudentMentalBuddy /> },
      { path: "hiv-aids", element: <StudentHivAids /> },
      { path: "notifications", element: <StudentNotifications /> },
    ],
  },
  // Doctor routes
  {
    path: "/doctor",
    element: (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <DoctorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/doctor/queue" replace /> },
      { path: "queue", element: <DoctorQueue /> },
      { path: "consultations", element: <DoctorConsultations /> },
      { path: "prescriptions", element: <DoctorPrescriptions /> },
      { path: "lab-requests", element: <DoctorLabRequests /> },
    ],
  },
  // Pharmacist routes
  {
    path: "/pharmacist",
    element: (
      <ProtectedRoute allowedRoles={["pharmacist"]}>
        <PharmacistLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/pharmacist/prescriptions" replace /> },
      { path: "prescriptions", element: <PharmacistPrescriptions /> },
      { path: "history", element: <PharmacistHistory /> },
    ],
  },
  // Lab technician routes
  {
    path: "/lab",
    element: (
      <ProtectedRoute allowedRoles={["lab_technician"]}>
        <LabLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/lab/requests" replace /> },
      { path: "requests", element: <LabRequests /> },
      { path: "results", element: <LabResults /> },
    ],
  },
  {
    path: "/nurse",
    element: (
      <ProtectedRoute allowedRoles={["nurse"]}>
        <NurseLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/nurse/queue" replace /> },
      { path: "queue", element: <NurseQueue /> },
      { path: "reports", element: <NurseReports /> },
    ],
  },
  // Mental health counselor routes
  {
    path: "/counselor",
    element: (
      <ProtectedRoute allowedRoles={["mental_health_counselor"]}>
        <CounselorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/counselor/sessions" replace /> },
      { path: "sessions", element: <CounselorSessions /> },
    ],
  },
  // HIV professional routes
  {
    path: "/hiv",
    element: (
      <ProtectedRoute allowedRoles={["hiv_professional"]}>
        <HivLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/hiv/sessions" replace /> },
      { path: "sessions", element: <HivSessions /> },
      { path: "resources", element: <HivResources /> },
    ],
  },
  // Admin routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/analytics" replace /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "users", element: <AdminUsers /> },
      { path: "audit", element: <AdminAudit /> },
    ],
  },
  {
    path: "/unauthorized",
    element: (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(222, 47%, 5%)",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Unauthorized Access</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);