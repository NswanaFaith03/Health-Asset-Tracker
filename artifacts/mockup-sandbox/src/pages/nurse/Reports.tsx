import { useState } from 'react';
import { useListLabRequests, useListConsultations, getListLabRequestsQueryKey, getListConsultationsQueryKey } from '@/lib/api-client';
import { FileText, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function NurseReports() {
  const [studentNumber, setStudentNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: labRequests = [], isLoading: labsLoading } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });
  
  const { data: consultations = [], isLoading: consultsLoading } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() }
  });

  const generateReport = () => {
    if (!studentNumber.trim()) {
      alert('Please enter a student number');
      return;
    }

    // Find student by filtering consultations and lab requests
    const studentConsults = consultations.filter(c => 
      c.student?.studentNumber === studentNumber && 
      (c.status === 'responded' || c.status === 'closed')
    );
    
    const studentLabs = labRequests.filter(r => 
      r.patient?.studentNumber === studentNumber && 
      r.status === 'completed'
    );
    
    if (studentLabs.length === 0 && studentConsults.length === 0) {
      alert('This student has no completed consultations or lab tests.');
      return;
    }

    setIsGenerating(true);

    // Get student info from first available record
    const studentInfo = studentConsults[0]?.student || studentLabs[0]?.patient;
    if (!studentInfo) {
      alert('Student information not found. Please ensure the student number is correct.');
      setIsGenerating(false);
      return;
    }

    // Create a styled HTML report with UNZA branding
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Report - ${studentInfo.name}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 2cm;
          }
          .header {
            text-align: center;
            margin-bottom: 2cm;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 1cm;
          }
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1cm;
            margin-bottom: 1cm;
          }
          .logo-placeholder {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
            border: 3px solid #1e40af;
          }
          .institution-name {
            font-size: 24pt;
            font-weight: bold;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .report-title {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
            text-align: center;
            margin-bottom: 1cm;
            text-transform: uppercase;
          }
          .student-info {
            background: #f8fafc;
            border: 2px solid #1e40af;
            border-radius: 8px;
            padding: 1cm;
            margin-bottom: 1.5cm;
          }
          .student-info-row {
            display: flex;
            margin-bottom: 0.5cm;
          }
          .student-info-label {
            font-weight: bold;
            color: #1e40af;
            width: 150px;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            margin-top: 1.5cm;
            margin-bottom: 0.5cm;
            text-transform: uppercase;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 0.25cm;
          }
          .consultation-item {
            margin-bottom: 1cm;
            padding: 1cm;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #1e40af;
            border-radius: 4px;
          }
          .lab-item {
            margin-bottom: 1cm;
            padding: 1cm;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #10b981;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            color: #374151;
          }
          .status-completed {
            color: #10b981;
            font-weight: bold;
          }
          .status-pending {
            color: #f59e0b;
            font-weight: bold;
          }
          .footer {
            margin-top: 2cm;
            padding-top: 1cm;
            border-top: 2px solid #1e40af;
            text-align: center;
            font-size: 10pt;
            color: #64748b;
          }
          .print-btn {
            position: fixed;
            top: 1cm;
            right: 1cm;
            padding: 0.5cm 1cm;
            background: #1e40af;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12pt;
            font-weight: bold;
          }
          @media print {
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
        
        <div class="header">
          <div class="logo-section">
            <div class="logo-placeholder">UNZA</div>
            <div>
              <div class="institution-name">University of Zambia</div>
              <div style="font-size: 14pt; color: #64748b;">School of Health Sciences</div>
            </div>
          </div>
          <div class="report-title">Medical Report</div>
        </div>

        <div class="student-info">
          <div class="student-info-row">
            <span class="student-info-label">Student Name:</span>
            <span>${studentInfo.name}</span>
          </div>
          <div class="student-info-row">
            <span class="student-info-label">Student Number:</span>
            <span>${studentInfo.studentNumber || 'N/A'}</span>
          </div>
          <div class="student-info-row">
            <span class="student-info-label">Report Date:</span>
            <span>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
          <div class="student-info-row">
            <span class="student-info-label">Report ID:</span>
            <span>MED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
        </div>

        ${studentConsults.length > 0 ? `
        <div class="section-title">Medical Consultations</div>
        ${studentConsults.map(c => `
          <div class="consultation-item">
            <div class="student-info-row">
              <span class="label">Date:</span>
              <span>${new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Symptoms:</span>
              <span>${c.symptoms}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Severity:</span>
              <span>${c.severity}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Diagnosis:</span>
              <span>${c.diagnosis || 'Pending'}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Doctor:</span>
              <span>${c.doctor?.name || 'N/A'}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Notes:</span>
              <span>${c.notes || 'N/A'}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Status:</span>
              <span class="status-completed">${c.status}</span>
            </div>
          </div>
        `).join('')}
        ` : ''}

        ${studentLabs.length > 0 ? `
        <div class="section-title">Laboratory Test Results</div>
        ${studentLabs.map(l => `
          <div class="lab-item">
            <div class="student-info-row">
              <span class="label">Date:</span>
              <span>${new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Test Type:</span>
              <span>${l.testType}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Requesting Doctor:</span>
              <span>${l.doctor?.name || 'N/A'}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Status:</span>
              <span class="status-completed">${l.status}</span>
            </div>
            <div class="student-info-row">
              <span class="label">Results:</span>
              <span>${l.result || 'Pending'}</span>
            </div>
          </div>
        `).join('')}
        ` : ''}

        <div class="footer">
          <p><strong>Official Medical Report</strong></p>
          <p>University of Zambia Health Center</p>
          <p>This report is confidential and intended for the named student only.</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window with the report
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(reportHTML);
      reportWindow.document.close();
      
      // Auto-trigger print dialog
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    } else {
      alert('Please allow popups to generate the report');
    }

    setIsGenerating(false);
  };

  if (labsLoading || consultsLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Medical Reports
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Generate and download medical reports for students
        </p>
      </div>

      {/* Student Search */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#1e293b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Enter Student Number
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

        <button
          onClick={generateReport}
          disabled={isGenerating}
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
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: isGenerating ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          {isGenerating ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }} />
              Generating PDF...
            </>
          ) : (
            <>
              <Printer size={18} />
              Generate Medical Report
            </>
          )}
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
        <FileText size={24} style={{ color: '#16a34a' }} />
        <div>
          <div style={{ color: '#166534', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Medical Report Generation
          </div>
          <div style={{ color: '#15803d', fontSize: '0.875rem' }}>
            Enter a student number to generate a comprehensive medical report including consultations and lab tests. Reports include UNZA branding and are downloadable as PDF.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}