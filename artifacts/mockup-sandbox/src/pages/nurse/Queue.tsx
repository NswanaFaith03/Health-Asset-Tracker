import { useState } from 'react';
import { useCreateConsultation } from '@/lib/api-client';
import { UserPlus, Users, AlertCircle, Search } from 'lucide-react';

export default function NurseQueue() {
  const [studentNumber, setStudentNumber] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('medium');
  
  const createConsultation = useCreateConsultation();

  const handleAddToQueue = () => {
    if (!studentNumber.trim() || !symptoms.trim()) {
      alert('Please fill in all fields: student number and symptoms');
      return;
    }
    
    console.log('Attempting to add student to queue:', {
      studentNumber,
      symptoms,
      severity
    });
    
    // Create a consultation with the student number (backend will find the student)
    createConsultation.mutate(
      { data: { symptoms, severity, studentNumber } as any },
      {
        onSuccess: (consultation) => {
          console.log('Consultation created successfully:', consultation);
          
          // Backend now handles queue assignment and notifications automatically
          setStudentNumber('');
          setSymptoms('');
          setSeverity('medium');
          alert('Student added to queue successfully! They will receive a notification in their account.');
        },
        onError: (error: any) => {
          console.error('Consultation creation error:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
          alert(`Failed to add student to queue: ${errorMessage}. Please try again.`);
        }
      }
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Queue Management
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Add students to the consultation queue by entering their information manually
        </p>
      </div>

      {/* Backend deployment notice */}
      <div style={{
        background: '#dbeafe',
        border: '1px solid #60a5fa',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        <AlertCircle size={20} style={{ color: '#2563eb' }} />
        <span style={{ color: '#1e40af', fontSize: '0.875rem' }}>
          <strong>Backend Update Required:</strong> Deploy the updated backend code to enable student notifications.
        </span>
      </div>

      {/* Student Information Form */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Student Information
          </h2>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#1e293b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Student Number *
          </label>
          <input
            type="text"
            placeholder="Enter student number (e.g., 2023001)"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '0.875rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          />
        </div>



        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#1e293b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Symptoms *
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe the patient's symptoms..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#1e293b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          onClick={handleAddToQueue}
          disabled={createConsultation.isPending}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: createConsultation.isPending ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: createConsultation.isPending ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          <UserPlus size={18} />
          {createConsultation.isPending ? 'Adding to Queue...' : 'Add to Queue'}
        </button>
      </div>

      {/* Info Section */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Users size={24} style={{ color: '#16a34a' }} />
        <div>
          <div style={{ color: '#166534', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Queue Information
          </div>
          <div style={{ color: '#15803d', fontSize: '0.875rem' }}>
            Students added to the queue will receive automatic notifications and can view their position in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}