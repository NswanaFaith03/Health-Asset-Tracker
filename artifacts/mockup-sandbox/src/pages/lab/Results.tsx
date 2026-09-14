import { useState } from 'react';
import { FileText, Upload, Search, Filter } from 'lucide-react';

interface LabResult {
  id: number;
  patientName: string;
  patientNumber: string;
  testType: string;
  results: string;
  attachment?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export default function LabResults() {
  const [labResults, setLabResults] = useState<LabResult[]>([
    {
      id: 1,
      patientName: 'John Banda',
      patientNumber: 'STU001',
      testType: 'Complete Blood Count',
      results: 'Normal ranges: RBC 4.5-5.5, WBC 4-10, Platelets 150-400',
      uploadedAt: '2024-01-15T12:00:00Z',
      uploadedBy: 'Lab Tech. Mwamba'
    },
    {
      id: 2,
      patientName: 'Mary Phiri',
      patientNumber: 'STU002',
      testType: 'Malaria Smear',
      results: 'Positive for Plasmodium falciparum',
      uploadedAt: '2024-01-14T16:30:00Z',
      uploadedBy: 'Lab Tech. Mwamba'
    },
    {
      id: 3,
      patientName: 'Joseph Mwamba',
      patientNumber: 'STU003',
      testType: 'Urinalysis',
      results: 'Normal: Clear appearance, pH 6.0, no protein, no glucose',
      uploadedAt: '2024-01-13T14:00:00Z',
      uploadedBy: 'Lab Tech. Mwamba'
    }
  ]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Lab Results
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          View and manage test results
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
            placeholder="Search results..."
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
          <Upload size={16} />
          Upload Result
        </button>
      </div>

      {/* Lab Results List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {labResults.map((result) => (
          <div
            key={result.id}
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
                  {result.patientName}
                </h3>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {result.patientNumber}
              </p>
              <p style={{ color: 'white', fontSize: '0.875rem', margin: 0 }}>
                {result.testType}
              </p>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {result.results}
              </p>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                Uploaded by: {result.uploadedBy}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {new Date(result.uploadedAt).toLocaleDateString()}
              </div>
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
                <FileText size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
