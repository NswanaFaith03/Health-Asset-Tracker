import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

async function createAdminAccount(email) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      emailVerified: true, // Set to true to skip email verification
      password: 'defaultPassword123', // Set a default password
      displayName: 'Admin User',
      disabled: false
    });
    console.log('Successfully created new admin:', userRecord.uid);
  } catch (error) {
    console.error('Error creating new admin:', error);
  }
}

// Call the function with the provided email
const email = process.argv[2];
if (email) {
  createAdminAccount(email);
} else {
  console.error('Please provide an email address.');
}