import { useState, useEffect } from 'react';
import { useListNotifications, useMarkNotificationRead, type Notification, type NotificationType } from "@/lib/api-client";
import { Header } from './Header';
import { Stethoscope, Clipboard, Pill, Microscope, MessageCircle, Settings, Bell, Zap, PartyPopper, X, Flask, TestTube2, LucideIcon } from 'lucide-react';

export function AlertsDemo({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: apiData, isLoading: apiIsLoading, error: apiError } = useListNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();

  // Update notifications when API data changes
  useEffect(() => {
    if (apiData !== undefined) {
      setNotifications(apiData);
      setUnreadCount(apiData.filter(n => !n.readStatus).length);
      setIsLoading(apiIsLoading);
      if (apiError) setError('Failed to load notifications');
    }
  }, [apiData, apiIsLoading, apiError]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, readStatus: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In a real app, we'd have a markAllAsRead mutation
      // For now, we'll mark each individually
      for (const notification of notifications) {
        if (!notification.readStatus) {
          await markAsRead(notification.id);
        }
      }
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const notificationGroups = {
    consultation: { color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', icon: Stethoscope },
    queue: { color: '#3b82f6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)', icon: Clipboard },
    prescription: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', icon: Pill },
    lab_result: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', icon: Microscope },
    counseling: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)', icon: MessageCircle },
    system: { color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.2)', icon: Settings },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 5%)' }}>
      <Header activePage="alerts" onNavigate={onNavigate} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(52,211,153,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
              Notifications Center
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#e2faf2', margin: 0 }}>
              System Alerts
            </h1>
          </div>
          {unreadCount > 0 && (
            <button className="btn-ghost-dh" style={{ height: 40, padding: '0 18px', fontSize: 13, borderRadius: 10 }}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {Object.keys(notificationGroups).map(type => {
            const count = notifications.filter(n => n.type === type as NotificationType && !n.readStatus).length;
            const meta = notificationGroups[type as NotificationType];
            return count > 0 && (
              <div key={type} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 99,
                background: meta.bg, border: `1px solid ${meta.border}`,
                fontSize: 12, fontWeight: 700, color: meta.color,
                textTransform: 'capitalize',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
                {count} {type}
              </div>
            );
          })}
        </div>

        {/* Alert cards */}
        <div style={{ marginBottom: 40 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Bell style={{ width: 16, height: 16 }} /> Active Alerts</div>
          {notifications.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '56px 24px',
              borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ marginBottom: 12 }}>
                <PartyPopper style={{ width: 40, height: 40, color: '#94a3b8' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e2faf2', marginBottom: 6 }}>No notifications</div>
              <div style={{ fontSize: 13, color: 'rgba(160,180,195,0.5)' }}>You’re all caught up!</div>
            </div>
          ) : notifications.map(notification => {
            const meta = notificationGroups[notification.type as NotificationType] || {
              color: '#9ca3af', bg: 'rgba(158,158,158,0.06)', border: 'rgba(158,158,158,0.2)', icon: Bell
            };

            return (
              <div key={notification.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '20px 22px', borderRadius: 16,
                background: meta.bg, border: `1px solid ${meta.border}`,
                marginBottom: 12, position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}>
                {/* left accent bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: meta.color, borderRadius: '0 2px 2px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
                  }}>
                    <meta.icon style={{ width: 20, height: 20, color: meta.color }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: meta.color }}>{notification.title}</span>
                      <span style={{ fontSize: 11, color: 'rgba(160,180,195,0.4)', marginLeft: 'auto' }}>{notification.createdAt}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(180,200,215,0.75)', margin: '0 0 12px', lineHeight: 1.6 }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{
                        padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: `${meta.color}20`, border: `1px solid ${meta.color}40`, color: meta.color,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }} onClick={() => handleMarkAsRead(notification.id)}>
                        Mark as Read
                      </button>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleMarkAsRead(notification.id)} style={{
                  width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(160,180,195,0.5)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease',
                  marginTop: 2,
                }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(160,180,195,0.5)'; }}
                >
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Trigger toasts (for testing) */}
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap style={{ width: 16, height: 16 }} /> Test Notifications</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12,
            padding: 24, borderRadius: 20,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['Consultation Update', 'Lab Result Ready', 'Prescription Ready', 'System Alert'].map((title, index) => (
              <button key={index}
                onClick={() => {
                  // Simulate a new notification by adding to the list
                  const newNotification: Notification = {
                    id: Date.now() + index,
                    userId: 1, // Assuming current user ID is 1 for demo
                    title,
                    message: `This is a test ${title.toLowerCase()} notification`,
                    type: ['Consultation Update', 'Lab Result Ready', 'Prescription Ready'].includes(title)
                      ? title === 'Consultation Update' ? 'consultation' :
                        title === 'Lab Result Ready' ? 'lab_result' : 'prescription'
                      : 'system' as NotificationType,
                    readStatus: false,
                    createdAt: new Date().toISOString(),
                  };
                  setNotifications(prev => [newNotification, ...prev]);
                  setUnreadCount(prev => prev + 1);
                }}
                style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10,
                  padding: '14px 16px', borderRadius: 12,
                  background: `${title === 'Consultation Update' ? '#10b98110' :
                                title === 'Lab Result Ready' ? '#ef444410' :
                                title === 'Prescription Ready' ? '#f59e0b10' : '#6b728010'}`,
                  border: `1px solid ${title === 'Consultation Update' ? '#10b98125' :
                                title === 'Lab Result Ready' ? '#ef444425' :
                                title === 'Prescription Ready' ? '#f59e0b25' : '#6b728025'}`,
                  color: title === 'Consultation Update' ? '#10b981' :
                          title === 'Lab Result Ready' ? '#ef4444' :
                          title === 'Prescription Ready' ? '#f59e0b' : '#6b7280',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {title === 'Consultation Update' ? <Stethoscope style={{ width: 20, height: 20 }} /> :
                   title === 'Lab Result Ready' ? <Microscope style={{ width: 20, height: 20 }} /> :
                   title === 'Prescription Ready' ? <Pill style={{ width: 20, height: 20 }} /> : <Settings style={{ width: 20, height: 20 }} />}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(160,180,195,0.6)' }}>Test notification</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}