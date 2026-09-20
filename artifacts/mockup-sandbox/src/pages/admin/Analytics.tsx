import { useGetAdminAnalytics, getGetAdminAnalyticsQueryKey } from '@/lib/api-client';
import { Users, Activity, Clipboard, Thermometer, Heart } from 'lucide-react';

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Total Users', icon: 'users' },
  { key: 'totalConsultations', label: 'Total Consults', icon: 'clipboard' },
  { key: 'consultationsToday', label: "Today's Consults", icon: 'calendar' },
  { key: 'prescriptionsIssued', label: 'Prescriptions', icon: 'package' },
  { key: 'labTestsCompleted', label: 'Lab Tests', icon: 'activity' },
  { key: 'counselingSessions', label: 'Counseling Sessions', icon: 'heart' },
];

export default function AdminAnalytics() {
  const { data: analytics, isLoading, refetch } = useGetAdminAnalytics({
    query: { queryKey: getGetAdminAnalyticsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Analytics
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Overview of system activity and metrics
        </p>
      </div>

      {analytics ? (
        <>
          {/* Highlight Card */}
          <div style={{
            background: '#10b981',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Avg Wait Time
            </div>
            <div style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800' }}>
              {analytics.averageWaitMinutes} min
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {STAT_CARDS.map(({ key, label, icon }) => {
              let IconComponent = Users;
              if (icon === 'clipboard') IconComponent = Clipboard;
              else if (icon === 'calendar') IconComponent = Activity;
              else if (icon === 'package') IconComponent = Clipboard;
              else if (icon === 'activity') IconComponent = Thermometer;
              else if (icon === 'heart') IconComponent = Heart;
              
              return (
                <div
                  key={key}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <IconComponent size={20} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                  <div style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    {(analytics as any)[key] ?? 0}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Users by Role */}
          {(analytics as any).usersByRole && (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Users by Role
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {Object.entries((analytics as any).usersByRole).map(([role, count]) => (
                  <div
                    key={role}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>
                      {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </div>
                    <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: '700' }}>
                      {String(count)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
