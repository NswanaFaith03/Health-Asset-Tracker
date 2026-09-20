import { useState } from 'react';
import { useListLabRequests, useListConsultations, getListLabRequestsQueryKey, getListConsultationsQueryKey } from '@/lib/api-client';
import { FileText, Download, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function StudentMedicalReport() {
  const { data: labRequests = [], isLoading: labsLoading } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });
  const { data: consultations = [], isLoading: consultsLoading } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() }
  });

  const completedLabs = labRequests.filter(r => r.status === 'completed');
  const completedConsults = consultations.filter(c => c.status === 'responded' || c.status === 'closed');

  const allCompleted = completedLabs.length > 0 && completedConsults.length > 0;
  const canGenerateReport = allCompleted;

  if (labsLoading || consultsLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading medical data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Medical Report
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Generate and download your comprehensive medical report
        </p>
      </div>

      {/* Status Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <FileText size={20} style={{ color: '#10b981' }} />
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Lab Tests</div>
          </div>
          <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>
            {completedLabs.length} / {labRequests.length}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Completed
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={20} style={{ color: '#3b82f6' }} />
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Consultations</div>
          </div>
          <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>
            {completedConsults.length} / {consultations.length}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Completed
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {canGenerateReport ? (
              <CheckCircle size={20} style={{ color: '#10b981' }} />
            ) : (
              <Clock size={20} style={{ color: '#f59e0b' }} />
            )}
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Report Status</div>
          </div>
          <div style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>
            {canGenerateReport ? 'Ready' : 'Pending'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {canGenerateReport ? 'Available' : 'Awaiting completion'}
          </div>
        </div>
      </div>

      {/* Generate Report Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: canGenerateReport ? '#f0fdf4' : '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {canGenerateReport ? (
              <CheckCircle size={24} style={{ color: '#10b981' }} />
            ) : (
              <AlertCircle size={24} style={{ color: '#f59e0b' }} />
            )}
          </div>
          <div>
            <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {canGenerateReport ? 'Medical Report Ready' : 'Medical Report Pending'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              {canGenerateReport 
                ? 'All your consultations and lab tests are complete. You can now generate your medical report.'
                : 'Complete all consultations and lab tests to generate your medical report.'}
            </p>
          </div>
        </div>

        {canGenerateReport ? (
          <button
            onClick={() => alert('Medical report generation will be implemented with PDF generation and UNZA logo.')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              background: '#10b981',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={20} />
            Generate Medical Report
          </button>
        ) : (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={16} style={{ color: '#f59e0b' }} />
              <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>
                Pending Items
              </span>
            </div>
            <ul style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, paddingLeft: '1.5rem' }}>
              {labRequests.filter(r => r.status !== 'completed').length > 0 && (
                <li>{labRequests.filter(r => r.status !== 'completed').length} lab test(s) in progress</li>
              )}
              {consultations.filter(c => c.status !== 'responded' && c.status !== 'closed').length > 0 && (
                <li>{consultations.filter(c => c.status !== 'responded' && c.status !== 'closed').length} consultation(s) in progress</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Completed Items Preview */}
      {canGenerateReport && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#1e293b', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Report Contents
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Completed Lab Tests
            </div>
            {completedLabs.map((lab) => (
              <div key={lab.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: '#f8fafc',
                borderRadius: '6px',
                marginBottom: '0.5rem'
              }}>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
                <span style={{ color: '#1e293b', fontSize: '0.875rem' }}>{lab.testType}</span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 'auto' }}>
                  {new Date(lab.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Completed Consultations
            </div>
            {completedConsults.map((consult) => (
              <div key={consult.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: '#f8fafc',
                borderRadius: '6px',
                marginBottom: '0.5rem'
              }}>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
                <span style={{ color: '#1e293b', fontSize: '0.875rem' }}>{consult.symptoms?.substring(0, 50)}...</span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 'auto' }}>
                  {new Date(consult.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}