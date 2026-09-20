import { useListPrescriptions, useDispensePrescription, getListPrescriptionsQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Check, Search } from 'lucide-react';

export default function PharmacistPrescriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: prescriptions = [], isLoading, refetch } = useListPrescriptions({ status: 'pending' }, {
    query: { queryKey: getListPrescriptionsQueryKey({ status: 'pending' }) }
  });
  const dispense = useDispensePrescription();

  const handleDispense = (id: number) => {
    if (confirm('Confirm dispensing this medication?')) {
      dispense.mutate(
        { id, data: { dispensedBy: user?.id ?? 0 } },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPrescriptionsQueryKey({ status: 'pending' }) }) }
      );
    }
  };

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
          Pending Prescriptions
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Review and dispense prescriptions
        </p>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Package size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No pending prescriptions
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Pending prescriptions will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {prescriptions.map((prescription) => (
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
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                  {prescription.patient?.name ?? 'Patient'}
                </h3>
                <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', margin: '0.25rem 0' }}>
                  {prescription.medication}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                  {prescription.dosage}
                </p>
              </div>

              <p style={{ color: '#1e293b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                {prescription.instructions}
              </p>

              {prescription.duration && (
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                  Duration: {prescription.duration}
                </p>
              )}

              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                Prescribed by Dr. {prescription.doctor?.name ?? 'Unknown'}
              </p>

              <button
                onClick={() => handleDispense(prescription.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={18} />
                Dispense
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
