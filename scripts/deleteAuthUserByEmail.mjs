import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'

const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), 'serviceAccountKey.json')

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('serviceAccountKey.json not found in project root. Aborting.')
    process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

async function deleteAuthUserByEmail(email) {
    if (!email) {
        console.error('Usage: node deleteAuthUserByEmail.mjs user@example.com')
        process.exit(1)
    }

    try {
        console.log(`Looking up auth user for email: ${email}`)
        const userRecord = await admin.auth().getUserByEmail(email)
        console.log(`Found Auth user: uid=${userRecord.uid}. Deleting...`)
        await admin.auth().deleteUser(userRecord.uid)
        console.log(`Successfully deleted Auth user uid=${userRecord.uid}`)
    } catch (err) {
        if (err.code === 'auth/user-not-found' || err.message?.includes('user not found')) {
            console.log('No Auth user found for that email.')
            return
        }
        console.error('Failed to delete Auth user:', err)
        process.exit(2)
    }
}

(async () => {
    const email = process.argv[2]
    try {
        await deleteAuthUserByEmail(email)
    } catch (err) {
        console.error('Unexpected error:', err)
        process.exit(2)
    } finally {
        try { await admin.app().delete() } catch (e) { }
    }
})()
