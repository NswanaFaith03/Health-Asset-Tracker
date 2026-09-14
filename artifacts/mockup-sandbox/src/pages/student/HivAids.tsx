import { useState } from 'react';
import { useListHivSupportSessions, useListHivResources, useCreateHivSupportSession, getListHivSupportSessionsQueryKey, getListHivResourcesQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Heart, BookOpen } from 'lucide-react';

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

export default function StudentHivAids() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [activeTab, setActiveTab] = useState<'sessions' | 'resources'>('sessions');

  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useListHivSupportSessions({
    query: { queryKey: getListHivSupportSessionsQueryKey() }
  });
  const { data: resources, isLoading: resourcesLoading, refetch: refetchResources } = useListHivResources({
    query: { queryKey: getListHivResourcesQueryKey() }
  });
  const createSession = useCreateHivSupportSession();

  const handleCreate = () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }
    createSession.mutate(
      { data: { topic: topic.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHivSupportSessionsQueryKey() });
          setShowModal(false);
          setTopic('');
        },
        onError: () => alert('Failed to submit request')
      }
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundImage: "url('/images/zambia_graduate_nurses.jpg')",
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
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(251, 146, 60, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', margin: 0 }}>
                HIV/AIDS Centre
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>Confidential support & resources</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'white',
                color: '#f97316',
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
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sessions' ? '2px solid #f97316' : '2px solid transparent',
            fontSize: '1rem',
            fontWeight: '600',
            color: activeTab === 'sessions' ? '#f97316' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Support Sessions
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'resources' ? '2px solid #f97316' : '2px solid transparent',
            fontSize: '1rem',
            fontWeight: '600',
            color: activeTab === 'resources' ? '#f97316' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Resources
        </button>
      </div>

      {activeTab === 'sessions' ? (
        sessionsLoading ? (
          <div style={{ color: '#64748b' }}>Loading sessions...</div>
        ) : !sessions || sessions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <Heart style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              No support sessions yet
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Request confidential HIV/AIDS support
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
              }}
            >
              Request Support
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {sessions.map((session: any) => (
              <div
                key={session.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
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
              </div>
            ))}
          </div>
        )
      ) : (
        resourcesLoading ? (
          <div style={{ color: '#64748b' }}>Loading resources...</div>
        ) : !resources || resources.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <BookOpen style={{ width: '3rem', height: '3rem', color: '#94a3b8' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              No resources available
            </h2>
            <p style={{ color: '#64748b' }}>
              HIV/AIDS resources will be added here
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {resources.map((resource: any) => (
              <div
                key={resource.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  {resource.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                  {resource.description}
                </div>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: '#f97316',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    View Resource
                  </a>
                )}
              </div>
            ))}
          </div>
        )
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
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
              New Support Request
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
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
                  background: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: createSession.isPending ? 'not-allowed' : 'pointer',
                  opacity: createSession.isPending ? 0.7 : 1
                }}
              >
                {createSession.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
