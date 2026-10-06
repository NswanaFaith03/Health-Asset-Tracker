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

const db = admin.firestore()

async function deleteStaffDataByEmail(email) {
    if (!email) {
        console.error('Usage: node deleteStaffDataByEmail.mjs user@example.com')
        process.exit(1)
    }

    console.log(`Searching for staffData documents with email: ${email}`)
    const snapshot = await db.collection('staffData').where('email', '==', email).get()

    if (snapshot.empty) {
        console.log('No staffData document found for that email.')
        return
    }

    for (const docSnap of snapshot.docs) {
        const docRef = docSnap.ref
        console.log(`Found document: ${docRef.path} (id=${docRef.id}). Deleting document...`)
        try {
            await docRef.delete()
            console.log(`Successfully deleted ${docRef.path}`)
        } catch (err) {
            console.error(`Failed to delete ${docRef.path}:`, err)
        }
    }
}

(async () => {
    const email = process.argv[2]
    try {
        await deleteStaffDataByEmail(email)
    } catch (err) {
        console.error('Unexpected error:', err)
        process.exit(2)
    } finally {
        try { await admin.app().delete() } catch (e) { }
    }
})()
