/**
 * Script to call the cleanupTestData Cloud Function
 * Run with: node scripts/cleanup-test-data.js
 * 
 * Make sure you have Firebase CLI installed and are authenticated:
 * npm install -g firebase-tools
 * firebase login
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to download this from Firebase Console

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  // App might already be initialized
  console.log('Firebase Admin already initialized or error:', error.message);
}

const functions = admin.functions();

async function runCleanup() {
  console.log('🚀 Starting cleanup...\n');

  try {
    // Call the cleanup function
    const cleanupFunction = functions.httpsCallable('cleanupTestData');
    const result = await cleanupFunction({});

    console.log('✅ Cleanup completed successfully!\n');
    console.log('Results:');
    console.log(JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('❌ Error running cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
runCleanup()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

