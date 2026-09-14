import { useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';

interface Consultation {
  id: number;
  studentName: string;
  studentNumber: string;
  symptoms: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'assigned' | 'responded' | 'closed';
  createdAt: string;
}

export default function DoctorConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: 1,
      studentName: 'John Banda',
      studentNumber: 'STU001',
      symptoms: 'Severe headache and fever',
      severity: 'high',
      status: 'assigned',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      studentName: 'Mary Phiri',
      studentNumber: 'STU002',
      symptoms: 'Mild cough and sore throat',
      severity: 'low',
      status: 'responded',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      studentName: 'Joseph Mwamba',
      studentNumber: 'STU003',
      symptoms: 'Stomach pain and nausea',
      severity: 'medium',
      status: 'under_review',
      createdAt: '2024-01-15T08:45:00Z'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'hsl(217, 33%, 17%)';
      case 'under_review': return 'hsl(45, 93%, 47%)';
      case 'assigned': return 'hsl(217, 91%, 60%)';
      case 'responded': return 'hsl(142, 76%, 36%)';
      case 'closed': return 'hsl(215, 20%, 65%)';
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
          Consultations
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Review and respond to student consultations
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'hsl(215, 20%, 65%)'
          }} />
          <input
            type="text"
            placeholder="Search consultations..."
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
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'hsl(217, 33%, 17%)',
          border: '1px solid hsl(217, 33%, 25%)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Consultations List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {consultations.map((consultation) => (
          <div
            key={consultation.id}
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
                  {consultation.studentName}
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getSeverityColor(consultation.severity),
                  color: 'white'
                }}>
                  {consultation.severity.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {consultation.studentNumber}
              </p>
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>
                {consultation.symptoms}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: getStatusColor(consultation.status),
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                {consultation.status.replace('_', ' ').toUpperCase()}
              </div>
              <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>
                {new Date(consultation.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
