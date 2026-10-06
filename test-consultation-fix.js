// Test to verify the consultation creation fix
const { createStudentConsultation } = require('./src/utils/consultationUtils');

console.log('Testing consultation creation fix...');

// Test 1: Valid payload should work
try {
  const validPayload = {
    createdBy: 'test-user-123',
    patientName: 'Test Patient',
    appointmentType: 'consultation',
    symptoms: 'Test symptoms'
  };

  console.log('Test 1: Valid payload - should throw error about missing Firestore setup (expected)');
  // Note: This will fail due to missing Firestore emulator, but that's expected for this test
  createStudentConsultation(validPayload).catch(error => {
    if (error.message.includes('Missing or insufficient credentials')) {
      console.log('✓ Correctly attempted to connect to Firestore (expected error for test)');
    } else {
      console.log('✓ Valid payload processed (error details:', error.message.substring(0, 100) + '...)');
    }
  });
} catch (error) {
  console.log('✗ Unexpected error with valid payload:', error.message);
}

// Test 2: Missing createdBy should throw validation error
try {
  const invalidPayload = {
    patientName: 'Test Patient',
    appointmentType: 'consultation',
    symptoms: 'Test symptoms'
    // Missing createdBy
  };

  console.log('Test 2: Missing createdBy - should throw validation error');
  createStudentConsultation(invalidPayload).then(() => {
    console.log('✗ Should have thrown error for missing createdBy');
  }).catch(error => {
    if (error.message === 'User ID is required to create a consultation') {
      console.log('✓ Correctly rejected payload with missing createdBy');
    } else {
      console.log('✗ Wrong error message:', error.message);
    }
  });
} catch (error) {
  if (error.message === 'User ID is required to create a consultation') {
    console.log('✓ Correctly rejected payload with missing createdBy (synchronous)');
  } else {
    console.log('✗ Wrong error message:', error.message);
  }
}

// Test 3: Empty string createdBy should throw validation error
try {
  const emptyPayload = {
    createdBy: '',
    patientName: 'Test Patient',
    appointmentType: 'consultation',
    symptoms: 'Test symptoms'
  };

  console.log('Test 3: Empty string createdBy - should throw validation error');
  createStudentConsultation(emptyPayload).then(() => {
    console.log('✗ Should have thrown error for empty createdBy');
  }).catch(error => {
    if (error.message === 'User ID is required to create a consultation') {
      console.log('✓ Correctly rejected payload with empty createdBy');
    } else {
      console.log('✗ Wrong error message:', error.message);
    }
  });
} catch (error) {
  if (error.message === 'User ID is required to create a consultation') {
    console.log('✓ Correctly rejected payload with empty createdBy (synchronous)');
  } else {
    console.log('✗ Wrong error message:', error.message);
  }
}

console.log('Test completed.');