import { useState } from 'react';
import { BarChart2, Users, Activity, Clipboard, Thermometer, Heart } from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics] = useState({
    totalUsers: 1250,
    totalConsultations: 3420,
    consultationsToday: 45,
    averageWaitMinutes: 12,
    activePatients: 890,
    prescriptionsIssued: 2150,
    labTestsCompleted: 1890,
    counselingSessions: 560,
    usersByRole: {
      student: 850,
      doctor: 45,
      pharmacist: 30,
      lab_technician: 25,
      mental_health_counselor: 15,
      hiv_professional: 10,
      admin: 5,
      nurse: 270
    }
  });

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'hsl(217, 91%, 60%)' },
    { label: 'Total Consultations', value: analytics.totalConsultations, icon: Activity, color: 'hsl(142, 76%, 36%)' },
    { label: 'Consultations Today', value: analytics.consultationsToday, icon: Clipboard, color: 'hsl(45, 93%, 47%)' },
    { label: 'Avg Wait Time', value: `${analytics.averageWaitMinutes}m`, icon: Activity, color: 'hsl(28, 100%, 50%)' },
    { label: 'Active Patients', value: analytics.activePatients, icon: Users, color: 'hsl(280, 67%, 55%)' },
    { label: 'Prescriptions Issued', value: analytics.prescriptionsIssued, icon: Clipboard, color: 'hsl(217, 33%, 17%)' },
    { label: 'Lab Tests Completed', value: analytics.labTestsCompleted, icon: Thermometer, color: 'hsl(199, 89%, 48%)' },
    { label: 'Counseling Sessions', value: analytics.counselingSessions, icon: Heart, color: 'hsl(0, 72%, 51%)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Overview of system activity and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: 'hsl(217, 33%, 17%)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid hsl(217, 33%, 25%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Icon size={20} style={{ color: stat.color }} />
                <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>{stat.label}</span>
              </div>
              <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Users by Role */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        padding: '1.5rem'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Users by Role
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {Object.entries(analytics.usersByRole).map(([role, count]) => (
            <div
              key={role}
              style={{
                background: 'hsl(217, 33%, 25%)',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center'
              }}
            >
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {count}
              </div>
              <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                {role.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
