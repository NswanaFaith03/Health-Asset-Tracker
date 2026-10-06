#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const email = argv[0] || 'dalitsozulu123@gmail.com';

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('serviceAccountKey.json not found at', serviceAccountPath);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

const auth = admin.auth();
const db = admin.firestore();

async function run() {
    try {
        console.log('Checking user for email:', email);
        const user = await auth.getUserByEmail(email);
        console.log('Found user:', { uid: user.uid, email: user.email, emailVerified: user.emailVerified });

        const docRef = db.collection('staffData').doc(user.uid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            console.log('staffData document already exists for uid:', user.uid);
            console.log('Document data:', docSnap.data());
            process.exit(0);
        }

        console.log('No staffData doc found. Creating one with role: student');
        const profile = {
            uid: user.uid,
            email: user.email.toLowerCase(),
            fullName: user.displayName || 'Student',
            role: 'student',
            createdAt: new Date().toISOString(),
            isActive: true,
            permissions: [],
            lastLogin: user.metadata.lastSignInTime || null
        };

        await docRef.set(profile);
        console.log('Created staffData document for', user.uid);
        const verify = await docRef.get();
        console.log('Verify doc exists:', verify.exists, 'data:', verify.data());
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(2);
    }
}

run();
