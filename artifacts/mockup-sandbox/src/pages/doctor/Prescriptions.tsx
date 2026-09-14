import { useState } from 'react';
import { Clipboard, Plus, Search } from 'lucide-react';

interface Prescription {
  id: number;
  patientName: string;
  patientNumber: string;
  medication: string;
  dosage: string;
  instructions: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  createdAt: string;
}

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 1,
      patientName: 'John Banda',
      patientNumber: 'STU001',
      medication: 'Paracetamol 500mg',
      dosage: '1 tablet every 6 hours',
      instructions: 'Take with food',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      patientName: 'Mary Phiri',
      patientNumber: 'STU002',
      medication: 'Amoxicillin 250mg',
      dosage: '1 capsule every 8 hours',
      instructions: 'Complete full course',
      status: 'dispensed',
      createdAt: '2024-01-14T15:20:00Z'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'hsl(45, 93%, 47%)';
      case 'dispensed': return 'hsl(142, 76%, 36%)';
      case 'cancelled': return 'hsl(0, 72%, 51%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Prescriptions
          </h1>
          <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
            Manage patient prescriptions
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
          New Prescription
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
          placeholder="Search prescriptions..."
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

      {/* Prescriptions List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
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
                  {prescription.patientName}
                </h3>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {prescription.patientNumber}
              </p>
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>
                {prescription.medication} - {prescription.dosage}
              </p>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {prescription.instructions}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: getStatusColor(prescription.status),
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'inline-block'
              }}>
                {prescription.status.toUpperCase()}
              </div>
              <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>
                {new Date(prescription.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
