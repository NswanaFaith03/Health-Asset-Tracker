import { useListNotifications, getListNotificationsQueryKey } from '@workspace/api-client-react';
import { RefreshCw, Bell, Pill, Microscope, Stethoscope, Users, Megaphone, LucideIcon } from 'lucide-react';

const getNotificationIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'prescription': return Pill;
    case 'lab': return Microscope;
    case 'consultation': return Stethoscope;
    case 'queue': return Users;
    default: return Megaphone;
  }
};

export default function StudentNotifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications({
    query: { queryKey: getListNotificationsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundImage: "url('/images/school.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(251, 146, 60, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
              Notifications
            </h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Stay updated with your health information</p>
          </div>
          <button
            onClick={() => refetch()}
            style={{
              background: 'white',
              color: '#f97316',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <RefreshCw style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Bell style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No notifications
          </h2>
          <p style={{ color: '#64748b' }}>
            You're all caught up!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              style={{
                background: notification.readStatus ? '#ffffff' : '#f0fdf4',
                border: notification.readStatus ? '1px solid #e2e8f0' : '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: notification.readStatus ? '#f1f5f9' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {(() => {
                    const Icon = getNotificationIcon(notification.type);
                    return <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#64748b' }} />;
                  })()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {notification.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    {notification.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                {!notification.readStatus && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    flexShrink: 0
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
