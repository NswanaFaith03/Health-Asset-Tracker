import { useListPrescriptions, getListPrescriptionsQueryKey } from '@/lib/api-client';
import { Clock, Search } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  dispensed: '#10b981',
  cancelled: '#ef4444',
  pending: '#f59e0b',
};

const STATUS_LABELS: Record<string, string> = {
  dispensed: 'Dispensed',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

export default function PharmacistHistory() {
  const { data: prescriptions = [], isLoading, refetch } = useListPrescriptions(undefined, {
    query: { queryKey: getListPrescriptionsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ color: 'hsl(215, 20%, 65%)' }}>Loading history...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Prescription History
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          View all dispensed and cancelled prescriptions
        </p>
      </div>

      {/* History List */}
      {prescriptions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'hsl(217, 33%, 17%)',
          borderRadius: '12px',
          border: '1px solid hsl(217, 33%, 25%)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Clock size={48} style={{ color: 'hsl(215, 20%, 65%)' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
            No history
          </h2>
          <p style={{ color: 'hsl(215, 20%, 65%)', margin: 0 }}>
            Prescription history will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {prescriptions.map((prescription) => {
            const statusColor = STATUS_COLORS[prescription.status] || STATUS_COLORS.pending;
            return (
              <div
                key={prescription.id}
                style={{
                  background: 'hsl(217, 33%, 17%)',
                  borderRadius: '12px',
                  border: '1px solid hsl(217, 33%, 25%)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      {prescription.patient?.name ?? 'Patient'}
                    </h3>
                    <p style={{ color: 'hsl(142, 76%, 36%)', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      {prescription.medication}
                    </p>
                    <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      {prescription.dosage}
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

                {prescription.dispensedBy && (
                  <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                    Dispensed by: {prescription.dispensedBy}
                  </p>
                )}

                <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {new Date(prescription.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
