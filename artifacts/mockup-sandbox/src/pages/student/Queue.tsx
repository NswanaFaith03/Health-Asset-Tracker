import { useGetMyQueuePosition, getGetMyQueuePositionQueryKey } from '@/lib/api-client';
import { RefreshCw, Users, Info } from 'lucide-react';

export default function StudentQueue() {
  const { data: queuePosition, isLoading, refetch } = useGetMyQueuePosition({
    query: { queryKey: getGetMyQueuePositionQueryKey(), refetchInterval: 20_000 },
  });

  const isWaiting = queuePosition?.status === 'waiting';

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading queue status...</div>
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
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(52, 211, 153, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
              Queue Status
            </h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Track your current waiting position</p>
          </div>
          <button
            onClick={() => refetch()}
            style={{
              background: 'white',
              color: '#10b981',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            <RefreshCw style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
      </div>

      {!queuePosition ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Users style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No queue data available
          </h2>
          <p style={{ color: '#64748b' }}>
            Once you are in the queue, your position will appear here
          </p>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid #10b981',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#10b981'
          }}>
            {queuePosition.position}
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            You are {isWaiting ? 'waiting' : queuePosition.status.replace(/_/g, ' ')} in the queue
          </div>
          <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1rem' }}>
            Position {queuePosition.position} of {queuePosition.totalInQueue}
          </div>
          {queuePosition.status === 'waiting' && (
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              We will notify you when your turn is next
            </div>
          )}
          {!isWaiting && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              textAlign: 'left'
            }}>
              <Info style={{ width: '1rem', height: '1rem', color: '#64748b', flexShrink: 0 }} />
              <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                If you expected to be in the queue but are not, please open your consultation or contact the clinic.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
