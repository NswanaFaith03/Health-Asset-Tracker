import { useState } from 'react';
import { useRegister, type RegisterRequest } from "@/lib/api-client";
import { Header } from './Header';
import { User, Phone, Check, Mail, Calendar, GraduationCap, Home, Smartphone, Loader2, CheckCircle2, LucideIcon } from 'lucide-react';

const getStepIcon = (step: number): LucideIcon => {
  switch (step) {
    case 1: return User;
    case 2: return Phone;
    case 3: return Check;
    default: return User;
  }
};

export function PatientForm({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [step, setStep] = useState(1);
  const [registerRequest, setRegisterRequest] = useState<RegisterRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student'
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: register, isLoading: isRegistering } = useRegister();

  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setRegisterRequest(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerRequest.name || !registerRequest.email || !registerRequest.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    register(registerRequest, {
      onSuccess: () => {
        setLoading(false);
        setDone(true);
        setTimeout(() => {
          setDone(false);
          setStep(1);
          setRegisterRequest({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'student'
          });
        }, 2000);
      },
      onError: () => {
        setLoading(false);
        setError('Registration failed. Please try again.');
      }
    });
  };

  const steps = ['Personal Info', 'Contact Details', 'Confirmation'];

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 5%)' }}>
      <Header activePage="form" onNavigate={onNavigate} />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(52,211,153,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
            Patient Registration
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0, color: '#e2faf2' }}>
            Register New Patient
          </h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => !done && setStep(i + 1)}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  background: step > i + 1 ? 'linear-gradient(135deg,#10b981,#34d399)' : step === i + 1 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                  color: step > i + 1 ? '#0a1a12' : step === i + 1 ? '#34d399' : 'rgba(160,180,195,0.4)',
                  border: `2px solid ${step > i + 1 ? '#10b981' : step === i + 1 ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: step === i + 1 ? '0 0 14px rgba(16,185,129,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {step > i + 1 ? <Check style={{ width: 16, height: 16 }} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  color: step === i + 1 ? '#34d399' : step > i + 1 ? 'rgba(52,211,153,0.6)' : 'rgba(160,180,195,0.4)',
                }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 1, margin: '0 12px',
                  background: step > i + 1 ? 'linear-gradient(90deg,rgba(16,185,129,0.6),rgba(16,185,129,0.3))' : 'rgba(255,255,255,0.06)',
                  transition: 'all 0.5s ease',
                }} />
              )}
          ))}
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}>
          {done ? (
            <div style={{ padding: '64px 48px', textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                background: 'linear-gradient(135deg,#10b981,#34d399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(16,185,129,0.5)',
              }}>
                <CheckCircle2 style={{ width: 40, height: 40, color: '#ffffff' }} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#e2faf2', marginBottom: 12 }}>Patient Registered Successfully!</h2>
              <p style={{ color: 'rgba(160,180,195,0.7)', marginBottom: 24 }}>
                The patient record has been successfully created in the system.
              </p>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button className="btn-primary-dh" onClick={() => {
                  setDone(false);
                  setStep(1);
                  setRegisterRequest({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'student'
                  });
                }}>
                  Register Another Patient
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Section header stripe */}
              <div style={{
                padding: '20px 32px',
                background: 'linear-gradient(90deg, rgba(16,185,129,0.08), transparent)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {(() => {
                  const StepIcon = getStepIcon(step);
                  return <StepIcon style={{ width: 18, height: 18, color: '#34d399' }} />;
                })()}
                <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(220,235,230,0.9)' }}>
                  {steps[step - 1]}
                </span>
              </div>

              <div style={{ padding: '32px 32px 24px' }}>
                {step === 1 && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                      <Field label="First Name" icon={<User style={{ width: 16, height: 16 }} />} placeholder="Enter first name" />
                      <Field label="Last Name" icon={<User style={{ width: 16, height: 16 }} />} placeholder="Enter last name" />
                    </div>
                    <Field label="Full Name" icon={<User style={{ width: 16, height: 16 }} />} placeholder="Enter full name" />
                    <Field label="Email Address" icon={<Mail style={{ width: 16, height: 16 }} />} type="email" placeholder="Enter email address" />
                    <Field label="Phone Number" icon={<Phone style={{ width: 16, height: 16 }} />} type="tel" placeholder="Enter phone number" />
                  </>
                )}
                {step === 2 && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                      <Field label="Date of Birth" icon={<Calendar style={{ width: 16, height: 16 }} />} type="date" />
                      <Field label="Gender" icon={<User style={{ width: 16, height: 16 }} />} isSelect>
                        <option value="" style={{ background: '#0d1424' }}>Select gender</option>
                        <option value="male" style={{ background: '#0d1424' }}>Male</option>
                        <option value="female" style={{ background: '#0d1424' }}>Female</option>
                        <option value="other" style={{ background: '#0d1424' }}>Other / Prefer not to say</option>
                      </Field>
                      <Field label="Student Number" icon={<GraduationCap style={{ width: 16, height: 16 }} />} placeholder="Enter student number (optional)" />
                    </div>
                    <Field label="Home Address" icon={<Home style={{ width: 16, height: 16 }} />} placeholder="Enter home address" isTextarea />
                    <Field label="Emergency Contact" icon={<Smartphone style={{ width: 16, height: 16 }} />} placeholder="Enter emergency contact" isTextarea />
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '20px 32px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <button
                  className="btn-ghost-dh btn-sm-dh"
                  style={{ height: 42, borderRadius: 10, fontSize: 13 }}
                  onClick={() => step > 1 ? setStep(s => s - 1) : undefined}
                  disabled={step === 1}
                >
                  ← Back
                </button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-ghost-dh btn-sm-dh" style={{ height: 42, borderRadius: 10, fontSize: 13 }}>
                    Save Draft
                  </button>
                  {step < 2 ? (
                    <button
                      className="btn-primary-dh"
                      style={{ height: 42, padding: '0 24px', borderRadius: 10, fontSize: 14, minWidth: 148 }}
                      onClick={handleSubmit}
                      disabled={loading || isRegistering}
                    >
                      {loading || isRegistering ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 14, height: 14, borderRadius: '50%',
                            border: '2px solid rgba(0,0,0,0.3)',
                            borderTopColor: '#0a1a12',
                            animation: 'spin 0.7s linear infinite',
                            display: 'inline-block',
                          }} />
                          Registering...
                      ) : '✓ Register Patient'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6) sepia(1) saturate(2) hue-rotate(100deg); cursor: pointer; }
          select option { background: #0d1424; color: #e2faf2; }
          input::placeholder, textarea::placeholder { color: rgba(140,160,180,0.45); }
        `}</style>
      </div>
    </div>
  );
}