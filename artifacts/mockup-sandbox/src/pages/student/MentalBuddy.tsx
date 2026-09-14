import { useState } from 'react';
import { useListMentalHealthSessions, useCreateMentalHealthSession, getListMentalHealthSessionsQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Brain, Lock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  requested: '#f59e0b',
  active: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function StudentMentalBuddy() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const { data: sessions, isLoading, refetch } = useListMentalHealthSessions({
    query: { queryKey: getListMentalHealthSessionsQueryKey() }
  });
  const createSession = useCreateMentalHealthSession();

  const handleCreate = () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }
    createSession.mutate(
      { data: { topic: topic.trim(), isAnonymous, initialMessage: initialMessage.trim() || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMentalHealthSessionsQueryKey() });
          setShowModal(false);
          setTopic('');
          setInitialMessage('');
          setIsAnonymous(false);
        },
        onError: () => alert('Failed to create session')
      }
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading mental health sessions...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundImage: "url('/images/happystudents.jpg')",
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
          background: "linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(244, 114, 182, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', margin: 0 }}>
                Mental Buddy
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>Confidential mental health support</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'white',
                color: '#ec4899',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
              New Session
            </button>
          </div>
        </div>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Brain style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No mental health sessions yet
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Start a confidential counseling session
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
            }}
          >
            Start Session
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sessions.map((session: any) => (
            <div
              key={session.id}
              onClick={() => navigate(`/student/mental-buddy/${session.id}`)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#ec4899';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(236,72,153,0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {session.topic}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: `${STATUS_COLORS[session.status]}20`,
                  color: STATUS_COLORS[session.status] || '#6b7280'
                }}>
                  {STATUS_LABELS[session.status] || session.status}
                </div>
              </div>

              {session.isAnonymous && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock style={{ width: '0.875rem', height: '0.875rem', color: '#64748b' }} />
                  <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                    Anonymous session
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
              New Mental Health Session
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What would you like to discuss?"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>
                Initial Message (optional)
              </label>
              <textarea
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Share what's on your mind..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ color: '#475569' }}>Keep this session anonymous</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createSession.isPending}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: createSession.isPending ? 'not-allowed' : 'pointer',
                  opacity: createSession.isPending ? 0.7 : 1
                }}
              >
                {createSession.isPending ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
