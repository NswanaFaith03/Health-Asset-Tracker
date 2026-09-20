import { useGetQueue, useCompleteQueueEntry, getGetQueueQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function DoctorQueue() {
  const queryClient = useQueryClient();
  const { data: queue = [], isLoading, refetch } = useGetQueue({ query: { queryKey: getGetQueueQueryKey() } });
  const completeEntry = useCompleteQueueEntry();

  const nextPatient = queue[0];
  const waitingList = queue.slice(1);

  const handleComplete = (id: number, name: string) => {
    if (confirm(`Mark ${name}'s visit as complete?`)) {
      completeEntry.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey() }),
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading queue...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Patient Queue
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Manage your consultation queue
        </p>
      </div>

      {/* Queue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Users size={20} style={{ color: '#10b981' }} />
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total in Queue</span>
          </div>
          <div style={{ color: '#1e293b', fontSize: '2rem', fontWeight: '700' }}>{queue.length}</div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Clock size={20} style={{ color: '#f59e0b' }} />
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Next Wait</span>
          </div>
          <div style={{ color: '#1e293b', fontSize: '2rem', fontWeight: '700' }}>
            {nextPatient ? `~${nextPatient.estimatedWaitMinutes ?? 10} min` : '—'}
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Critical Cases</span>
          </div>
          <div style={{ color: '#1e293b', fontSize: '2rem', fontWeight: '700' }}>
            {queue.filter(q => q.consultation?.severity === 'critical').length}
          </div>
        </div>
      </div>

      {/* Next Patient */}
      {nextPatient && (
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Next Patient
          </h2>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #10b981',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white'
              }}>
                #{nextPatient.queueNumber}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
                  {nextPatient.student?.name ?? 'Patient'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                  {nextPatient.consultation?.symptoms ?? 'No symptoms noted'}
                </p>
              </div>
              {nextPatient.consultation?.severity && (
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  background: getSeverityColor(nextPatient.consultation.severity),
                  color: 'white'
                }}>
                  {nextPatient.consultation.severity.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => handleComplete(nextPatient.id, nextPatient.student?.name ?? 'Patient')}
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
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle size={18} />
              Complete Visit
            </button>
          </div>
        </div>
      )}

      {/* Waiting List */}
      {waitingList.length > 0 && (
        <div>
          <h2 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Waiting ({waitingList.length})
          </h2>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {waitingList.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#64748b'
                }}>
                  #{entry.queueNumber}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                    {entry.student?.name ?? 'Patient'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                    {entry.consultation?.symptoms ?? '—'}
                  </p>
                </div>

                {entry.consultation?.severity && (
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: getSeverityColor(entry.consultation.severity),
                    color: 'white'
                  }}>
                    {entry.consultation.severity.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!nextPatient && waitingList.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Users size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            Queue is clear
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            No patients waiting right now
          </p>
        </div>
      )}
    </div>
  );
}
