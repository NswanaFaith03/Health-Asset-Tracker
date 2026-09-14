import { useState, useEffect, useRef } from 'react';
import { useGetStudentDashboard, useGetDoctorDashboard, useGetAdminAnalytics, useGetMyQueuePosition } from "@/lib/api-client";
import { Header } from './Header';
import { Users, Calendar, TestTube2, Pill, Stethoscope, Brain, Heart, Clipboard, Building2, Plus, Hand, LucideIcon, Clock } from 'lucide-react';

function AnimatedCounter({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    let start = 0;
    const step = to / (duration / 16);
    ref.current = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(ref.current!); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current!);
  }, [to, duration]);
  return <>{count.toLocaleString()}</>;
}

export function HealthcareDashboard({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // TODO: In a real implementation, we would determine the user's role and call the appropriate dashboard hook
  // For now, we'll use the student dashboard as an example
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentDashboard();
  const { data: doctorData, isLoading: doctorLoading, error: doctorError } = useGetDoctorDashboard();
  const { data: adminData, isLoading: adminLoading, error: adminError } = useGetAdminAnalytics();
  const { data: queueData, isLoading: queueLoading, error: queueError } = useGetMyQueuePosition();

  // For demo purposes, we'll show student data if available, otherwise fall back to mock data
  const dashboardData = studentData || doctorData || adminData;
  const isLoading = studentLoading || doctorLoading || adminLoading;
  const error = studentError || doctorError || adminError;

  // Fallback mock data if API calls fail or return no data
  const fallbackStats = [
    { label: 'Total Patients', value: 1234, icon: Users, color: '#10b981', class: 'emerald', trend: '+12%', sub: 'vs last month' },
    { label: "Today's Appointments", value: 18, icon: Calendar, color: '#3b82f6', class: 'blue', trend: '+3', sub: 'from yesterday' },
    { label: 'Pending Lab Results', value: 8, icon: TestTube2, color: '#f59e0b', class: 'amber', trend: '2 urgent', sub: 'require action' },
    { label: 'Prescriptions', value: 23, icon: Pill, color: '#f43f5e', class: 'rose', trend: '5 expiring', sub: 'this week' },
  ];

  const fallbackRecentActivities = [
    { icon: Stethoscope, title: 'Consultation Completed', detail: 'Patient John Doe', time: '2h ago', color: '#10b981' },
    { icon: TestTube2, title: 'Lab Results Received', detail: 'Patient Jane Smith', time: '4h ago', color: '#f59e0b' },
    { icon: Pill, title: 'Prescription Issued', detail: 'Patient R. Johnson', time: '6h ago', color: '#3b82f6' },
    { icon: Building2, title: 'New Patient Registered', detail: 'Alice Banda', time: '8h ago', color: '#a855f7' },
  ];

  const fallbackServices = [
    { name: 'General\nConsultation', icon: Stethoscope, color: '#10b981', patients: 42 },
    { name: 'Lab\nServices', icon: TestTube2, color: '#f59e0b', patients: 18 },
    { name: 'Mental\nHealth', icon: Brain, color: '#8b5cf6', patients: 12 },
    { name: 'HIV\nSupport', icon: Heart, color: '#f43f5e', patients: 9 },
    { name: 'Pharmacy', icon: Pill, color: '#3b82f6', patients: 56 },
    { name: 'Queue\nMgmt', icon: Clipboard, color: '#14b8a6', patients: 31 },
  ];

  const stats = dashboardData ? [
    {
      label: 'Total Patients',
      value: dashboardData.activeConsultations || 0,
      icon: Users,
      color: '#10b981',
      class: 'emerald',
      trend: '+12%',
      sub: 'vs last month'
    },
    {
      label: "Today's Appointments",
      value: dashboardData.queuePosition?.totalInQueue || 0,
      icon: Calendar,
      color: '#3b82f6',
      class: 'blue',
      trend: '+3',
      sub: 'from yesterday'
    },
    {
      label: 'Pending Lab Results',
      value: dashboardData.pendingLabResults || 0,
      icon: TestTube2,
      color: '#f59e0b',
      class: 'amber',
      trend: '2 urgent',
      sub: 'require action'
    },
    {
      label: 'Prescriptions',
      value: dashboardData.pendingPrescriptions || 0,
      icon: Pill,
      color: '#f43f5e',
      class: 'rose',
      trend: '5 expiring',
      sub: 'this week'
    },
  ] : fallbackStats;

  const recentActivities = dashboardData && dashboardData.recentConsultations && dashboardData.recentConsultations.length > 0
    ? dashboardData.recentConsultations.map((consultation, index) => ({
        icon: Stethoscope,
        title: 'Consultation Completed',
        detail: consultation.student?.name || 'Unknown Patient',
        time: new Date(consultation.updatedAt || consultation.createdAt).toLocaleTimeString(),
        color: '#10b981'
      }))
    : fallbackRecentActivities;

  const services = dashboardData ? [
    { name: 'General\nConsultation', icon: Stethoscope, color: '#10b981', patients: dashboardData.activeConsultations || 0 },
    { name: 'Lab\nServices', icon: TestTube2, color: '#f59e0b', patients: dashboardData.pendingLabResults || 0 },
    { name: 'Mental\nHealth', icon: Brain, color: '#8b5cf6', patients: 12 }, // Placeholder
    { name: 'HIV\nSupport', icon: Heart, color: '#f43f5e', patients: 9 }, // Placeholder
    { name: 'Pharmacy', icon: Pill, color: '#3b82f6', patients: dashboardData.pendingPrescriptions || 0 },
    { name: 'Queue\nMgmt', icon: Clipboard, color: '#14b8a6', patients: dashboardData.queuePosition?.totalInQueue || 0 },
  ] : fallbackServices;

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 5%)' }}>
      <Header activePage="dashboard" onNavigate={onNavigate} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 28px' }}>

        {/* ── Hero Welcome ── */}
        <div style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden',
          padding: '36px 40px', marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 40%, rgba(59,130,246,0.06) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          {/* bg orbs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(52,211,153,0.8)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                UNZA Campus Clinic
              </div>
              <h1 style={{
                fontSize: 34, fontWeight: 900, margin: 0, marginBottom: 8, lineHeight: 1.1,
                background: 'linear-gradient(135deg, #e2faf2 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Hand style={{ width: 16, height: 16 }} /> Good morning, Dr. Smith</span>
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(160,180,195,0.8)', margin: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar style={{ width: 14, height: 14 }} /> {today}</span> &nbsp;·&nbsp; 3 consultations scheduled for today
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary-dh" onClick={() => onNavigate?.('form')} style={{ height: 44, padding: '0 20px', fontSize: 14, borderRadius: 12 }}>
                + New Consultation
              </button>
              <button className="btn-ghost-dh" style={{ height: 44, padding: '0 20px', fontSize: 14, borderRadius: 12 }}>
                View Schedule
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} className={`stat-card ${s.class}`} style={{ animationDelay: `${i * 80}ms` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${s.color}18`, border: `1px solid ${s.color}30`,
                }}>
                  <s.icon style={{ width: 20, height: 20, color: s.color }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                  background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}25`,
                  letterSpacing: '0.2px',
                }}>
                  {s.trend}
                </span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                <AnimatedCounter to={s.value} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(220,235,230,0.75)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(160,180,195,0.5)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap style={{ width: 16, height: 16 }} /> Quick Actions</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'New Consultation', icon: Plus, primary: true },
              { label: 'Order Lab Test', icon: TestTube2, primary: false },
              { label: 'Write Prescription', icon: Clipboard, primary: false },
              { label: 'HIV Support Session', icon: Heart, primary: false },
              { label: 'View Queue', icon: Clipboard, primary: false },
            ].map((btn, i) => btn.primary ? (
              <button key={i} className="btn-primary-dh" style={{ height: 46, fontSize: 14, borderRadius: 12, padding: '0 22px' }}>
                {btn.icon} {btn.label}
              </button>
            ) : (
              <button key={i} className="btn-ghost-dh" style={{ height: 46, fontSize: 14, borderRadius: 12, padding: '0 22px' }}>
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main grid: Activity + Services ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* Recent Activity */}
          <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(220,235,230,0.9)', display: 'flex', alignItems: 'center', gap: 8 }}><Clock style={{ width: 16, height: 16 }} /> Recent Activity</span>
              <button style={{ fontSize: 12, fontWeight: 600, color: '#34d399', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentActivities.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 24px', transition: 'background 0.2s ease', cursor: 'default',
                  borderBottom: i < recentActivities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${a.color}15`, border: `1px solid ${a.color}25`, flexShrink: 0,
                }}>
                  <a.icon style={{ width: 18, height: 18, color: a.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(220,235,230,0.9)', marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(160,180,195,0.6)' }}>{a.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(220,235,230,0.9)', display: 'flex', alignItems: 'center', gap: 8 }}><Building2 style={{ width: 16, height: 16 }} /> Services</span>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {services.map((s, i) => (
                <div key={i} className="service-card">
                  <div style={{ marginBottom: 8 }}>
                    <s.icon style={{ width: 26, height: 26, color: s.color }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(220,235,230,0.85)', whiteSpace: 'pre-line', lineHeight: 1.3, marginBottom: 6 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.patients} patients</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}