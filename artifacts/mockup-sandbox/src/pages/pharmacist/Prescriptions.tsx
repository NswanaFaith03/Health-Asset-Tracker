import { useState } from 'react';
import { Package, Check, X, Search } from 'lucide-react';

interface Prescription {
  id: number;
  patientName: string;
  patientNumber: string;
  medication: string;
  dosage: string;
  instructions: string;
  duration?: string;
  prescribedBy: string;
  createdAt: string;
}

export default function PharmacistPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 1,
      patientName: 'John Banda',
      patientNumber: 'STU001',
      medication: 'Paracetamol 500mg',
      dosage: '1 tablet every 6 hours',
      instructions: 'Take with food',
      duration: '3 days',
      prescribedBy: 'Dr. Smith',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      patientName: 'Mary Phiri',
      patientNumber: 'STU002',
      medication: 'Amoxicillin 250mg',
      dosage: '1 capsule every 8 hours',
      instructions: 'Complete full course',
      duration: '7 days',
      prescribedBy: 'Dr. Johnson',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      patientName: 'Joseph Mwamba',
      patientNumber: 'STU003',
      medication: 'Ibuprofen 400mg',
      dosage: '1 tablet every 8 hours as needed',
      instructions: 'Take with food',
      duration: '5 days',
      prescribedBy: 'Dr. Smith',
      createdAt: '2024-01-15T08:45:00Z'
    }
  ]);

  const handleDispense = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleReject = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Pending Prescriptions
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Review and dispense prescriptions
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
              {prescription.duration && (
                <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: 0 }}>
                  Duration: {prescription.duration}
                </p>
              )}
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                Prescribed by: {prescription.prescribedBy}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleDispense(prescription.id)}
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
                Dispense
              </button>
              <button
                onClick={() => handleReject(prescription.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'hsl(0, 72%, 51%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <X size={16} />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
