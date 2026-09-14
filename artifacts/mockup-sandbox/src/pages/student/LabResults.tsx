import { useListLabRequests, getListLabRequestsQueryKey } from '@/lib/api-client';
import { BarChart3, TrendingUp, Clipboard, FileText } from 'lucide-react';

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

export default function StudentLabResults() {
  const { data: labRequests, isLoading, refetch } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });

  // Filter for completed requests that have results
  const completedWithResults = labRequests?.filter((req: any) => 
    req.status === 'completed' && req.result
  ) || [];

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading lab results...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundImage: "url('/images/nursing_students.jpg')",
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
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(192, 132, 252, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
            Lab Results
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>View your laboratory test results</p>
        </div>
      </div>

      {completedWithResults.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <BarChart3 style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No lab results yet
          </h2>
          <p style={{ color: '#64748b' }}>
            Your lab test results will appear here when available
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {completedWithResults.map((request: any) => (
            <div
              key={request.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {request.testType}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: '#dcfce7',
                  color: '#16a34a'
                }}>
                  Completed
                </div>
              </div>

              {request.result && (
                <>
                  {request.result.resultValue && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <TrendingUp style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                      <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                        Result: {request.result.resultValue} {request.result.unit}
                      </div>
                    </div>
                  )}

                  {request.result.referenceRange && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clipboard style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                      <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                        Reference: {request.result.referenceRange}
                      </div>
                    </div>
                  )}

                  {request.result.status && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <FileText style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                      <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                        Status: {request.result.status}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
