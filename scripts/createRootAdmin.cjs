const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

// Path to service account key JSON. Place your downloaded key at project root
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'serviceAccountKey.json')

const ROOT_EMAIL = 'root@unza.zm'
const ROOT_PASSWORD = 'adminadmin' // change after first login

async function main() {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        console.error('serviceAccountKey.json not found. Place the service account JSON at:', SERVICE_ACCOUNT_PATH)
        process.exit(1)
    }

    const serviceAccount = require(SERVICE_ACCOUNT_PATH)

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })

    const AUTH = admin.auth()
    const DB = admin.firestore()

    try {
        let userRecord
        try {
            userRecord = await AUTH.getUserByEmail(ROOT_EMAIL)
            console.log('Root user already exists:', userRecord.uid)
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                userRecord = await AUTH.createUser({
                    email: ROOT_EMAIL,
                    password: ROOT_PASSWORD,
                    displayName: 'System Administrator',
                    emailVerified: true
                })
                console.log('Created root user:', userRecord.uid)
            } else {
                throw err
            }
        }

        // Set custom claims
        await AUTH.setCustomUserClaims(userRecord.uid, { role: 'admin', isRootAdmin: true })
        console.log('Set custom claims for root admin')

        // Create staffData document
        const staffRef = DB.doc(`staffData/${userRecord.uid}`)
        const staffSnap = await staffRef.get()
        if (!staffSnap.exists) {
            await staffRef.set({
                uid: userRecord.uid,
                email: ROOT_EMAIL,
                fullName: 'System Administrator',
                role: 'admin',
                isRootAdmin: true,
                emailVerified: true,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                permissions: [
                    'create_staff', 'delete_staff', 'modify_staff_roles', 'view_all_records', 'manage_system'
                ]
            })
            console.log('Created staffData document for root')
        } else {
            console.log('staffData already exists for root')
        }

        // Create adminAccounts/root
        const rootRef = DB.doc('adminAccounts/root')
        const rootSnap = await rootRef.get()
        if (!rootSnap.exists) {
            await rootRef.set({
                uid: userRecord.uid,
                email: ROOT_EMAIL,
                isRoot: true,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            })
            console.log('Created adminAccounts/root document')
        } else {
            console.log('adminAccounts/root already exists')
        }

        console.log('\nRoot admin setup complete. Please rotate the password and remove serviceAccountKey.json from the project root when done.')
        process.exit(0)
    } catch (e) {
        console.error('Failed to create root admin:', e)
        process.exit(1)
    }
}

main()
