import { useState } from 'react';
import { Heart, MessageSquare, Search, Play, Check } from 'lucide-react';

interface CounselingSession {
  id: number;
  studentName: string;
  studentNumber: string;
  topic: string;
  isAnonymous: boolean;
  status: 'requested' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function CounselorSessions() {
  const [sessions, setSessions] = useState<CounselingSession[]>([
    {
      id: 1,
      studentName: 'Anonymous',
      studentNumber: 'N/A',
      topic: 'Anxiety and stress management',
      isAnonymous: true,
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      studentName: 'Mary Phiri',
      studentNumber: 'STU002',
      topic: 'Depression support',
      isAnonymous: false,
      status: 'requested',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      studentName: 'Joseph Mwamba',
      studentNumber: 'STU003',
      topic: 'Academic pressure',
      isAnonymous: false,
      status: 'completed',
      createdAt: '2024-01-14T14:00:00Z'
    }
  ]);

  const handleStart = (id: number) => {
    setSessions(sessions.map(session => 
      session.id === id ? { ...session, status: 'active' as const } : session
    ));
  };

  const handleComplete = (id: number) => {
    setSessions(sessions.map(session => 
      session.id === id ? { ...session, status: 'completed' as const } : session
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'hsl(45, 93%, 47%)';
      case 'active': return 'hsl(217, 91%, 60%)';
      case 'completed': return 'hsl(142, 76%, 36%)';
      case 'cancelled': return 'hsl(0, 72%, 51%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Counseling Sessions
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Manage mental health counseling sessions
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={20} style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'hsl(215, 20%, 65%)'
        }} />
        <input
          type="text"
          placeholder="Search sessions..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            background: 'hsl(217, 33%, 17%)',
            border: '1px solid hsl(217, 33%, 25%)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Sessions List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {sessions.map((session) => (
          <div
            key={session.id}
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid hsl(217, 33%, 25%)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {session.studentName}
                </h3>
                {session.isAnonymous && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: 'hsl(217, 33%, 25%)',
                    color: 'hsl(215, 20%, 65%)'
                  }}>
                    Anonymous
                  </span>
                )}
              </div>
              {!session.isAnonymous && (
                <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                  {session.studentNumber}
                </p>
              )}
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>
                {session.topic}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: getStatusColor(session.status),
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                {session.status.toUpperCase()}
              </div>
              
              {session.status === 'requested' && (
                <button
                  onClick={() => handleStart(session.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'hsl(217, 91%, 60%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  <Play size={16} />
                  Start Session
                </button>
              )}
              
              {session.status === 'active' && (
                <button
                  onClick={() => handleComplete(session.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'hsl(142, 76%, 36%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  <Check size={16} />
                  Complete
                </button>
              )}
              
              {session.status === 'active' && (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'hsl(217, 33%, 25%)',
                  border: '1px solid hsl(217, 33%, 25%)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  <MessageSquare size={16} />
                  Chat
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
