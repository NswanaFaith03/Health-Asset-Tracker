/**
 * Professional Healthcare Dashboard with CDN Images and Font Awesome Icons
 */
import { Header } from './Header';
import { DashboardCard } from './DashboardCard';

export function HealthcareDashboard() {
  // Using CDN-hosted healthcare images from Unsplash
  const healthcareImages = {
    doctor:
      'https://images.unsplash.com/photo-1631217314830-4699971b0baf?w=400&h=300&fit=crop',
    patients:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    appointments:
      'https://images.unsplash.com/photo-1631604025575-5d5d8e2d1b0f?w=400&h=300&fit=crop',
    prescriptions:
      'https://images.unsplash.com/photo-1631604025575-5d5d8e2d1b0f?w=400&h=300&fit=crop',
    labResults:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
    hivSupport:
      'https://images.unsplash.com/photo-1576091160643-112ba8d25d1d?w=400&h=300&fit=crop',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header />

      <div className="container-fluid py-4">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 bg-gradient shadow-sm">
              <div className="card-body py-5">
                <h1 className="mb-2">
                  <i className="fas fa-wave-hand text-warning me-2"></i>Welcome Back, Dr. Smith
                </h1>
                <p className="text-muted mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <DashboardCard
              title="Total Patients"
              icon="fa-users"
              value="1,234"
              subtitle="Active patients"
              color="primary"
              image={healthcareImages.patients}
            />
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <DashboardCard
              title="Today's Appointments"
              icon="fa-calendar-check"
              value="12"
              subtitle="Scheduled consultations"
              color="success"
              image={healthcareImages.appointments}
            />
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <DashboardCard
              title="Pending Lab Results"
              icon="fa-flask-vial"
              value="8"
              subtitle="Awaiting analysis"
              color="warning"
              image={healthcareImages.labResults}
            />
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <DashboardCard
              title="Prescriptions Pending"
              icon="fa-pills"
              value="23"
              subtitle="To be dispensed"
              color="danger"
              image={healthcareImages.prescriptions}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">
              <i className="fas fa-bolt text-primary me-2"></i>Quick Actions
            </h3>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <button className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3">
              <i className="fas fa-plus"></i>
              New Consultation
            </button>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <button className="btn btn-outline-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3">
              <i className="fas fa-microscope"></i>
              Order Lab Test
            </button>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <button className="btn btn-outline-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3">
              <i className="fas fa-prescription-bottle"></i>
              Write Prescription
            </button>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <button className="btn btn-outline-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 py-3">
              <i className="fas fa-heart"></i>
              HIV Support
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-history text-info me-2"></i>Recent Activities
                </h5>
              </div>
              <div className="card-body">
                <div className="activity-list">
                  {[
                    {
                      icon: 'fa-stethoscope',
                      color: 'primary',
                      title: 'Consultation Completed',
                      detail: 'Patient John Doe - 2 hours ago',
                    },
                    {
                      icon: 'fa-flask-vial',
                      color: 'warning',
                      title: 'Lab Results Received',
                      detail: 'Patient Jane Smith - 4 hours ago',
                    },
                    {
                      icon: 'fa-prescription-bottle',
                      color: 'success',
                      title: 'Prescription Issued',
                      detail: 'Patient Robert Johnson - 6 hours ago',
                    },
                  ].map((activity, idx) => (
                    <div key={idx} className="d-flex gap-3 mb-3 pb-3 border-bottom last-child:border-0">
                      <div
                        className={`text-${activity.color}`}
                        style={{ fontSize: '1.5rem', minWidth: '2rem', textAlign: 'center' }}
                      >
                        <i className={`fas ${activity.icon}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-semibold">{activity.title}</p>
                        <small className="text-muted">{activity.detail}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Healthcare Services Grid */}
        <div className="row">
          <div className="col-12 mb-3">
            <h3>
              <i className="fas fa-heartbeat text-danger me-2"></i>Healthcare Services
            </h3>
          </div>
          {[
            {
              name: 'General Consultation',
              icon: 'fa-stethoscope',
              doctors: 5,
              color: 'primary',
            },
            { name: 'Lab Services', icon: 'fa-flask-vial', doctors: 3, color: 'warning' },
            {
              name: 'Mental Health',
              icon: 'fa-brain',
              doctors: 4,
              color: 'info',
            },
            { name: 'HIV Support', icon: 'fa-ribbon', doctors: 2, color: 'danger' },
            {
              name: 'Pharmacy',
              icon: 'fa-pills',
              doctors: 6,
              color: 'success',
            },
            { name: 'Queue Management', icon: 'fa-users-line', doctors: 1, color: 'secondary' },
          ].map((service, idx) => (
            <div key={idx} className="col-lg-2 col-md-4 col-6 mb-3">
              <div className={`card border-0 bg-${service.color} bg-opacity-10 text-center p-3`}>
                <i
                  className={`fas ${service.icon} text-${service.color} mb-2`}
                  style={{ fontSize: '2.5rem' }}
                ></i>
                <h6 className="fw-bold mb-1">{service.name}</h6>
                <small className="text-muted">{service.doctors} available</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          transform: translateY(-4px);
          transition: all 0.3s ease;
        }

        .bg-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white;
        }

        .last-child\\:border-0:last-child {
          border-bottom: none !important;
        }

        .transition {
          transition: all 0.3s ease;
        }

        .object-fit-cover {
          object-fit: cover;
        }

        .activity-list > div:last-child {
          border-bottom: none !important;
        }

        .btn {
          font-weight: 600;
          border-radius: 8px;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .card {
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .navbar {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}
