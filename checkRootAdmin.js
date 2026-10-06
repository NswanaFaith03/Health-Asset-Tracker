const admin = require('firebase-admin');

// Initialize the app with the service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRootAdmin() {
  try {
    console.log('Checking for root admin account in Firestore...');

    // The root admin email we're looking for
    const ROOT_ADMIN_EMAIL = 'root@unza.zm';

    // Query the staffData collection for documents with this email
    const staffDataRef = db.collection('staffData');
    const snapshot = await staffDataRef.where('email', '==', ROOT_ADMIN_EMAIL).get();

    if (snapshot.empty) {
      console.log('❌ No staffData document found for root@unza.zm');

      // Let's also check if there are any documents in staffData at all
      const allStaffSnapshot = await staffDataRef.limit(5).get();
      console.log(`📊 Found ${allStaffSnapshot.size} staff documents (showing first 5):`);

      allStaffSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - UID: ${doc.id}`);
        console.log(`    Email: ${data.email || 'N/A'}`);
        console.log(`    Role: ${data.role || 'N/A'}`);
        console.log(`    Is Root Admin: ${data.isRootAdmin || false}`);
        console.log(`    Full Name: ${data.fullName || 'N/A'}`);
        console.log('---');
      });
    } else {
      console.log(`✅ Found ${snapshot.size} staffData document(s) for root@unza.zm:`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - UID: ${doc.id}`);
        console.log(`    Email: ${data.email || 'N/A'}`);
        console.log(`    Role: ${data.role || 'N/A'}`);
        console.log(`    Is Root Admin: ${data.isRootAdmin || false}`);
        console.log(`    Email Verified: ${data.emailVerified || false}`);
        console.log(`    Approved: ${data.approved || 'N/A'}`);
        console.log(`    Must Reset Password: ${data.mustResetPassword || 'N/A'}`);
        console.log(`    Created At: ${data.createdAt || 'N/A'}`);
        console.log(`    Last Login: ${data.lastLogin || 'N/A'}`);
        console.log('---');
      });
    }

    // Also check if there are any admin role accounts
    console.log('\n🔍 Checking for all admin role accounts...');
    const adminSnapshot = await staffDataRef.where('role', '==', 'admin').get();
    console.log(`📊 Found ${adminSnapshot.size} admin role account(s):`);

    adminSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - UID: ${doc.id}`);
      console.log(`    Email: ${data.email || 'N/A'}`);
      console.log(`    Is Root Admin: ${data.isRootAdmin || false}`);
      console.log(`    Full Name: ${data.fullName || 'N/A'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
  } finally {
    // Clean up
    admin.app().delete();
  }
}

checkRootAdmin();