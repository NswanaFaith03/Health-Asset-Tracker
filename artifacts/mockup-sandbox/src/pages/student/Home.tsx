import { useAuth } from '../../contexts/AuthContext';
import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Stethoscope, Pill, Microscope, Plus, Users, Clipboard, Thermometer, Smile, Shield, Phone, Hand } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dashboard, isLoading, refetch } = useGetStudentDashboard({
    query: { queryKey: getGetStudentDashboardQueryKey() },
  });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const stats = [
    { label: 'Consultations', value: dashboard?.activeConsultations ?? 0, icon: Stethoscope, color: '#10b981' },
    { label: 'Pending Rx', value: dashboard?.pendingPrescriptions ?? 0, icon: Pill, color: '#0891b2' },
    { label: 'Lab Results', value: dashboard?.pendingLabResults ?? 0, icon: Microscope, color: '#14b8a6' },
  ];

  // Initialize Chart.js
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new (window as any).Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Consultations', 'Prescriptions', 'Lab Results'],
            datasets: [{
              data: [
                dashboard?.activeConsultations ?? 0,
                dashboard?.pendingPrescriptions ?? 0,
                dashboard?.pendingLabResults ?? 0
              ],
              backgroundColor: ['#10b981', '#0891b2', '#14b8a6'],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  font: { size: 12 }
                }
              }
            },
            cutout: '70%'
          }
        });
      }
    }

    // Update chart data when dashboard changes
    if (chartInstance.current && dashboard) {
      chartInstance.current.data.datasets[0].data = [
        dashboard.activeConsultations ?? 0,
        dashboard.pendingPrescriptions ?? 0,
        dashboard.pendingLabResults ?? 0
      ];
      chartInstance.current.update();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dashboard]);

  const features = [
    { label: 'New Consultation', icon: Plus, route: '/student/consultations', color: '#10b981' },
    { label: 'Queue', icon: Users, route: '/student/queue', color: '#059669' },
    { label: 'Prescriptions', icon: Clipboard, route: '/student/prescriptions', color: '#0891b2' },
    { label: 'Lab Results', icon: Thermometer, route: '/student/lab-results', color: '#14b8a6' },
    { label: 'Mental Buddy', icon: Smile, route: '/student/mental-buddy', color: '#ec4899' },
    { label: 'HIV/AIDS Support', icon: Shield, route: '/student/hiv-aids', color: '#f97316' },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section with Background */}
      <div style={{ 
        marginBottom: '2rem',
        backgroundImage: "url('/images/school.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "16px",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(22, 163, 74, 0.8) 100%)",
          borderRadius: "16px"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Hand style={{ width: '2rem', height: '2rem' }} />
            Good day {firstName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Student Number: {user?.studentNumber || 'N/A'}
          </p>
        </div>
      </div>

      {/* Queue Banner */}
      {dashboard?.queuePosition && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: '3px solid #16a34a',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#16a34a',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          }}>
            {dashboard.queuePosition.queueNumber}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>
              Your queue spot
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
              #{dashboard.queuePosition.position} of {dashboard.queuePosition.totalInQueue}
            </div>
            {dashboard.queuePosition.estimatedWaitMinutes ? (
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                ~{dashboard.queuePosition.estimatedWaitMinutes} min wait
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Waiting for doctor availability
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1e293b', 
          marginBottom: '1rem' 
        }}>
          Overview
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem' 
        }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${stat.color}20`;
                (e.currentTarget as HTMLElement).style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <stat.icon style={{ width: '2rem', height: '2rem', color: stat.color }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1e293b', 
          marginBottom: '1rem' 
        }}>
          Health Activity
        </h2>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* Features Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1e293b', 
          marginBottom: '1rem' 
        }}>
          Health Services
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '0.75rem' 
        }}>
          {features.map((feature) => (
            <button
              key={feature.label}
              onClick={() => navigate(feature.route)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = feature.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${feature.color}20`;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <feature.icon style={{ width: '2rem', height: '2rem', color: feature.color }} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                {feature.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Section */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Phone style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            Emergency Help
          </h3>
        </div>
        <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>
          If you are in danger or need urgent clinic help, call emergency services.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="tel:+260123456789"
            style={{
              background: '#f59e0b',
              color: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            <Phone style={{ width: '1.25rem', height: '1.25rem' }} />
            Call Emergency
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText('+260123456789');
              (window as any).Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Emergency number copied to clipboard',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
              });
            }}
            style={{
              background: '#ffffff',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#f59e0b';
              (e.currentTarget as HTMLElement).style.color = '#f59e0b';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
              (e.currentTarget as HTMLElement).style.color = '#64748b';
            }}
          >
            <Clipboard style={{ width: '1.25rem', height: '1.25rem' }} />
            Copy Number
          </button>
        </div>
      </div>
    </div>
  );
}
