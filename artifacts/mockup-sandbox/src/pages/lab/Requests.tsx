import { useState } from 'react';
import { Thermometer, Play, Search, Check } from 'lucide-react';

interface LabRequest {
  id: number;
  patientName: string;
  patientNumber: string;
  testType: string;
  notes?: string;
  requestedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function LabRequests() {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([
    {
      id: 1,
      patientName: 'John Banda',
      patientNumber: 'STU001',
      testType: 'Complete Blood Count',
      notes: 'Patient showing fatigue symptoms',
      requestedBy: 'Dr. Smith',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      patientName: 'Mary Phiri',
      patientNumber: 'STU002',
      testType: 'Malaria Smear',
      notes: 'Suspected malaria infection',
      requestedBy: 'Dr. Johnson',
      status: 'in_progress',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      patientName: 'Joseph Mwamba',
      patientNumber: 'STU003',
      testType: 'Urinalysis',
      requestedBy: 'Dr. Smith',
      status: 'pending',
      createdAt: '2024-01-15T08:45:00Z'
    }
  ]);

  const handleStart = (id: number) => {
    setLabRequests(labRequests.map(req => 
      req.id === id ? { ...req, status: 'in_progress' as const } : req
    ));
  };

  const handleComplete = (id: number) => {
    setLabRequests(labRequests.map(req => 
      req.id === id ? { ...req, status: 'completed' as const } : req
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'hsl(45, 93%, 47%)';
      case 'in_progress': return 'hsl(217, 91%, 60%)';
      case 'completed': return 'hsl(142, 76%, 36%)';
      case 'cancelled': return 'hsl(0, 72%, 51%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Lab Requests
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Process laboratory test requests
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
          placeholder="Search requests..."
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

      {/* Lab Requests List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {labRequests.map((request) => (
          <div
            key={request.id}
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
                  {request.patientName}
                </h3>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {request.patientNumber}
              </p>
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>
                {request.testType}
              </p>
              {request.notes && (
                <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                  {request.notes}
                </p>
              )}
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                Requested by: {request.requestedBy}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: getStatusColor(request.status),
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                {request.status.replace('_', ' ').toUpperCase()}
              </div>
              
              {request.status === 'pending' && (
                <button
                  onClick={() => handleStart(request.id)}
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
                  Start
                </button>
              )}
              
              {request.status === 'in_progress' && (
                <button
                  onClick={() => handleComplete(request.id)}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
