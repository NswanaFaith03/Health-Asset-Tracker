import { useState, useEffect } from 'react';
import { useListNotifications, getListNotificationsQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, X } from 'lucide-react';

export function NotificationToast() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const seenIds = useState<Set<number>>(new Set())[0];

  const { data: notifications } = useListNotifications(
    { query: { queryKey: getListNotificationsQueryKey(), refetchInterval: 30_000, enabled: true } }
  );

  useEffect(() => {
    if (!notifications) return;
    const unread = (notifications as any[]).filter((n) => !n.readStatus);
    const unseen = unread.filter((n) => !seenIds.has(n.id));
    
    if (unseen.length === 0) return;
    
    unseen.forEach((n) => seenIds.add(n.id));
    const latest = unseen[0];
    setToast({ title: latest.title, message: latest.message });
    setVisible(true);
    
    // Auto-hide after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [notifications, seenIds]);

  if (!toast || !visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#10b981',
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Bell style={{ width: 16, height: 16, color: '#ffffff' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
          {toast.title}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => setToast(null), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        <X style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}