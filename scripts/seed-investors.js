// Seed Investors Script
// Run this after setting up Firebase Admin SDK

const admin = require('firebase-admin');
const investors = require('../src/data/seed-investors.json');

// Initialize Firebase Admin
// Set GOOGLE_APPLICATION_CREDENTIALS environment variable to your service account key path
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('❌ Please set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.error('   Download service account key from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

async function seedInvestors() {
  try {
    console.log('🌱 Seeding investors to Firestore...');
    
    const batch = db.batch();
    const investorsRef = db.collection('investors');
    
    for (const investor of investors) {
      const docRef = investorsRef.doc();
      batch.set(docRef, investor);
    }
    
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${investors.length} investors to Firestore`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to Firebase Console > Firestore to verify the data');
    console.log('2. Start the app: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding investors:', error);
    process.exit(1);
  }
}

seedInvestors();
