import { useState } from 'react';
import { useListLabRequests, useUpdateLabRequestStatus, useUploadLabResult, getListLabRequestsQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Thermometer, Play, Search, Check } from 'lucide-react';

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

export default function LabRequests() {
  const queryClient = useQueryClient();
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [resultText, setResultText] = useState('');

  const { data: requests = [], isLoading, refetch } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });
  const updateStatus = useUpdateLabRequestStatus();
  const uploadResult = useUploadLabResult();

  const handleStartTest = (id: number) => {
    updateStatus.mutate(
      { id, data: { status: 'in_progress' } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLabRequestsQueryKey() }) }
    );
  };

  const handleUploadResult = () => {
    if (!resultText.trim() || !selectedRequest) {
      alert('Please enter test results');
      return;
    }
    uploadResult.mutate(
      { data: { requestId: selectedRequest, results: resultText.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLabRequestsQueryKey() });
          setShowResultModal(false);
          setResultText('');
          setSelectedRequest(null);
        },
        onError: () => alert('Failed to upload result')
      }
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading lab requests...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Lab Requests
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Process laboratory test requests
        </p>
      </div>

      {/* Lab Requests List */}
      {requests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Thermometer size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No lab requests
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Lab requests will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.map((request) => {
            const statusColor = STATUS_COLORS[request.status] || STATUS_COLORS.pending;
            return (
              <div
                key={request.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                      {request.patient?.name ?? 'Patient'}
                    </h3>
                    <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
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
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                    {request.notes}
                  </p>
                )}

                <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleStartTest(request.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <Play size={16} />
                      Start Test
                    </button>
                  )}
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request.id);
                        setShowResultModal(true);
                      }}
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
                      <Check size={16} />
                      Upload Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Result Upload Modal */}
      {showResultModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                Upload Results
              </h2>
              <button
                onClick={() => {
                  setShowResultModal(false);
                  setResultText('');
                  setSelectedRequest(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#1e293b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Test Results
              </label>
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder="Enter full test results..."
                style={{
                  width: '100%',
                  minHeight: '160px',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#1e293b',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={handleUploadResult}
              disabled={uploadResult.isPending}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: uploadResult.isPending ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: uploadResult.isPending ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {uploadResult.isPending ? 'Uploading...' : 'Upload Results'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
