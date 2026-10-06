import { createUserWithEmailAndPassword, updateProfile, deleteUser, sendEmailVerification, getAuth } from 'firebase/auth'
import { initializeApp, deleteApp } from 'firebase/app'
import { doc, setDoc, getDoc, updateDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { app, auth, db } from '../firebase/config'

function getActionCodeSettings() {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'https://life-clinic-management-system.vercel.app'
    return {
        url: `${appUrl}/login`,
        handleCodeInApp: true
    }
}

/**
 * Root admin account setup and staff management
 * Only root@unza.zm can create other staff accounts
 */

const ROOT_ADMIN_EMAILS = ['root@unza.zm', 'nswana.faith@cs.unza.zm']
const ROOT_ADMIN_PASSWORD = 'adminadmin'

async function createUserInSecondaryAuth(email, password, fullName) {
    if (!app || !app.options) {
        throw new Error('Firebase app is not initialized')
    }

    const secondaryAppName = `staff-creator-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const secondaryApp = initializeApp(app.options, secondaryAppName)
    const secondaryAuth = getAuth(secondaryApp)

    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
        const user = userCredential.user

        await updateProfile(user, {
            displayName: fullName
        })

        await sendEmailVerification(user, getActionCodeSettings())

        return user
    } finally {
        try {
            await secondaryAuth.signOut()
        } catch (error) {
            console.warn('Unable to sign out secondary auth session:', error)
        }

        await deleteApp(secondaryApp)
    }
}

export function isRootAdminEmail(email) {
    const normalized = String(email || '').trim().toLowerCase()
    return ROOT_ADMIN_EMAILS.includes(normalized)
}

/**
 * Initialize root admin account (run once)
 * This should be run only once during system setup
 */
export async function initializeRootAdmin() {
    if (!auth || !auth.currentUser) {
        return { exists: false, message: 'No authenticated user; skipping root admin check' }
    }

    try {
        const userDocRef = doc(db, 'staffData', auth.currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
            return { exists: false, message: 'Current user is not registered in staffData' }
        }

        const userData = userDoc.data()
        const isRoot = (userData.isRootAdmin === true || userData.role === 'admin') && isRootAdminEmail(userData.email)

        return {
            exists: isRoot,
            message: isRoot ? 'Root admin account detected' : 'Current authenticated user is not the root admin'
        }
    } catch (error) {
        const message = error?.message || ''
        const isPermissionIssue = message.toLowerCase().includes('permission') || message.toLowerCase().includes('insufficient permissions')

        if (!isPermissionIssue) {
            console.error('Error checking root admin existence:', error)
        }

        return { success: false, exists: false, error: message || 'Unable to verify root admin status' }
    }
}

/**
 * Verify if a user is the root admin
 */
export async function isRootAdmin(uid) {
    try {
        const userDocRef = doc(db, 'staffData', uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
            const currentEmail = (auth.currentUser?.email || '').trim().toLowerCase()
            return isRootAdminEmail(currentEmail)
        }

        const userData = userDoc.data()
        const email = String(userData.email || auth.currentUser?.email || '').trim().toLowerCase()
        const emailMatchesRoot = isRootAdminEmail(email)
        const hasRootFlag = userData.isRootAdmin === true
        const hasAdminRole = userData.role === 'admin'

        return (hasRootFlag || hasAdminRole) && emailMatchesRoot
    } catch (error) {
        console.error('Error checking root admin status:', error)
        return false
    }
}

/**
 * Create a new staff account (admin only)
 * @param {string} adminUid - The UID of the admin creating the staff
 * @param {object} staffData - Staff details
 * @returns {object} Result of staff creation
 */
export async function createStaffAccount(adminUid, staffData) {
    let newUserUid = null

    try {
        // Verify admin is root admin
        const isAdmin = await isRootAdmin(adminUid)
        if (!isAdmin) {
            throw new Error('Only root admin can create staff accounts')
        }

        const { email, password, fullName, role, phone, specialization, department, emergencyContact } = staffData

        // Validate required fields
        if (!email || !password || !fullName || !role) {
            throw new Error('Email, password, full name, and role are required')
        }

        // Validate role is a staff role (not student)
        const staffRoles = ['doctor', 'pharmacist', 'labTechnician', 'nurse', 'mentalHealthCounselor', 'hivProfessional', 'receptionist', 'admin']
        if (!staffRoles.includes(role)) {
            throw new Error(`Invalid role. Must be one of: ${staffRoles.join(', ')}`)
        }

        // Check for duplicate email in staffData collection
        const existingQuery = query(
            collection(db, 'staffData'),
            where('email', '==', email.toLowerCase())
        )
        const existingSnapshot = await getDocs(existingQuery)
        if (!existingSnapshot.empty) {
            throw new Error(`Staff account with email "${email}" already exists`)
        }

        // Create Firebase auth account in a secondary auth instance so the
        // primary admin session stays active for Firestore writes.
        const user = await createUserInSecondaryAuth(email, password, fullName)
        newUserUid = user.uid

        // Create staff profile in Firestore
        const staffProfile = {
            uid: user.uid,
            email: email,
            fullName: fullName,
            role: role,
            emailVerified: false, // Staff must verify email before login
            approved: true, // Pre-approved since admin is creating this account explicitly
            createdAt: new Date().toISOString(),
            createdByAdmin: adminUid,
            lastLogin: null,
            phone: phone || null,
            isActive: true,
            permissions: getPermissionsForRole(role),
            verificationEmailSent: new Date().toISOString()
        }

        // Emergency contact (optional)
        if (emergencyContact && (emergencyContact.name || emergencyContact.phone)) {
            staffProfile.emergencyContact = {
                name: emergencyContact.name || null,
                phone: emergencyContact.phone || null
            }
        }

        // Add role-specific fields
        if (role === 'doctor' && specialization) {
            staffProfile.specialization = specialization
            staffProfile.department = department || null
        }

        // Create Firestore document
        await setDoc(doc(db, 'staffData', user.uid), staffProfile)

        // Verify Firestore document was created successfully
        const verificationDoc = await getDoc(doc(db, 'staffData', user.uid))
        if (!verificationDoc.exists()) {
            throw new Error(`CRITICAL: Firestore document creation failed for ${email}. Document does not exist after setDoc.`)
        }

        console.log(`✅ Staff account created successfully: ${email} (${role}) - UID: ${user.uid}`)

        // Log audit event
        await logAuditEvent({
            actorUid: adminUid,
            actorName: 'Admin',
            action: 'create_staff_account',
            category: 'user_management',
            targetUid: user.uid,
            targetName: fullName,
            targetRole: role,
            details: `Created ${role} account for ${email}`,
            metadata: { email, role }
        })

        return {
            success: true,
            message: `Staff account created successfully for ${email}`,
            staffId: user.uid,
            email: email,
            role: role,
            fullName: fullName
        }
    } catch (error) {
        console.error('Error creating staff account:', error)

        // If Firebase Auth user was created but Firestore doc creation failed,
        // provide detailed error info for recovery
        if (newUserUid && error.message && error.message.includes('CRITICAL')) {
            return {
                success: false,
                error: error.message,
                recoveryInfo: {
                    message: 'Firebase Auth user was created but Firestore document failed. Manual recovery needed.',
                    uid: newUserUid,
                    email: staffData.email,
                    role: staffData.role,
                    action: 'Use recovery script to recreate Firestore document with this UID'
                }
            }
        }

        if (error.code === 'auth/email-already-in-use') {
            return {
                success: false,
                error: 'This email is already registered in the system'
            }
        }
        if (error.code === 'auth/weak-password') {
            return {
                success: false,
                error: 'Password is too weak. Use at least 6 characters'
            }
        }
        return {
            success: false,
            error: error.message || 'Failed to create staff account'
        }
    }
}

/**
 * Get permissions for a given role
 */
function getPermissionsForRole(role) {
    const permissions = {
        doctor: ['view_appointments', 'create_prescription', 'view_patient_records', 'update_consultation_status'],
        pharmacist: ['view_prescriptions', 'dispense_medication', 'track_fulfillment'],
        labTechnician: ['process_lab_requests', 'publish_results', 'view_samples'],
        nurse: ['patient_intake', 'triage_support', 'queue_coordination', 'create_consultation'],
        mentalHealthCounselor: ['manage_sessions', 'patient_communication', 'schedule_counseling'],
        hivProfessional: ['coordinate_support', 'manage_resources', 'session_tracking'],
        receptionist: ['manage_intake', 'schedule_appointments', 'manage_billing', 'queue_support'],
        admin: ['all_access', 'system_management', 'user_administration', 'analytics']
    }
    return permissions[role] || []
}

/**
 * Recover a staff account with missing Firestore document
 * This function creates the missing Firestore staffData document for an existing Firebase Auth user
 * @param {string} uid - The Firebase Auth UID of the staff member
 * @param {string} email - The email address (must match Firebase Auth)
 * @param {string} fullName - Full name of the staff member
 * @param {string} role - The role (doctor, nurse, pharmacist, etc.)
 * @param {string} adminUid - The UID of the admin performing recovery
 * @returns {object} Result of recovery operation
 */
export async function recoverStaffAccount(uid, email, fullName, role, adminUid) {
    try {
        // Verify admin is root admin
        const isAdmin = await isRootAdmin(adminUid)
        if (!isAdmin) {
            throw new Error('Only root admin can recover staff accounts')
        }

        // Verify the UID and email exist in Firebase Auth
        let authUser
        try {
            authUser = await auth.currentUser // In production, use admin SDK to fetch by UID
            if (!authUser || authUser.uid !== uid) {
                throw new Error(`Cannot verify user ${uid} in Firebase Auth`)
            }
        } catch (e) {
            throw new Error(`Firebase Auth verification failed: ${e.message}`)
        }

        // Check if Firestore document already exists
        const existingDoc = await getDoc(doc(db, 'staffData', uid))
        if (existingDoc.exists()) {
            return {
                success: false,
                error: `Firestore document already exists for ${email}`,
                data: existingDoc.data()
            }
        }

        // Validate role is a staff role
        const staffRoles = ['doctor', 'pharmacist', 'labTechnician', 'nurse', 'mentalHealthCounselor', 'hivProfessional', 'receptionist', 'admin']
        if (!staffRoles.includes(role)) {
            throw new Error(`Invalid role. Must be one of: ${staffRoles.join(', ')}`)
        }

        // Create the missing Firestore document
        const staffProfile = {
            uid: uid,
            email: email.toLowerCase(),
            fullName: fullName,
            role: role,
            emailVerified: authUser.emailVerified || false, // Use actual Firebase Auth status
            approved: true, // Pre-approved since admin is recovering/creating this account
            createdAt: new Date().toISOString(),
            recoveredAt: new Date().toISOString(),
            recoveredByAdmin: adminUid,
            lastLogin: null,
            isActive: true,
            permissions: getPermissionsForRole(role),
            verificationEmailSent: new Date().toISOString()
        }

        await setDoc(doc(db, 'staffData', uid), staffProfile)

        // Verify recovery was successful
        const verificationDoc = await getDoc(doc(db, 'staffData', uid))
        if (!verificationDoc.exists()) {
            throw new Error(`CRITICAL: Firestore document recovery failed for ${email}`)
        }

        console.log(`✅ Staff account recovered: ${email} (${role}) - UID: ${uid}`)

        // Log audit event
        await logAuditEvent({
            actorUid: adminUid,
            actorName: 'Admin',
            action: 'recover_staff_account',
            category: 'user_management',
            targetUid: uid,
            targetName: fullName,
            targetRole: role,
            details: `Recovered missing Firestore document for ${email}`,
            metadata: { email, role, originalMissing: true }
        })

        return {
            success: true,
            message: `Staff account recovered successfully for ${email}`,
            staffId: uid,
            email: email,
            role: role,
            fullName: fullName,
            emailVerified: staffProfile.emailVerified
        }
    } catch (error) {
        console.error('Error recovering staff account:', error)
        return {
            success: false,
            error: error.message || 'Failed to recover staff account'
        }
    }
}

/**
 * Deactivate a staff account (admin only)
 */
export async function deactivateStaffAccount(adminUid, staffUid) {
    try {
        const isAdmin = await isRootAdmin(adminUid)
        if (!isAdmin) {
            throw new Error('Only root admin can manage staff accounts')
        }

        await updateDoc(doc(db, 'staffData', staffUid), {
            isActive: false,
            deactivatedAt: new Date().toISOString(),
            deactivatedByAdmin: adminUid
        })

        return { success: true, message: 'Staff account deactivated' }
    } catch (error) {
        console.error('Error deactivating staff account:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Reset staff password (admin only)
 */
export async function resetStaffPassword(adminUid, staffEmail, newPassword) {
    try {
        const isAdmin = await isRootAdmin(adminUid)
        if (!isAdmin) {
            throw new Error('Only root admin can reset staff passwords')
        }

        // Note: In production, you'd use Firebase Admin SDK for this
        // For now, return a message that admin needs to handle this securely
        return {
            success: true,
            message: 'Staff password reset initiated. Use Firebase Admin SDK to complete.',
            email: staffEmail,
            newPassword: newPassword
        }
    } catch (error) {
        console.error('Error resetting staff password:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Log an audit event
 */
export async function logAuditEvent({
    actorUid,
    actorName,
    action,
    category = 'system',
    targetUid = '',
    targetName = '',
    targetRole = '',
    details = '',
    metadata = {}
}) {
    try {
        const logEntry = {
            actorUid: actorUid || '',
            actorName: actorName || 'System',
            action: action || 'unknown_action',
            category,
            targetUid,
            targetName,
            targetRole,
            details,
            metadata,
            createdAt: new Date().toISOString()
        }

        await addDoc(collection(db, 'auditLogs'), logEntry)
        return { success: true }
    } catch (error) {
        console.error('Error writing audit log:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Suspend a staff account (admin only)
 */
export async function suspendStaffAccount(adminUid, staffUid, reason = 'Suspended by administrator') {
    try {
        const isAdmin = await isRootAdmin(adminUid)
        if (!isAdmin) {
            throw new Error('Only root admin can suspend staff accounts')
        }

        const staffDoc = await getDoc(doc(db, 'staffData', staffUid))
        const staffData = staffDoc.exists() ? staffDoc.data() : {}

        await updateDoc(doc(db, 'staffData', staffUid), {
            isActive: false,
            suspended: true,
            suspensionReason: reason,
            suspendedAt: new Date().toISOString(),
            suspendedByAdmin: adminUid,
            updatedAt: new Date().toISOString()
        })

        await logAuditEvent({
            actorUid: adminUid,
            actorName: 'Root Admin',
            action: 'suspend_account',
            category: 'user_management',
            targetUid: staffUid,
            targetName: staffData.fullName || staffData.email || 'Unknown user',
            targetRole: staffData.role || '',
            details: reason,
            metadata: { reason }
        })

        return { success: true, message: 'Staff account suspended' }
    } catch (error) {
        console.error('Error suspending staff account:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete a staff account (admin only)
 */
export async function deleteStaffAccount(adminUid, staffUid, reason = 'Deleted by administrator') {
    try {
        const isAdmin = await isRootAdmin(adminUid)
        if (!isAdmin) {
            throw new Error('Only root admin can delete staff accounts')
        }

        const staffDoc = await getDoc(doc(db, 'staffData', staffUid))
        const staffData = staffDoc.exists() ? staffDoc.data() : {}

        await updateDoc(doc(db, 'staffData', staffUid), {
            isActive: false,
            deleted: true,
            deletedAt: new Date().toISOString(),
            deletedByAdmin: adminUid,
            deletionReason: reason,
            updatedAt: new Date().toISOString()
        })

        try {
            const authUser = auth.currentUser
            if (authUser && authUser.uid === staffUid) {
                await deleteUser(authUser)
            }
        } catch (authError) {
            console.warn('Firebase Auth deletion skipped for non-current user:', authError)
        }

        await logAuditEvent({
            actorUid: adminUid,
            actorName: 'Root Admin',
            action: 'delete_account',
            category: 'user_management',
            targetUid: staffUid,
            targetName: staffData.fullName || staffData.email || 'Unknown user',
            targetRole: staffData.role || '',
            details: reason,
            metadata: { reason, deletedAt: new Date().toISOString() }
        })

        return { success: true, message: 'Staff account deleted permanently' }
    } catch (error) {
        console.error('Error deleting staff account:', error)
        return { success: false, error: error.message }
    }
}

export const ADMIN_CREDENTIALS = {
    email: ROOT_ADMIN_EMAILS[0],
    password: ROOT_ADMIN_PASSWORD
}
