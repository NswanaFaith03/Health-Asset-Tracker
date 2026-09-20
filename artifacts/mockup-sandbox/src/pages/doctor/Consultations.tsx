import { useState } from 'react';
import { useListConsultations, getListConsultationsQueryKey } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, Filter } from 'lucide-react';

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

export default function DoctorConsultations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: consultations = [], isLoading, refetch } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() }
  });

  const filtered = consultations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.student?.name ?? "").toLowerCase().includes(q) ||
      (c.symptoms ?? "").toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading consultations...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Consultations
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          {consultations.length} total · {consultations.filter(c => c.status === 'submitted' || c.status === 'under_review').length} pending
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={20} style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b'
        }} />
        <input
          type="text"
          placeholder="Search patients or symptoms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '0.875rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        />
        {search.length > 0 && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Consultations List */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Activity size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No consultations
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            {search ? 'No results for your search' : 'Patient consultations will appear here'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map((consultation) => {
            const statusColor = STATUS_COLORS[consultation.status] || STATUS_COLORS.submitted;
            const severityColor = SEVERITY_COLORS[consultation.severity];
            return (
              <div
                key={consultation.id}
                onClick={() => navigate(`/doctor/consultations/${consultation.id}`)}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  borderLeft: `3px solid ${severityColor || '#6b7280'}`,
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = statusColor;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${statusColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      {consultation.student?.name ?? 'Patient'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: '1.4' }}>
                      {consultation.symptoms}
                    </p>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: `${statusColor}20`,
                    color: statusColor
                  }}>
                    {STATUS_LABELS[consultation.status] || consultation.status}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {severityColor && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: `${severityColor}18`,
                      color: severityColor
                    }}>
                      {consultation.severity} severity
                    </span>
                  )}
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(consultation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
