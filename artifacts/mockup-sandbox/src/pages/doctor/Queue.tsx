import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';

interface QueueEntry {
  id: number;
  studentName: string;
  studentNumber: string;
  queueNumber: number;
  estimatedWaitMinutes: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'skipped';
  symptoms: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function DoctorQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([
    {
      id: 1,
      studentName: 'John Banda',
      studentNumber: 'STU001',
      queueNumber: 1,
      estimatedWaitMinutes: 0,
      status: 'in_progress',
      symptoms: 'Severe headache and fever',
      severity: 'high'
    },
    {
      id: 2,
      studentName: 'Mary Phiri',
      studentNumber: 'STU002',
      queueNumber: 2,
      estimatedWaitMinutes: 15,
      status: 'waiting',
      symptoms: 'Mild cough and sore throat',
      severity: 'low'
    },
    {
      id: 3,
      studentName: 'Joseph Mwamba',
      studentNumber: 'STU003',
      queueNumber: 3,
      estimatedWaitMinutes: 30,
      status: 'waiting',
      symptoms: 'Stomach pain and nausea',
      severity: 'medium'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'hsl(45, 93%, 47%)';
      case 'waiting': return 'hsl(142, 76%, 36%)';
      case 'completed': return 'hsl(217, 33%, 17%)';
      case 'skipped': return 'hsl(0, 72%, 51%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'hsl(0, 72%, 51%)';
      case 'high': return 'hsl(28, 100%, 50%)';
      case 'medium': return 'hsl(45, 93%, 47%)';
      case 'low': return 'hsl(142, 76%, 36%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Patient Queue
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Manage your consultation queue
        </p>
      </div>

      {/* Queue Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'hsl(217, 33%, 17%)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid hsl(217, 33%, 25%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Users size={20} style={{ color: 'hsl(142, 76%, 36%)' }} />
            <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>Total in Queue</span>
          </div>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>{queue.length}</div>
        </div>

        <div style={{
          background: 'hsl(217, 33%, 17%)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid hsl(217, 33%, 25%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Clock size={20} style={{ color: 'hsl(45, 93%, 47%)' }} />
            <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>Avg Wait Time</span>
          </div>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>15m</div>
        </div>

        <div style={{
          background: 'hsl(217, 33%, 17%)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid hsl(217, 33%, 25%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={20} style={{ color: 'hsl(0, 72%, 51%)' }} />
            <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>Critical Cases</span>
          </div>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>
            {queue.filter(q => q.severity === 'critical').length}
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(217, 33%, 25%)' }}>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            Current Queue
          </h2>
        </div>

        {queue.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid hsl(217, 33%, 25%)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              background: entry.status === 'in_progress' ? 'hsl(217, 33%, 25%)' : 'transparent'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'hsl(142, 76%, 36%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white'
            }}>
              #{entry.queueNumber}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {entry.studentName}
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getSeverityColor(entry.severity),
                  color: 'white'
                }}>
                  {entry.severity.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {entry.studentNumber}
              </p>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: 0 }}>
                {entry.symptoms}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: getStatusColor(entry.status),
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                {entry.status.replace('_', ' ').toUpperCase()}
              </div>
              {entry.estimatedWaitMinutes > 0 && (
                <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>
                  ~{entry.estimatedWaitMinutes} min wait
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
