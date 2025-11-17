// IMPORTANT: This file is only used on the SERVER.
// It is essential for server-side rendering and server actions.

import * as admin from 'firebase-admin';

// This is a simplified and UNSAFE way to initialize for this specific environment.
// In a real-world application, you would use environment variables and a more
// secure method to load service account credentials.
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-3011907721-de151',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-bv4t6@studio-3011907721-de151.iam.gserviceaccount.com',
  // The private key is kept in an environment variable for security
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Check if essential credentials are provided
  if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
     throw new Error("Firebase Admin credentials are not configured. Check FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL environment variables.");
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.message);
    throw new Error('Firebase admin initialization failed.');
  }
}

export const adminApp = initializeAdminApp();
export const getAdminDB = () => admin.firestore();
