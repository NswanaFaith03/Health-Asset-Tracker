import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaHospital, FaUserDoctor, FaBellConcierge, FaEye, FaEyeSlash, FaArrowRight, FaUserGroup, FaVial, FaPills, FaHeartPulse, FaUserNurse, FaShieldHalved, FaStar } from 'react-icons/fa6'
import HeaderBanner from '../../components/HeaderBanner'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_ORDER } from '../../config/roles'

const STAFF_ROLES = ['doctor', 'pharmacist', 'labTechnician', 'nurse', 'mentalHealthCounselor', 'hivProfessional', 'receptionist', 'admin']
const SELF_SIGNUP_ROLES = ['student']
const ROOT_ADMIN_EMAILS = ['root@unza.zm', 'nswana.faith@cs.unza.zm']

const roleMeta = {
  student: { title: 'Student', icon: FaUserGroup, description: 'Access care, consultations, prescriptions, and health support from one portal.' },
  doctor: { title: 'Doctor', icon: FaUserDoctor, description: 'Provide care with streamlined tools for appointments and records.' },
  pharmacist: { title: 'Pharmacist', icon: FaPills, description: 'Dispense medication safely and manage prescription fulfillment.' },
  labTechnician: { title: 'Lab Technician', icon: FaVial, description: 'Process lab requests and publish diagnostic results.' },
  nurse: { title: 'Nurse', icon: FaUserNurse, description: 'Support patient intake, triage, and queue coordination.' },
  mentalHealthCounselor: { title: 'Mental Health Counselor', icon: FaHeartPulse, description: 'Provide counseling sessions and patient follow-up messaging.' },
  hivProfessional: { title: 'HIV Professional', icon: FaShieldHalved, description: 'Coordinate HIV support, resources, and session tracking.' },
  receptionist: { title: 'Receptionist', icon: FaBellConcierge, description: 'Coordinate patient intake, scheduling, and front-desk operations.' },
  admin: { title: 'Admin', icon: FaShieldHalved, description: 'Monitor system performance, access analytics, and manage users.' }
}

const SIGNUP_ROLES = SELF_SIGNUP_ROLES.map(role => roleMeta[role]).filter(Boolean)

export default function Signup() {
  const { role: initialRole } = useParams()
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(
    SELF_SIGNUP_ROLES.includes(initialRole) ? initialRole : 'student'
  )
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const currentRole = roleMeta[selectedRole] || roleMeta.student
  const IconComponent = currentRole?.icon || FaHospital

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!selectedRole) {
      newErrors.role = 'Please select a role'
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (ROOT_ADMIN_EMAILS.includes(formData.email.trim().toLowerCase())) {
      newErrors.email = 'This is the reserved system administrator account. Please use the configured root admin login credentials.'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await signup(formData.email, formData.password, formData.fullName, selectedRole)

      navigate('/verify-email', {
        state: {
          role: selectedRole,
          email: formData.email,
          fullName: formData.fullName
        }
      })
    } catch (error) {
      console.error('Signup error:', error)
      let errorMessage = 'Failed to create account. Please try again.'

      if (error.code === 'auth/root-admin-forbidden') {
        errorMessage = 'The system administrator account is preconfigured and cannot be created from this form.'
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      }

      setErrors(prev => ({ ...prev, general: errorMessage }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:py-10 text-slate-900" style={{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <HeaderBanner title={currentRole ? `Create Your ${currentRole.title} Account` : 'Join Us'} subtitle={currentRole ? currentRole.description : 'Student accounts available for self-registration.'} icon={IconComponent} />

          <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4 shadow-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-teal-700">Registration</div>
                <div className="mt-1 text-base sm:text-lg font-semibold text-slate-900">Choose your access role</div>
              </div>
              <div className="rounded-lg border border-teal-200 bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-teal-700 self-start sm:self-auto">
                Self-Service
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {SIGNUP_ROLES.map(role => {
                    const RoleIcon = role.icon
                    const isSelected = selectedRole === role.title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')

                    return (
                      <button
                        key={role.title}
                        type="button"
                        onClick={() => setSelectedRole(Object.keys(roleMeta).find(key => roleMeta[key].title === role.title))}
                        className={`flex items-center justify-between rounded-lg border p-3 sm:p-4 text-left transition touch-manipulation ${isSelected ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg flex-shrink-0 ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <RoleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm sm:text-base">{role.title}</div>
                            <div className="text-xs sm:text-sm text-slate-600 line-clamp-2">{role.description}</div>
                          </div>
                        </div>
                        {isSelected && <FaArrowRight className="h-4 w-4 text-teal-700 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border bg-white py-2.5 px-4 text-slate-900 placeholder:text-slate-500 focus:outline-none transition ${errors.fullName ? 'border-teal-300 focus:border-red-500' : 'border-slate-300 focus:border-sky-500'}`}
                  required
                />
                {errors.fullName && <p className="text-xs text-teal-600">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border bg-white py-2.5 px-4 text-slate-900 placeholder:text-slate-500 focus:outline-none transition ${errors.email ? 'border-teal-300 focus:border-red-500' : 'border-slate-300 focus:border-sky-500'}`}
                  required
                />
                {errors.email && <p className="text-xs text-teal-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white py-2.5 px-4 pr-11 text-slate-900 placeholder:text-slate-500 focus:outline-none transition ${errors.password ? 'border-teal-300 focus:border-red-500' : 'border-slate-300 focus:border-sky-500'}`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-teal-700 transition"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-teal-600">{errors.password}</p>}
                <p className="text-xs text-slate-500">Minimum 6 characters</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-white py-2.5 px-4 pr-11 text-slate-900 placeholder:text-slate-500 focus:outline-none transition ${errors.confirmPassword ? 'border-teal-300 focus:border-red-500' : 'border-slate-300 focus:border-sky-500'}`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-teal-700 transition"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-teal-600">{errors.confirmPassword}</p>}
              </div>

              {errors.general && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
                  {errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-base font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 shadow-sm touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


