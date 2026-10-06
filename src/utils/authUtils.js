import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const ROOT_ADMIN_EMAILS = ['root@unza.zm', 'nswana.faith@cs.unza.zm']

export function isRootAdminEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  return ROOT_ADMIN_EMAILS.includes(normalized)
}

function getActionCodeSettings() {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'https://life-clinic-management-system.vercel.app'

  return {
    url: `${appUrl}/verify-email`,
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.clinicmanagement.app'
    },
    android: {
      packageName: 'com.clinicmanagement.app',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: import.meta.env.VITE_FIREBASE_DYNAMIC_LINK_DOMAIN || undefined
  }
}

export async function createUserWithRole(email, password, fullName, role) {
  if (isRootAdminEmail(email)) {
    const error = new Error('The system administrator account is preconfigured and cannot be created from the signup form.')
    error.code = 'auth/root-admin-forbidden'
    throw error
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await updateProfile(user, {
    displayName: fullName
  })

  await sendEmailVerification(user, getActionCodeSettings())

  // For self-signup roles (students) require admin approval before full access
  const approved = role === 'student' ? false : true

  await setDoc(doc(db, 'staffData', user.uid), {
    uid: user.uid,
    email: user.email,
    fullName: fullName,
    role: role,
    emailVerified: false,
    approved: approved,
    mustResetPassword: role !== 'student',
    createdAt: new Date().toISOString(),
    lastLogin: null,
    verificationEmailSent: new Date().toISOString()
  })

  return user
}

export async function signInUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Refresh user state to ensure we have the latest emailVerified status
  // This is critical for users who just verified their email
  try {
    await user.reload()
    // Add a small delay to ensure Firebase has propagated the change
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.warn('Error reloading user state:', error)
    // Continue anyway, we'll use the current state
  }

  let userData = {}
  try {
    const userDocRef = doc(db, 'staffData', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      userData = userDoc.data()
    }
  } catch (error) {
    const message = error?.message || ''
    const isPermissionError = /permission|insufficient permissions/i.test(message)
    if (!isPermissionError) {
      console.error('Error reading user document during login:', error)
    }
    userData = {}
  }

  const isRootAdminUser = userData.isRootAdmin === true || isRootAdminEmail(user.email)

  if (isRootAdminUser) {
    try {
      await setDoc(doc(db, 'staffData', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'System Administrator',
        role: 'admin',
        isRootAdmin: true,
        emailVerified: true,
        approved: true,
        mustResetPassword: false,
        createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime).toISOString() : new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        verificationEmailSent: null
      }, { merge: true })
    } catch (error) {
      console.warn('Unable to sync root admin profile during login:', error)
    }
  }

  // Only root-admin users bypass email verification
  // All other users (staff and students) must verify email
  console.log(`[signInUser] Checking email verification for ${user.email}:`, {
    isRootAdminUser,
    emailVerified: user.emailVerified,
    uid: user.uid
  })

  if (!isRootAdminUser && !user.emailVerified) {
    console.warn(`[signInUser] Email not verified for ${user.email}, throwing error`)
    const error = new Error('Email not verified')
    error.code = 'auth/email-not-verified'
    error.email = user.email
    error.fullName = userData.fullName || user.displayName || 'User'
    error.role = userData.role || 'unknown'
    throw error
  }

  // Missing/invalid document must be rejected before any pending-approval logic.
  // This prevents stale or wrongly-created staff accounts from being treated as
  // student accounts that are awaiting approval.
  if (!isRootAdminUser && (!userData || Object.keys(userData).length === 0)) {
    const error = new Error('This account is not registered in the system yet. Please contact the administrator.')
    error.code = 'auth/account-not-registered'
    error.email = user.email
    throw error
  }

  const normalizedRole = userData?.role || null

  if (!isRootAdminUser && normalizedRole === 'student' && userData && userData.approved === false) {
    const error = new Error('Account pending approval by an administrator')
    error.code = 'auth/not-approved'
    error.email = user.email
    throw error
  }

  if (!isRootAdminUser && normalizedRole !== 'student' && userData && userData.approved === false) {
    const error = new Error('This staff account is invalid or waiting for administrator recovery.')
    error.code = 'auth/account-not-registered'
    error.email = user.email
    throw error
  }

  if (!isRootAdminUser && userData && userData.mustResetPassword === true) {
    const error = new Error('Password reset required')
    error.code = 'auth/first-login-password-reset'
    error.email = user.email
    error.fullName = userData.fullName || user.displayName || 'User'
    error.role = normalizedRole
    throw error
  }

  // STRICT INTEGRITY CHECK: Non-root staff users MUST have a staffData document.
  // Student signup is the only self-service path. Staff accounts are created through
  // the admin flow and must never fall through to a student role.
  if (!isRootAdminUser && (!userData || Object.keys(userData).length === 0)) {
    const error = new Error('This staff account is not registered in the system. Please contact the administrator.')
    error.code = 'auth/account-not-registered'
    throw error
  }

  if (user.uid) {
    try {
      const userDocRef = doc(db, 'staffData', user.uid)
      if (userData && Object.keys(userData).length > 0) {
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString(),
          emailVerified: true,
          approved: userData.approved ?? true,
          isRootAdmin: userData.isRootAdmin ?? isRootAdminUser,
          studentId: userData.studentId || userData.studentNumber || '',
          studentNumber: userData.studentNumber || userData.studentId || '',
          mustResetPassword: isRootAdminUser ? false : (userData.mustResetPassword ?? false),
          role: userData.role || 'student'
        })
      }
    } catch (error) {
      const message = error?.message || ''
      const isPermissionError = /permission|insufficient permissions/i.test(message)
      if (!isPermissionError) {
        console.error('Error updating firestore user record on login:', error)
      }
      if (!isPermissionError && error?.message?.includes('User profile incomplete')) {
        throw error
      }
    }
  }

  return user
}

export async function resetUserPassword(email) {
  return await sendPasswordResetEmail(auth, email)
}

export async function resendUserVerificationEmail(user) {
  return await sendEmailVerification(user, getActionCodeSettings())
}

export async function completeFirstLoginPasswordReset(newPassword) {
  if (!auth || !auth.currentUser) {
    throw new Error('No active user session found.')
  }

  await updatePassword(auth.currentUser, newPassword)

  await updateDoc(doc(db, 'staffData', auth.currentUser.uid), {
    mustResetPassword: false,
    passwordLastChangedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  })
}

export async function fetchUserRoleFromFirestore(uid) {
  if (!uid) return null

  try {
    const userDocRef = doc(db, 'staffData', uid)
    const userDoc = await getDoc(userDocRef)
    if (userDoc.exists()) {
      const role = userDoc.data().role
      console.log(`[fetchUserRoleFromFirestore] Found role '${role}' for uid: ${uid}`)
      return role
    }

    // Do not auto-assign a missing staff account to a student or nurse role.
    // This is the exact conflict that causes admin-created staff to fall into the
    // student pending approval path.
    console.log(`[fetchUserRoleFromFirestore] No staffData document found for uid: ${uid}`)
    return null
  } catch (error) {
    console.error('[fetchUserRoleFromFirestore] Error fetching user role:', error.message || error)
    return null
  }
}

export async function ensureStaffProfileExists(user) {
  if (!user || !user.uid) return null

  try {
    const userDocRef = doc(db, 'staffData', user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return userDoc.data()
    }

    const email = String(user.email || '').trim().toLowerCase()
    const isUnzaStaffEmail = email.endsWith('@unza.zm')

    if (isUnzaStaffEmail) {
      const rootAdminUser = email === 'root@unza.zm' || email === 'nswana.faith@cs.unza.zm'
      if (!rootAdminUser) {
        return null
      }

      const profile = {
        uid: user.uid,
        email,
        fullName: user.displayName || 'User',
        role: 'admin',
        emailVerified: Boolean(user.emailVerified),
        approved: true,
        mustResetPassword: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        verificationEmailSent: null
      }

      await setDoc(userDocRef, profile, { merge: true })
      return profile
    }

    const studentProfile = {
      uid: user.uid,
      email,
      fullName: user.displayName || 'User',
      role: 'student',
      emailVerified: Boolean(user.emailVerified),
      approved: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    await setDoc(userDocRef, studentProfile, { merge: true })
    return studentProfile
  } catch (error) {
    console.error('[ensureStaffProfileExists] Unable to ensure profile exists:', error)
    return null
  }
}


