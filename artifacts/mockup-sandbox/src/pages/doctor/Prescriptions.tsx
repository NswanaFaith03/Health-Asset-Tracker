import { useListPrescriptions, getListPrescriptionsQueryKey } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Clipboard, Plus, Search } from 'lucide-react';

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

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const { data: prescriptions = [], isLoading, refetch } = useListPrescriptions(undefined, {
    query: { queryKey: getListPrescriptionsQueryKey() }
  });

  const mine = prescriptions.filter(
    (p) => p.doctorId === user?.id || p.doctor?.id === user?.id
  );

  const pending = mine.filter((p) => p.status === 'pending').length;
  const dispensed = mine.filter((p) => p.status === 'dispensed').length;

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Prescriptions
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Medications you have issued
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: '700' }}>{mine.length}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total</div>
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: '700' }}>{pending}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Pending</div>
        </div>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: '700' }}>{dispensed}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Dispensed</div>
        </div>
      </div>

      {/* Prescriptions List */}
      {mine.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Clipboard size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No prescriptions yet
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Prescriptions you issue to patients will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {mine.map((prescription) => {
            const statusColor = STATUS_COLORS[prescription.status] || STATUS_COLORS.pending;
            return (
              <div
                key={prescription.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Clipboard size={18} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      {prescription.patient?.name ?? 'Patient'}
                    </h3>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      {prescription.medication}
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
                    {STATUS_LABELS[prescription.status] || prescription.status}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', padding: '0.75rem 0', borderTop: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Dosage</div>
                    <div style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: '600' }}>{prescription.dosage ?? '—'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Date</div>
                    <div style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: '600' }}>
                      {new Date(prescription.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>

                {prescription.instructions && (
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0', padding: '0.5rem 0', borderTop: '1px solid #e2e8f0' }}>
                    {prescription.instructions}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
