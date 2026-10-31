import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if Firebase configuration has valid credentials
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  firebaseConfig.apiKey.trim() !== ''
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('[Firebase] Successfully connected to Firebase project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err);
  }
} else {
  console.info('[Firebase] Config keys not detected. Running in Local Database / Offline Fallback mode. Add VITE_FIREBASE_* in .env to connect to your live Firebase Cloud Firestore.');
}

export { app, db, auth, firebaseConfig };

