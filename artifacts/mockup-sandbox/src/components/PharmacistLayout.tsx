import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Package, Clock, Menu, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PharmacistLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Pending', icon: Package, path: '/pharmacist/prescriptions' },
    { label: 'History', icon: Clock, path: '/pharmacist/history' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 5%)' }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'hsl(222, 47%, 8%)',
        borderBottom: '1px solid hsl(217, 33%, 17%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <Menu size={24} />
          </button>
          <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
            UNZA DigiHealth - Pharmacist
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <Bell size={20} />
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'hsl(142, 76%, 36%)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        bottom: 0,
        width: '256px',
        background: 'hsl(222, 47%, 8%)',
        borderRight: '1px solid hsl(217, 33%, 17%)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        zIndex: 50,
        padding: '1rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'hsl(217, 33%, 17%)',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'hsl(142, 76%, 36%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>
                {user?.name}
              </div>
              <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.75rem' }}>
                Pharmacist
              </div>
            </div>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: isActive ? 'hsl(142, 76%, 36%)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  transition: 'background 0.2s'
                }}
              >
                <Icon size={20} />
                <span style={{ fontWeight: '500' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ paddingTop: '64px', padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
}
