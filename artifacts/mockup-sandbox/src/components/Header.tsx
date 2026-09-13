import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { SidebarToggle } from './Sidebar';

export function Header({ activePage, onMenuToggle, sidebarOpen }: { activePage?: string; onMenuToggle?: () => void; sidebarOpen?: boolean }) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '0 16px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }} className="header-container">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/student/home')}>
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

        {/* Sidebar Toggle */}
        {onMenuToggle && <SidebarToggle onClick={onMenuToggle} isOpen={sidebarOpen || false} />}

        {/* Right side - Notification bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(v => !v)}
              style={{
                width: 38, height: 38, borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#f8fafc', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#64748b',
                fontSize: 16, transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#16a34a';
                (e.currentTarget as HTMLElement).style.color = '#16a34a';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLElement).style.color = '#64748b';
              }}
            >
              <Bell style={{ width: 16, height: 16 }} />
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 7, height: 7, borderRadius: '50%',
                background: '#ef4444',
              }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
