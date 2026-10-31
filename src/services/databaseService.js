import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const APPLICATIONS_COLLECTION = 'applications';
const LOCAL_STORAGE_APPS_KEY = 'iskofund_portal_apps';

/**
 * Helper to get local applications fallback
 */
function getLocalApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading local applications:', err);
    return {};
  }
}

/**
 * Helper to set local applications fallback
 */
function setLocalApplications(apps) {
  try {
    localStorage.setItem(LOCAL_STORAGE_APPS_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Error writing local applications:', err);
  }
}

/**
 * Save a new student application to Firebase Firestore (and local fallback)
 */
export async function saveApplication(applicationData) {
  const code = applicationData.code || ('ISKO-BUL-' + Math.floor(1000 + Math.random() * 9000));
  const record = {
    ...applicationData,
    code,
    createdAt: new Date().toISOString(),
    status: applicationData.status || 'SUBMITTED',
    stage: applicationData.stage || 'Submitted',
  };

  // Always update local cache
  const localApps = getLocalApplications();
  localApps[code] = record;
  setLocalApplications(localApps);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, APPLICATIONS_COLLECTION, code);
      await setDoc(docRef, {
        ...record,
        firestoreTimestamp: serverTimestamp()
      }, { merge: true });
      console.log(`[Firestore] Successfully saved application ${code}`);
      return { success: true, code, source: 'firebase' };
    } catch (error) {
      console.error(`[Firestore] Failed to save application ${code}:`, error);
      return { success: true, code, source: 'local_fallback', error: error.message };
    }
  }

  return { success: true, code, source: 'local' };
}

/**
 * Fetch an application by its reference tracking code
 */
export async function getApplicationByTrackingCode(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) return null;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, APPLICATIONS_COLLECTION, cleanCode);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (error) {
      console.warn(`[Firestore] Lookup failed for ${cleanCode}, checking local storage:`, error);
    }
  }

  // Fallback to local storage
  const localApps = getLocalApplications();
  return localApps[cleanCode] || null;
}

/**
 * Subscribe to real-time applications updates
 * Callback receives an array/map of all applications
 */
export function subscribeToApplications(callback) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, APPLICATIONS_COLLECTION));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsMap = {};
        snapshot.forEach((docSnap) => {
          appsMap[docSnap.id] = docSnap.data();
        });

        // Merge with local storage to ensure no data is lost
        const localApps = getLocalApplications();
        const merged = { ...localApps, ...appsMap };
        callback(merged, 'firebase');
      }, (error) => {
        console.warn('[Firestore] Real-time subscription error, using local data:', error);
        callback(getLocalApplications(), 'local');
      });

      return unsubscribe;
    } catch (err) {
      console.warn('[Firestore] Could not establish real-time listener:', err);
    }
  }

  // If not configured, immediately invoke callback with local data
  callback(getLocalApplications(), 'local');
  return () => {}; // No-op unsubscribe
}

/**
 * Update an application status (e.g. from Admin Dashboard or review board)
 */
export async function updateApplicationStatus(code, updates) {
  const localApps = getLocalApplications();
  if (localApps[code]) {
    localApps[code] = { ...localApps[code], ...updates, updatedAt: new Date().toISOString() };
    setLocalApplications(localApps);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, APPLICATIONS_COLLECTION, code);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error(`[Firestore] Failed to update application ${code}:`, error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

/**
 * Seed initial students cohort to Firestore if the collection is currently empty
 */
export async function seedInitialCohortIfEmpty(initialStudents) {
  if (!isFirebaseConfigured || !db || !Array.isArray(initialStudents) || initialStudents.length === 0) {
    return false;
  }

  try {
    const snap = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    if (snap.empty) {
      console.log('[Firestore] Collection is empty. Seeding initial student cohort...');
      const batch = writeBatch(db);
      initialStudents.slice(0, 20).forEach((student) => {
        const docRef = doc(db, APPLICATIONS_COLLECTION, student.id);
        batch.set(docRef, {
          ...student,
          seededAt: serverTimestamp()
        });
      });
      await batch.commit();
      console.log('[Firestore] Successfully seeded initial student cohort.');
      return true;
    }
  } catch (error) {
    console.warn('[Firestore] Seeding check skipped or failed:', error);
  }
  return false;
}

