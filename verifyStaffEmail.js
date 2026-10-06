import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

async function verifyStaffEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`Current status for ${email}:`);
    console.log(`  UID: ${user.uid}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    
    if (!user.emailVerified) {
      await admin.auth().updateUser(user.uid, {
        emailVerified: true
      });
      console.log(`✅ Successfully marked ${email} as email verified`);
    } else {
      console.log(`✅ ${email} is already verified`);
    }
    
    // Also update Firestore
    const db = admin.firestore();
    await db.collection('staffData').doc(user.uid).update({
      emailVerified: true,
      verificationEmailSent: null
    });
    console.log(`✅ Updated Firestore record for ${email}`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node verifyStaffEmail.js <email>');
  console.error('Example: node verifyStaffEmail.js doctor@example.com');
  process.exit(1);
}

verifyStaffEmail(email).then(() => {
  console.log('\nStaff email verification complete!');
  process.exit(0);
});
