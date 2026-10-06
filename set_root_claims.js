// Run with: firebase emulators:exec 'node set_root_claims.js' --project=lifeclinic2026-e486b

const admin = require('firebase-admin');

const uid = 'wEkYJtynWgfbmPRAfJbDxcCX52p1';
const customClaims = {
  role: 'admin',
  isRootAdmin: true
};

admin.auth().setCustomUserClaims(uid, customClaims)
  .then(() => {
    console.log(`✅ Custom claims set for user ${uid}`);
    console.log('Claims:', customClaims);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error setting custom claims:', error);
    process.exit(1);
  });
