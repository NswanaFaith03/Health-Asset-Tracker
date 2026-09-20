import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { NotificationToast } from './NotificationToast';
import { Sidebar, SidebarToggle } from './Sidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#ffffff",
      backgroundImage: "url('/images/admin.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div style={{ 
        minHeight: "100vh",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)"
      }}>
        <Header activePage="admin" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <NotificationToast />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="admin" />
        <Outlet />
      </div>
    </div>
  );
}