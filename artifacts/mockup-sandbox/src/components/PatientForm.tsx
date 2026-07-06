/**
 * Professional Form Component with Bootstrap Styling
 */
export function PatientForm() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white py-4">
              <h3 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>Register New Patient
              </h3>
            </div>
            <div className="card-body p-4">
              <form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">
                      <i className="fas fa-user me-1"></i>First Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="firstName"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">
                      <i className="fas fa-user me-1"></i>Last Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="lastName"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-1"></i>Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    placeholder="patient@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    <i className="fas fa-phone me-1"></i>Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-lg"
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="dob" className="form-label">
                      <i className="fas fa-calendar me-1"></i>Date of Birth
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      id="dob"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">
                      <i className="fas fa-venus-mars me-1"></i>Gender
                    </label>
                    <select className="form-select form-select-lg" id="gender">
                      <option>Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="bloodType" className="form-label">
                    <i className="fas fa-droplet me-1"></i>Blood Type
                  </label>
                  <select className="form-select form-select-lg" id="bloodType">
                    <option>Select blood type</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="medicalHistory" className="form-label">
                    <i className="fas fa-file-medical me-1"></i>Medical History
                  </label>
                  <textarea
                    className="form-control"
                    id="medicalHistory"
                    rows={4}
                    placeholder="Enter any relevant medical history..."
                  ></textarea>
                </div>

                <div className="mb-4 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the terms and conditions
                  </label>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="reset" className="btn btn-outline-secondary btn-lg">
                    <i className="fas fa-redo me-2"></i>Clear
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg">
                    <i className="fas fa-check me-2"></i>Register Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .form-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .btn-lg {
          border-radius: 8px;
          font-weight: 600;
          padding: 0.75rem 2rem;
        }

        .btn-primary:hover {
          background-color: #5568d3;
          border-color: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
}
