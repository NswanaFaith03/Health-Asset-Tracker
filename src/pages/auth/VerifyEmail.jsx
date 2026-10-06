import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaCircleCheck, FaArrowRight, FaStar, FaUserDoctor, FaBellConcierge, FaClock, FaShieldHalved, FaArrowsRotate } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'
import { fetchUserRoleFromFirestore } from '../../utils/authUtils'
import toast from 'react-hot-toast'
import HeaderBanner from '../../components/HeaderBanner'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, resendVerificationEmail } = useAuth()
  const [countdown, setCountdown] = useState(20)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Get data from signup form or login redirect
  const { role, email, fullName, isFromLogin } = location.state || { role: 'student', email: 'user@example.com', fullName: 'User', isFromLogin: false }

  const roleMeta = {
    doctor: { title: 'Doctor', icon: FaUserDoctor, color: 'blue' },
    receptionist: { title: 'Receptionist', icon: FaBellConcierge, color: 'cyan' }
  }

  const currentRole = roleMeta[role] || { title: 'Staff', icon: FaUserDoctor, color: 'blue' }
  const IconComponent = currentRole.icon

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsRedirecting(true)
          setTimeout(() => navigate('/login'), 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleManualRedirect = () => {
    setIsRedirecting(true)
    setTimeout(() => navigate('/login'), 500)
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await resendVerificationEmail()
      toast.success('Verification email resent successfully! Please check your inbox.')
    } catch (error) {
      console.error('Error resending email:', error)
      toast.error(error.message || 'Failed to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!currentUser) {
      toast.error('Session expired or user not found. Please log in again.')
      navigate('/login')
      return
    }

    setIsChecking(true)
    try {
      await currentUser.reload()

      if (currentUser.emailVerified) {
        toast.success('Email verified successfully! Redirecting to dashboard...')

        let targetRole = role
        if (!location.state || !location.state.role) {
          const fetchedRole = await fetchUserRoleFromFirestore(currentUser.uid)
          if (fetchedRole) {
            targetRole = fetchedRole
          }
        }

        setTimeout(() => {
          if (targetRole === 'doctor') {
            navigate('/doctor')
          } else if (targetRole === 'receptionist') {
            navigate('/receptionist')
          } else if (targetRole === 'nurse') {
            navigate('/nurse')
          } else if (targetRole === 'student') {
            navigate('/student')
          } else if (targetRole === 'admin') {
            navigate('/admin')
          } else {
            navigate('/')
          }
        }, 1500)
      } else {
        toast.error('Email is still not verified. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      toast.error(error.message || 'Failed to check verification status. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900 antialiased" style={{
      backgroundImage: 'url("/images/nursing_students.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Professional multi-layer overlay */}
      <div className="fixed inset-0 bg-white/70" />
      <div className="fixed inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/60" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <HeaderBanner title={isFromLogin ? "Verify Your Email" : "Verify Your Email"} subtitle={isFromLogin ? "Confirm your email to access your account" : "We've sent a verification link to your email"} icon={FaEnvelope} image="/images/students.jpg" />

          {/* Main Card */}
          <div className="backdrop-blur-sm border border-slate-200 rounded-xl p-8 bg-white/90 shadow-xl shadow-slate-200/60">
            {/* Success Animation */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-lg mb-4">
                <FaEnvelope className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isFromLogin ? 'Email Verification Required' : 'Account Created!'}
              </h2>
              <p className="text-slate-600 text-sm">
                {isFromLogin ? 'Please verify your email to log in' : `Welcome, ${fullName}`}
              </p>
            </div>

            {/* Email & Role Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6 shadow-sm">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Verification sent to</p>
                <p className="text-base font-semibold text-slate-900 mb-4 break-all">{email || 'your email'}</p>
                {!isFromLogin && (
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-base font-semibold text-slate-800">
                      {currentRole.title}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-center text-slate-500 text-xs mt-4">
                {role === 'student' ? (
                  'Your student account is created and pending administrator approval.'
                ) : (
                  `Your account has been created with ${currentRole.title.toLowerCase()} privileges`
                )}
              </p>
            </div>

            {/* Email Info */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <FaEnvelope className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="font-semibold text-teal-700 text-sm">Verification Email Sent</span>
              </div>
              <p className="text-slate-600 text-xs mb-3">
                Check your inbox for the verification link:
              </p>
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                <span className="text-teal-700 font-mono text-xs break-all">{email}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-teal-200 rounded-lg p-5 mb-6 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaClock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="font-semibold text-teal-700 text-sm">Auto-redirect in</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-700 mb-2">
                  {countdown}s
                </div>
                <p className="text-slate-500 text-xs">
                  You'll be redirected to login automatically
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckStatus}
                disabled={isChecking || isRedirecting}
                className="w-full py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-60"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaArrowsRotate className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FaCircleCheck className="w-4 h-4" />
                    <span>Check Verification Status</span>
                  </div>
                )}
              </button>

              <button
                onClick={handleManualRedirect}
                disabled={isRedirecting || isChecking}
                className="w-full py-2.5 px-6 border border-slate-300 bg-white hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed text-slate-800 font-semibold text-sm rounded-lg transition-all duration-300 disabled:opacity-60 shadow-sm"
              >
                {isRedirecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                    <span>Redirecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FaArrowRight className="w-4 h-4" />
                    <span>Go to Login</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <div className="bg-white/90 border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-base font-semibold text-teal-700 mb-3">What to do next?</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <FaStar className="w-3 h-3 text-teal-600 flex-shrink-0" />
                  <span>Check your email inbox (and spam folder)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="w-3 h-3 text-teal-600 flex-shrink-0" />
                  <span>Click the verification link in the email</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="w-3 h-3 text-teal-600 flex-shrink-0" />
                  <span>Return here to continue once it's confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
