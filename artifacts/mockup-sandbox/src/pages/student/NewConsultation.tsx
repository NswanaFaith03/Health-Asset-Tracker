import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useCreateConsultation, getListConsultationsQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

const SEVERITIES = [
  { key: 'low', label: 'Low', color: '#10b981', desc: 'Minor symptoms' },
  { key: 'medium', label: 'Medium', color: '#f59e0b', desc: 'Moderate discomfort' },
  { key: 'high', label: 'High', color: '#f97316', desc: 'Significant concern' },
  { key: 'critical', label: 'Critical', color: '#ef4444', desc: 'Urgent care needed' },
];

export default function NewConsultation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createConsultation, isPending } = useCreateConsultation();
  
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('low');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      alert('Please describe your symptoms');
      return;
    }
    
    createConsultation(
      { symptoms: symptoms.trim(), severity } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          alert('Your consultation has been submitted successfully.');
          navigate('/student/consultations');
        },
        onError: (error) => {
          console.error('Failed to create consultation:', error);
          alert('Failed to submit consultation. Please try again.');
        }
      }
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }} className="new-consultation-container">
      <button
        onClick={() => navigate('/student/consultations')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          color: '#64748b',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#10b981';
          (e.currentTarget as HTMLElement).style.color = '#10b981';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
          (e.currentTarget as HTMLElement).style.color = '#64748b';
        }}
      >
        <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
        Back to Consultations
      </button>

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', margin: 0, marginBottom: '0.5rem' }}>
            New Consultation
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Describe your symptoms and get medical help from qualified doctors
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              Describe your symptoms *
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe what you are experiencing..."
              rows={6}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                color: '#1e293b',
                background: '#ffffff',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box',
                minHeight: '120px',
              }}
              onFocus={e => {
                (e.target as HTMLTextAreaElement).style.borderColor = '#10b981';
                (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={e => {
                (e.target as HTMLTextAreaElement).style.borderColor = '#e2e8f0';
                (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              Severity level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {SEVERITIES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeverity(s.key)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: severity === s.key 
                      ? `${s.color}15`
                      : '#ffffff',
                    borderColor: severity === s.key
                      ? s.color
                      : '#e2e8f0',
                    minHeight: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={e => {
                    if (severity !== s.key) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#10b981';
                    }
                  }}
                  onMouseLeave={e => {
                    if (severity !== s.key) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: s.color,
                    flexShrink: 0
                  }} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ 
                      color: severity === s.key ? s.color : '#1e293b',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      marginBottom: '2px'
                    }}>
                      {s.label}
                    </div>
                    <div style={{ 
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}>
                      {s.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isPending ? 0.7 : 1,
              height: '52px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={e => {
              if (!isPending) {
                (e.currentTarget as HTMLElement).style.background = '#059669';
              }
            }}
            onMouseLeave={e => {
              if (!isPending) {
                (e.currentTarget as HTMLElement).style.background = '#10b981';
              }
            }}
          >
            {isPending ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }} />
                Submitting...
              </>
            ) : (
              <>
                <Send style={{ width: '1.125rem', height: '1.125rem' }} />
                Submit Consultation
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        textarea::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}