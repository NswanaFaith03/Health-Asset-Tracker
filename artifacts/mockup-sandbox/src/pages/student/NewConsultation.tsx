import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Send } from 'lucide-react';
import { useCreateConsultation } from '@workspace/api-client-react';

export default function NewConsultation() {
  const navigate = useNavigate();
  const { mutate: createConsultation, isPending } = useCreateConsultation();
  
  const [formData, setFormData] = useState({
    symptoms: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createConsultation(
      {
        symptoms: formData.symptoms,
        severity: formData.severity,
        description: formData.description,
      },
      {
        onSuccess: () => {
          navigate('/student/consultations');
        },
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
              Symptoms *
            </label>
            <input
              type="text"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="e.g., Headache, fever, stomach pain"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = '#10b981';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = '#e2e8f0';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              Severity Level *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
                <button
                  key={severity}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity })}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: formData.severity === severity 
                      ? `${severity === 'low' ? '#10b981' : severity === 'medium' ? '#f59e0b' : severity === 'high' ? '#f97316' : '#ef4444'}20`
                      : '#ffffff',
                    borderColor: formData.severity === severity
                      ? severity === 'low' ? '#10b981' : severity === 'medium' ? '#f59e0b' : severity === 'high' ? '#f97316' : '#ef4444'
                      : '#e2e8f0',
                    color: formData.severity === severity
                      ? severity === 'low' ? '#10b981' : severity === 'medium' ? '#f59e0b' : severity === 'high' ? '#f97316' : '#ef4444'
                      : '#64748b',
                    minHeight: '44px',
                  }}
                  onMouseEnter={e => {
                    if (formData.severity !== severity) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#10b981';
                      (e.currentTarget as HTMLElement).style.color = '#10b981';
                    }
                  }}
                  onMouseLeave={e => {
                    if (formData.severity !== severity) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                      (e.currentTarget as HTMLElement).style.color = '#64748b';
                    }
                  }}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              Detailed Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide more details about your symptoms, when they started, and any other relevant information..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box',
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/student/consultations')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
                minWidth: '120px',
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isPending ? 0.7 : 1,
                flex: 1,
                minWidth: '120px',
                justifyContent: 'center',
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
                  <Send style={{ width: '1rem', height: '1rem' }} />
                  Submit Consultation
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}