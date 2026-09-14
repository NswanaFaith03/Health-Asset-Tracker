import { useState } from 'react';
import { Thermometer, Plus, Search } from 'lucide-react';

interface LabRequest {
  id: number;
  patientName: string;
  patientNumber: string;
  testType: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function DoctorLabRequests() {
  const [labRequests, setLabRequests] = useState<LabRequest[]>([
    {
      id: 1,
      patientName: 'John Banda',
      patientNumber: 'STU001',
      testType: 'Complete Blood Count',
      notes: 'Patient showing fatigue symptoms',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      patientName: 'Mary Phiri',
      patientNumber: 'STU002',
      testType: 'Malaria Smear',
      notes: 'Suspected malaria infection',
      status: 'in_progress',
      createdAt: '2024-01-14T15:20:00Z'
    },
    {
      id: 3,
      patientName: 'Joseph Mwamba',
      patientNumber: 'STU003',
      testType: 'Urinalysis',
      status: 'completed',
      createdAt: '2024-01-13T09:10:00Z'
    }
  ]);

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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Lab Requests
          </h1>
          <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
            Request and track laboratory tests
          </p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'hsl(142, 76%, 36%)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Plus size={16} />
          New Lab Request
        </button>
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
          placeholder="Search lab requests..."
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
            </div>

            <div style={{ textAlign: 'right' }}>
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
              <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
