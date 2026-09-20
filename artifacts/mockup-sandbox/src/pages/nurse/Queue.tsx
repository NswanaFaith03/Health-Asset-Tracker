import { useState } from 'react';
import { useCreateConsultation, useListUsers, getListUsersQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users, Search, CheckCircle } from 'lucide-react';

export default function NurseQueue() {
  const queryClient = useQueryClient();
  const [studentNumber, setStudentNumber] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const { data: students = [], isLoading: studentsLoading } = useListUsers(
    { role: 'student', search: studentNumber },
    { query: { queryKey: getListUsersQueryKey({ role: 'student', search: studentNumber }) } }
  );
  
  const createConsultation = useCreateConsultation();

  const handleAddToQueue = () => {
    if (!selectedStudent || !symptoms.trim()) {
      alert('Please select a student and describe symptoms');
      return;
    }
    
    createConsultation.mutate(
      { data: { symptoms, severity, studentNumber: selectedStudent.studentNumber } as any },
      {
        onSuccess: (consultation) => {
          setSelectedStudent(null);
          setStudentNumber('');
          setSymptoms('');
          setSeverity('medium');
          alert('Student added to queue successfully!');
        },
        onError: (error: any) => {
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
          Search students by student number and add them to the consultation queue
        </p>
      </div>

      {/* Student Search */}
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
            Search Student
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

        {/* Search Results */}
        {studentNumber && students.length > 0 && (
          <div style={{
            marginTop: '1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Found {students.length} student(s)
            </div>
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                style={{
                  padding: '0.75rem',
                  margin: '0.25rem 0',
                  background: selectedStudent?.id === student.id ? '#10b981' : '#ffffff',
                  color: selectedStudent?.id === student.id ? 'white' : '#1e293b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <CheckCircle size={16} />
                <div>
                  <div style={{ fontWeight: '600' }}>{student.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{student.studentNumber}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {studentNumber && students.length === 0 && !studentsLoading && (
          <div style={{
            marginTop: '1rem',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '8px',
            padding: '0.75rem',
            color: '#991b1b',
            fontSize: '0.875rem'
          }}>
            No students found with that student number
          </div>
        )}
      </div>

      {/* Consultation Form - Only show when student is selected */}
      {selectedStudent && (
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
              Consultation Details
            </h2>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Student: {selectedStudent.name} ({selectedStudent.studentNumber})
            </div>
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
      )}



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
      )}

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
            Search students by student number and add them to the consultation queue.
          </div>
        </div>
      </div>
    </div>
  );
}