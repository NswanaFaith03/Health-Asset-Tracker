import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldHalved } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { fetchUserRoleFromFirestore } from '../../utils/authUtils'
import { getRoleRoute } from '../../config/roles'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const user = await login(email, password)
      const userRole = await fetchUserRoleFromFirestore(user.uid)

      if (userRole) {
        navigate(getRoleRoute(userRole))
        return
      }

      // A verified Firebase user with no staffData/profile document is not a valid
      // routed account. Do not silently assume it is a student; that causes the
      // user to bounce between /student and /login with a null role.
      const message = user.email?.endsWith('@unza.zm')
        ? 'This staff account is not registered in the system yet. Please contact the administrator to recover it.'
        : 'Your account profile is incomplete or not yet approved. Please contact the administrator for access.'

      setError(message)
      setIsLoading(false)
      return
    } catch (error) {
      console.error('Login error:', error)

      if (error.code === 'auth/root-admin-forbidden') {
        setError('This is the reserved system administrator account. Please sign in with the configured root admin credentials.')
        setIsLoading(false)
        return
      }

      if (error.code === 'auth/email-not-verified') {
        toast.error('Please verify your email to log in. We\'ll send you a verification link.')
        navigate('/verify-email', {
          state: {
            email: error.email || email,
            fullName: error.fullName || 'User',
            isFromLogin: true
          }
        })
        setIsLoading(false)
        return
      }

      if (error.code === 'auth/not-approved') {
        setError('Your account is pending approval by an administrator. Please wait for approval.')
        setIsLoading(false)
        return
      }

      if (error.code === 'auth/account-not-registered') {
        setError('Your account profile is missing or incomplete. Please contact the administrator to recover the account.')
        setIsLoading(false)
        return
      }

      if (error.code === 'auth/first-login-password-reset') {
        navigate('/first-login-password-reset')
        setIsLoading(false)
        return
      }

      let errorMessage = 'Failed to sign in. Please try again.'

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.'
      } else if (error.message.includes('No document to update')) {
        errorMessage = 'Account setup incomplete. Please contact support.'
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-white px-4 py-6 sm:py-10 text-slate-900"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.35)), url("/images/unzaclinicposter.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 border-[3px] border-transparent" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45)' }} />
        <div className="absolute inset-2 rounded-[24px] border border-white/40" />
        <div className="absolute inset-x-3 top-3 h-1 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
        <div className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
        <div className="absolute inset-y-3 left-3 w-1 rounded-full bg-gradient-to-b from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
        <div className="absolute inset-y-3 right-3 w-1 rounded-full bg-gradient-to-b from-teal-500 via-emerald-400 to-sky-500 opacity-80" />
        <div className="absolute left-0 top-0 h-full w-full" style={{ background: 'linear-gradient(135deg, transparent 0%, transparent 18%, rgba(13,148,136,0.5) 18%, rgba(13,148,136,0.5) 21%, transparent 21%, transparent 39%, rgba(16,185,129,0.5) 39%, rgba(16,185,129,0.5) 42%, transparent 42%, transparent 60%, rgba(14,165,233,0.5) 60%, rgba(14,165,233,0.5) 63%, transparent 63%)', opacity: 0.7 }} />
      </div>

      <div className="fixed inset-0 bg-white/10 backdrop-blur-[1px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/80 bg-white/10 shadow-[0_25px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
          {/* Left side - Brand panel */}
          <div className="relative hidden overflow-hidden border-r border-white/70 bg-white/10 p-10 lg:flex lg:flex-col lg:justify-between backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/12 via-white/10 to-emerald-500/12" />

            <div className="relative z-10">
              <div className="mb-8 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-teal-200 bg-white/75 shadow-sm ring-4 ring-white/40">
                <img src="/images/unzamainlogo.png" alt="UNZA logo" className="h-[72%] w-[72%] object-contain drop-shadow-[0_2px_6px_rgba(15,23,42,0.08)]" />
              </div>
              <h1 aria-hidden className="flag-mask login-brand-wordmark pointer-events-none select-none">DigiHealth</h1>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Clinic Access</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900">Welcome Back</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-700">
                Secure access to your healthcare workspace, staff operations, and patient management.
              </p>
            </div>

            <div className="relative z-10 mt-8 rounded-2xl border border-white/70 bg-white/15 p-4 shadow-sm backdrop-blur-md">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">System Status</div>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-sm font-medium text-slate-700">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Right side - Form panel */}
          <div className="bg-white/10 p-4 sm:p-6 md:p-8 lg:p-10 backdrop-blur-xl">
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-700">Sign In</p>
              <h2 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900">Access Your Portal</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/80 py-2.5 sm:py-2.5 px-4 text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none transition shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300/80 bg-white/80 py-2.5 sm:py-2.5 px-4 pr-11 text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none transition shadow-sm"
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

                <div className="pt-1 text-right">
                  <Link to="/forgot-password" className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!email || !password || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 sm:py-2.5 text-base font-semibold text-white hover:bg-teal-700 transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 shadow-lg shadow-teal-200/60 touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaArrowRight className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/20 px-3 text-[10px] uppercase tracking-[0.2em] text-slate-600">New here?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-4 py-2.5 sm:py-2.5 font-medium text-slate-800 hover:border-sky-300 hover:bg-sky-50 transition shadow-sm touch-manipulation"
              >
                <FaShieldHalved className="h-4 w-4 text-teal-700" />
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
