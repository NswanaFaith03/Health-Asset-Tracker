/**
 * Professional Data Table Component
 */
export function PatientsTable() {
  const patients = [
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      bloodType: 'O+',
      phone: '+1 555-0001',
      email: 'john@example.com',
      status: 'Active',
      lastVisit: '2024-06-20',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      bloodType: 'A+',
      phone: '+1 555-0002',
      email: 'jane@example.com',
      status: 'Active',
      lastVisit: '2024-06-18',
    },
    {
      id: 3,
      name: 'Robert Johnson',
      age: 52,
      bloodType: 'B+',
      phone: '+1 555-0003',
      email: 'robert@example.com',
      status: 'Inactive',
      lastVisit: '2024-05-15',
    },
    {
      id: 4,
      name: 'Emily Brown',
      age: 41,
      bloodType: 'AB-',
      phone: '+1 555-0004',
      email: 'emily@example.com',
      status: 'Active',
      lastVisit: '2024-06-21',
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="fas fa-users text-primary me-2"></i>Patient Directory
            </h4>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search patients..."
              />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>
                  <i className="fas fa-user me-2"></i>Name
                </th>
                <th>
                  <i className="fas fa-birthday-cake me-2"></i>Age
                </th>
                <th>
                  <i className="fas fa-droplet me-2"></i>Blood Type
                </th>
                <th>
                  <i className="fas fa-phone me-2"></i>Contact
                </th>
                <th>
                  <i className="fas fa-clock me-2"></i>Last Visit
                </th>
                <th>
                  <i className="fas fa-info-circle me-2"></i>Status
                </th>
                <th>
                  <i className="fas fa-cog me-2"></i>Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary bg-opacity-25 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div>
                        <strong>{patient.name}</strong>
                        <br />
                        <small className="text-muted">{patient.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{patient.age}</td>
                  <td>
                    <span className="badge bg-info">
                      <i className="fas fa-droplet me-1"></i>
                      {patient.bloodType}
                    </span>
                  </td>
                  <td>
                    <a href={`tel:${patient.phone}`} className="text-decoration-none">
                      {patient.phone}
                    </a>
                  </td>
                  <td>{patient.lastVisit}</td>
                  <td>
                    <span
                      className={`badge ${
                        patient.status === 'Active'
                          ? 'bg-success'
                          : 'bg-secondary'
                      }`}
                    >
                      <i
                        className={`fas ${
                          patient.status === 'Active'
                            ? 'fa-check-circle'
                            : 'fa-times-circle'
                        } me-1`}
                      ></i>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-warning"
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-top py-3">
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mb-0">
              <li className="page-item disabled">
                <a className="page-link" href="#">
                  Previous
                </a>
              </li>
              <li className="page-item active">
                <a className="page-link" href="#">
                  1
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  2
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  3
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  Next
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <style>{`
        .table-hover tbody tr:hover {
          background-color: rgba(102, 126, 234, 0.05);
        }

        .btn-group-sm .btn {
          padding: 0.4rem 0.6rem;
          border-radius: 4px;
        }

        .badge {
          font-weight: 600;
          padding: 0.5rem 0.75rem;
        }

        .pagination .page-link {
          color: #667eea;
          border-color: #dee2e6;
          border-radius: 8px;
          margin: 0 2px;
        }

        .pagination .page-link:hover:not(.disabled) {
          color: #fff;
          background-color: #667eea;
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
}
