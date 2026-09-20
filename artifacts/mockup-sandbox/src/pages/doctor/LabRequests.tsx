import { useListLabRequests, getListLabRequestsQueryKey } from '@/lib/api-client';
import { Thermometer, Plus, Search } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function DoctorLabRequests() {
  const { data: labRequests = [], isLoading, refetch } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ color: 'hsl(215, 20%, 65%)' }}>Loading lab requests...</div>
      </div>
    );
  }



  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Lab Requests
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Request and track laboratory tests
        </p>
      </div>

      {/* Lab Requests List */}
      {labRequests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'hsl(217, 33%, 17%)',
          borderRadius: '12px',
          border: '1px solid hsl(217, 33%, 25%)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Thermometer size={48} style={{ color: 'hsl(215, 20%, 65%)' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
            No lab requests
          </h2>
          <p style={{ color: 'hsl(215, 20%, 65%)', margin: 0 }}>
            Lab requests will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {labRequests.map((request) => {
            const statusColor = STATUS_COLORS[request.status] || STATUS_COLORS.pending;
            return (
              <div
                key={request.id}
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
                      {request.patient?.name ?? 'Patient'}
                    </h3>
                    <p style={{ color: 'hsl(142, 76%, 36%)', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                      {request.testType}
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
                    {STATUS_LABELS[request.status] || request.status}
                  </div>
                </div>

                {request.notes && (
                  <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                    {request.notes}
                  </p>
                )}

                <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
