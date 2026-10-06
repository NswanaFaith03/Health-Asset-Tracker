import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getRoleRoute } from '../config/roles'
import AppShell from './AppShell'
import { useEffect } from 'react'
import { isRootAdminEmail } from '../utils/authUtils'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, userRole, loading } = useAuth()
  const isAdminAccessUser = userRole === 'admin' || (currentUser?.email && isRootAdminEmail(currentUser.email))

  console.log('[ProtectedRoute]', { requiredRole, userRole, match: userRole === requiredRole, loading })

  // Refresh user state to ensure emailVerified is current
  // This is critical for users who just verified their email
  useEffect(() => {
    if (currentUser && !isAdminAccessUser) {
      currentUser.reload().catch(error => {
        console.error('Error reloading user state in ProtectedRoute:', error)
      })
    }
  }, [currentUser, isAdminAccessUser])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!currentUser.emailVerified && !isAdminAccessUser) {
    return <Navigate to="/verify-email" state={{ role: userRole, email: currentUser.email, fullName: currentUser.displayName }} replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    // If the user is logged in but we don't have a role from Firestore yet,
    // don't immediately redirect to the login page which is confusing.
    // Show a friendly notice so admins can recover the account instead.
    if (!userRole) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Account not registered</h2>
            <p className="text-sm text-slate-600 mb-4">
              Your account appears to be missing a staff profile in the system. Please contact an administrator to recover your account.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href="/contact" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800">Contact admin</a>
              <a href="/login" className="px-4 py-2 rounded-lg bg-red-50 text-red-700">Sign out</a>
            </div>
          </div>
        </div>
      )
    }

    const redirectRoute = getRoleRoute(userRole)
    return <Navigate to={redirectRoute} replace />
  }

  if (!requiredRole && userRole) {
    return <Navigate to={getRoleRoute(userRole)} replace />
  }

  return <AppShell>{children}</AppShell>
}
