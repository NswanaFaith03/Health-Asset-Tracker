import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  User, 
  Stethoscope, 
  FileText, 
  FlaskConical, 
  ClipboardList, 
  Heart, 
  Pill, 
  Bell, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  Activity,
  Thermometer,
  Shield,
  BarChart3,
  Settings,
  UserPlus
} from 'lucide-react';

export function Sidebar({ isOpen, onClose, role }: { isOpen: boolean; onClose: () => void; role?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    const saved = localStorage.getItem('profilePhoto');
    return saved ? saved : null;
  });

  // Listen for profile photo changes
  const handleStorageChange = () => {
    const saved = localStorage.getItem('profilePhoto');
    setProfilePhoto(saved ? saved : null);
  };

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getNavItems = () => {
    const currentRole = role || user?.role || 'student';
    
    switch (currentRole) {
      case 'doctor':
        return [
          { id: 'doctor-queue', label: 'Queue', path: '/doctor/queue', icon: Users },
          { id: 'doctor-consultations', label: 'Consultations', path: '/doctor/consultations', icon: Activity },
          { id: 'doctor-prescriptions', label: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
          { id: 'doctor-lab-requests', label: 'Lab Requests', path: '/doctor/lab-requests', icon: Thermometer },
        ];
      case 'pharmacist':
        return [
          { id: 'pharmacist-prescriptions', label: 'Prescriptions', path: '/pharmacist/prescriptions', icon: Pill },
          { id: 'pharmacist-history', label: 'History', path: '/pharmacist/history', icon: FileText },
        ];
      case 'lab_technician':
        return [
          { id: 'lab-requests', label: 'Requests', path: '/lab/requests', icon: ClipboardList },
          { id: 'lab-results', label: 'Results', path: '/lab/results', icon: FileText },
        ];
      case 'mental_health_counselor':
        return [
          { id: 'counselor-sessions', label: 'Sessions', path: '/counselor/sessions', icon: Heart },
        ];
      case 'hiv_professional':
        return [
          { id: 'hiv-sessions', label: 'Sessions', path: '/hiv/sessions', icon: Shield },
          { id: 'hiv-resources', label: 'Resources', path: '/hiv/resources', icon: FileText },
        ];
      case 'admin':
        return [
          { id: 'admin-analytics', label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
          { id: 'admin-users', label: 'Users', path: '/admin/users', icon: Users },
          { id: 'admin-audit', label: 'Audit', path: '/admin/audit', icon: Settings },
        ];
      case 'nurse':
        return [
          { id: 'nurse-queue', label: 'Queue Management', path: '/nurse/queue', icon: UserPlus },
          { id: 'nurse-reports', label: 'Medical Reports', path: '/nurse/reports', icon: FileText },
        ];
      default: // student
        return [
          { id: 'student-home', label: 'Home', path: '/student/home', icon: Home },
          { id: 'student-profile', label: 'Profile', path: '/student/profile', icon: User },
          { id: 'student-consultations', label: 'Consultations', path: '/student/consultations', icon: Stethoscope },
          { id: 'student-prescriptions', label: 'Prescriptions', path: '/student/prescriptions', icon: Pill },
          { id: 'student-lab', label: 'Lab Tests', path: '/student/lab', icon: FlaskConical },
          { id: 'student-lab-results', label: 'Lab Results', path: '/student/lab-results', icon: FileText },
          { id: 'student-queue', label: 'Queue', path: '/student/queue', icon: ClipboardList },
          { id: 'student-mental-buddy', label: 'Mental Health', path: '/student/mental-buddy', icon: Heart },
          { id: 'student-hiv-aids', label: 'HIV Support', path: '/student/hiv-aids', icon: Heart },
          { id: 'student-notifications', label: 'Notifications', path: '/student/notifications', icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  const currentPage = location.pathname;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: isOpen ? 0 : '-280px',
          top: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '85vw',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          zIndex: 50,
          transition: 'left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '4px 0 12px rgba(0, 0, 0, 0.1)' : 'none',
        }}
        className="sidebar-mobile"
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => {
            const currentRole = role || user?.role || 'student';
            const homePath = currentRole === 'student' ? '/student/home' : 
                            currentRole === 'doctor' ? '/doctor/queue' :
                            currentRole === 'pharmacist' ? '/pharmacist/prescriptions' :
                            currentRole === 'lab_technician' ? '/lab/requests' :
                            currentRole === 'mental_health_counselor' ? '/counselor/sessions' :
                            currentRole === 'hiv_professional' ? '/hiv/sessions' :
                            currentRole === 'admin' ? '/admin/analytics' :
                            currentRole === 'nurse' ? '/nurse/queue' : '/student/home';
            navigate(homePath);
          }}>
            <img 
              src="/images/uzamainlogo.jpg" 
              alt="UNZA Logo" 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 8,
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.3px' }}>
                DigiHealth
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'none';
            }}
          >
            <X style={{ width: 20, height: 20, color: '#64748b' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? '#16a34a' : '#64748b',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  marginBottom: '4px',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
                    (e.currentTarget as HTMLElement).style.color = '#334155';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#64748b';
                  }
                }}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight style={{ width: 16, height: 16, flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onClick={() => {
              const currentRole = role || user?.role || 'student';
              const profilePath = currentRole === 'student' ? '/student/profile' : 
                                currentRole === 'doctor' ? '/doctor/queue' :
                                currentRole === 'pharmacist' ? '/pharmacist/prescriptions' :
                                currentRole === 'lab_technician' ? '/lab/requests' :
                                currentRole === 'mental_health_counselor' ? '/counselor/sessions' :
                                currentRole === 'hiv_professional' ? '/hiv/sessions' :
                                currentRole === 'admin' ? '/admin/analytics' :
                                currentRole === 'nurse' ? '/nurse/queue' : '/student/home';
              navigate(profilePath);
              onClose();
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: profilePhoto ? 'transparent' : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 800,
              color: '#ffffff',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              flexShrink: 0,
            }}>
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', lineHeight: 1 }}>
                  <div style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 0 }}>UNZA</div>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>{user?.name?.charAt(0).toUpperCase() || 'S'}</div>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name?.split(' ')[0] || 'Student'}
              </div>
              <div style={{ fontSize: 12, color: '#16a34a' }}>Active</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '8px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#fee2e2';
              (e.currentTarget as HTMLElement).style.borderColor = '#fca5a5';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#fef2f2';
              (e.currentTarget as HTMLElement).style.borderColor = '#fee2e2';
            }}
          >
            <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export function SidebarToggle({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        color: '#64748b',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      className="sidebar-toggle-mobile"
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#10b981';
        (e.currentTarget as HTMLElement).style.color = '#10b981';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
        (e.currentTarget as HTMLElement).style.color = '#64748b';
      }}
    >
      {isOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
      <span>Menu</span>
    </button>
  );
}