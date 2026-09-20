import { useListHivSupportSessions, useUpdateHivSupportSession, getListHivSupportSessionsQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Search, Play, Check, Calendar } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  requested: '#f59e0b',
  active: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

export default function HivSessions() {
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading, refetch } = useListHivSupportSessions({
    query: { queryKey: getListHivSupportSessionsQueryKey() }
  });
  const updateSession = useUpdateHivSupportSession();

  const handleAccept = (id: number) => {
    if (confirm('Accept this HIV/AIDS support session?')) {
      updateSession.mutate(
        { id, data: { status: 'active' } },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListHivSupportSessionsQueryKey() }) }
      );
    }
  };

  const handleComplete = (id: number) => {
    updateSession.mutate(
      { id, data: { status: 'completed' } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListHivSupportSessionsQueryKey() }) }
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading sessions...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Support Sessions
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Manage HIV counseling and support sessions
        </p>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Shield size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No sessions
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            HIV support sessions will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sessions.map((session) => {
            const statusColor = STATUS_COLORS[session.status] || STATUS_COLORS.requested;
            return (
              <div
                key={session.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '19px',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={18} style={{ color: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      {session.student?.name ?? 'Patient'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                      {session.topic}
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
                    {session.status}
                  </div>
                </div>

                {session.appointmentDate && (
                  <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Appt: {new Date(session.appointmentDate).toLocaleString()}
                  </div>
                )}

                <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {new Date(session.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {session.status === 'requested' && (
                    <button
                      onClick={() => handleAccept(session.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      Accept
                    </button>
                  )}
                  {session.status === 'active' && (
                    <button
                      onClick={() => handleComplete(session.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      <Check size={16} />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
