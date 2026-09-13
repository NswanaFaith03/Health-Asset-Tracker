import { useListPrescriptions, getListPrescriptionsQueryKey } from '@workspace/api-client-react';
import { Pill, Clipboard, Info, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  dispensed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  dispensed: 'Dispensed',
  cancelled: 'Cancelled',
};

export default function StudentPrescriptions() {
  const { data: prescriptions, isLoading, refetch } = useListPrescriptions(undefined, {
    query: { queryKey: getListPrescriptionsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 197, 253, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
            Prescriptions
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Your medication history</p>
        </div>
      </div>

      {!prescriptions || prescriptions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Pill style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No prescriptions yet
          </h2>
          <p style={{ color: '#64748b' }}>
            Your prescribed medications will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {prescriptions.map((rx: any) => (
            <div
              key={rx.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clipboard style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {rx.medication}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {rx.dosage}
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: `${STATUS_COLORS[rx.status]}20`,
                  color: STATUS_COLORS[rx.status] || '#6b7280'
                }}>
                  {STATUS_LABELS[rx.status] || rx.status}
                </div>
              </div>

              {rx.instructions && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Info style={{ width: '0.875rem', height: '0.875rem', color: '#64748b', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                    {rx.instructions}
                  </div>
                </div>
              )}

              {rx.duration && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#64748b', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Duration: {rx.duration}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
