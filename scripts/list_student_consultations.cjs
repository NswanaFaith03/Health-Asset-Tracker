#!/usr/bin/env node

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

const argv = process.argv.slice(2)
const emailOrUid = argv[0] || 'dalitsozulu123@gmail.com'

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json')
if (!fs.existsSync(serviceAccountPath)) {
    console.error('serviceAccountKey.json not found at', serviceAccountPath)
    process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
})

const auth = admin.auth()
const db = admin.firestore()

async function resolveUid(value) {
    if (!value) return null
    if (value.includes('@')) {
        try {
            const user = await auth.getUserByEmail(value)
            return user.uid
        } catch (e) {
            return null
        }
    }
    return value
}

async function run() {
    try {
        const uid = await resolveUid(emailOrUid)
        if (!uid) {
            console.error('Could not resolve uid for', emailOrUid)
            process.exit(2)
        }

        console.log('Listing documents for uid:', uid)

        const appointmentsSnap = await db.collection('appointments').where('createdBy', '==', uid).orderBy('createdAt', 'desc').get()
        console.log('Appointments count:', appointmentsSnap.size)
        appointmentsSnap.forEach(doc => {
            console.log(' -', doc.id, JSON.stringify(doc.data()))
        })

        const sessionsSnap = await db.collection('counsellingSessions').where('studentUid', '==', uid).orderBy('createdAt', 'desc').get()
        console.log('Counselling sessions count:', sessionsSnap.size)
        sessionsSnap.forEach(doc => console.log(' -', doc.id, JSON.stringify(doc.data())))

        const queueSnap = await db.collection('studentQueue').where('studentId', '==', uid).orderBy('createdAt', 'desc').get()
        console.log('StudentQueue count:', queueSnap.size)
        queueSnap.forEach(doc => console.log(' -', doc.id, JSON.stringify(doc.data())))

        process.exit(0)
    } catch (err) {
        console.error('Error listing student docs:', err)
        process.exit(3)
    }
}

run()
