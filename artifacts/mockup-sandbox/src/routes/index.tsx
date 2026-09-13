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
    case "nurse":
      return <Navigate to="/nurse/lab-requests" replace />;
    case "mental_health_counselor":
      return <Navigate to="/counselor/sessions" replace />;
    case "hiv_professional":
      return <Navigate to="/hiv/sessions" replace />;
    case "admin":
      return <Navigate to="/admin/analytics" replace />;
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
      { path: "queue", element: <StudentQueue /> },
      { path: "mental-buddy", element: <StudentMentalBuddy /> },
      { path: "hiv-aids", element: <StudentHivAids /> },
      { path: "notifications", element: <StudentNotifications /> },
    ],
  },
  // Placeholder routes for other roles (to be implemented)
  {
    path: "/doctor/*",
    element: (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div style={{ padding: "2rem", color: "white" }}>Doctor Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/pharmacist/*",
    element: (
      <ProtectedRoute allowedRoles={["pharmacist"]}>
        <div style={{ padding: "2rem", color: "white" }}>Pharmacist Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/lab/*",
    element: (
      <ProtectedRoute allowedRoles={["lab_technician"]}>
        <div style={{ padding: "2rem", color: "white" }}>Lab Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/nurse/*",
    element: (
      <ProtectedRoute allowedRoles={["nurse"]}>
        <div style={{ padding: "2rem", color: "white" }}>Nurse Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/counselor/*",
    element: (
      <ProtectedRoute allowedRoles={["mental_health_counselor"]}>
        <div style={{ padding: "2rem", color: "white" }}>Counselor Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/hiv/*",
    element: (
      <ProtectedRoute allowedRoles={["hiv_professional"]}>
        <div style={{ padding: "2rem", color: "white" }}>HIV Support Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div style={{ padding: "2rem", color: "white" }}>Admin Dashboard - Coming Soon</div>
      </ProtectedRoute>
    ),
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