/**
 * Professional Alerts & Notifications Component
 */
export function AlertsDemo() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h2 className="mb-4">
            <i className="fas fa-bell text-warning me-2"></i>System Alerts & Notifications
          </h2>

          {/* Success Alert */}
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle me-2" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <strong>Success!</strong>
                <p className="mb-0">Patient record has been saved successfully.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>

          {/* Info Alert */}
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i
                className="fas fa-info-circle me-2"
                style={{ fontSize: '1.5rem' }}
              ></i>
              <div>
                <strong>Information</strong>
                <p className="mb-0">Your system maintenance is scheduled for tonight at 11 PM.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>

          {/* Warning Alert */}
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i
                className="fas fa-exclamation-triangle me-2"
                style={{ fontSize: '1.5rem' }}
              ></i>
              <div>
                <strong>Warning</strong>
                <p className="mb-0">Prescription for patient John Doe is about to expire.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>

          {/* Danger Alert */}
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <div className="d-flex align-items-center">
              <i className="fas fa-times-circle me-2" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <strong>Error</strong>
                <p className="mb-0">Failed to connect to lab results database. Please retry.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>

          {/* Toast Notifications */}
          <div className="mt-5 mb-4">
            <h4>
              <i className="fas fa-comment me-2"></i>Toast Notifications
            </h4>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-primary"
                onClick={() => alert('Toast notification demo')}
              >
                <i className="fas fa-bell me-2"></i>Show Notification
              </button>
              <button
                className="btn btn-success"
                onClick={() => alert('Patient appointment confirmed!')}
              >
                <i className="fas fa-calendar-check me-2"></i>Appointment Alert
              </button>
              <button
                className="btn btn-warning"
                onClick={() => alert('Lab results are ready for review')}
              >
                <i className="fas fa-flask-vial me-2"></i>Lab Results
              </button>
            </div>
          </div>

          {/* Notification Card */}
          <div className="card border-start-4 border-primary shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle p-3"
                  style={{ minWidth: '50px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="fas fa-stethoscope text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1">New Consultation Request</h5>
                  <p className="text-muted mb-2">Dr. Sarah has requested your availability for a consultation review.</p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary">
                      <i className="fas fa-check me-1"></i>Accept
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      <i className="fas fa-times me-1"></i>Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .alert {
          border: none;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .alert-success {
          background-color: rgba(25, 135, 84, 0.1);
          border-left: 4px solid #198754;
        }

        .alert-info {
          background-color: rgba(13, 110, 253, 0.1);
          border-left: 4px solid #0d6efd;
        }

        .alert-warning {
          background-color: rgba(255, 193, 7, 0.1);
          border-left: 4px solid #ffc107;
        }

        .alert-danger {
          background-color: rgba(220, 53, 69, 0.1);
          border-left: 4px solid #dc3545;
        }

        .border-start-4 {
          border-left-width: 4px !important;
        }
      `}</style>
    </div>
  );
}
