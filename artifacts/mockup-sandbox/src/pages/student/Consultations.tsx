import { useListConsultations, getListConsultationsQueryKey } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { Plus, Clipboard } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  submitted: '#f59e0b',
  under_review: '#3b82f6',
  assigned: '#8b5cf6',
  responded: '#10b981',
  closed: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Assigned',
  responded: 'Responded',
  closed: 'Closed',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function StudentConsultations() {
  const navigate = useNavigate();
  const { data: consultations, isLoading, refetch } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading consultations...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundImage: "url('/images/doctor.jpg')",
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
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(52, 211, 153, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
              My Consultations
            </h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Get medical help from qualified doctors</p>
          </div>
          <button
            onClick={() => navigate('/student/consultations/new')}
            style={{
              background: 'white',
              color: '#10b981',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
            New Consultation
          </button>
        </div>
      </div>

      {!consultations || consultations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Clipboard style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No consultations yet
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Start a new consultation to get medical help
          </p>
          <button
            onClick={() => navigate('/student/consultations/new')}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create First Consultation
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {consultations.map((consultation: any) => (
            <div
              key={consultation.id}
              onClick={() => navigate(`/student/consultations/${consultation.id}`)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#10b981';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(16,185,129,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: SEVERITY_COLORS[consultation.severity] || '#6b7280',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {consultation.symptoms}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(consultation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: `${STATUS_COLORS[consultation.status]}20`,
                  color: STATUS_COLORS[consultation.status] || '#6b7280'
                }}>
                  {STATUS_LABELS[consultation.status] || consultation.status}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  → View details
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
