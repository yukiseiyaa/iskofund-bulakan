import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const LOCAL_USER_KEY = 'iskofund_user';

export function getLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setLocalUser(user) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch (err) {
    console.error('Error saving user locally:', err);
  }
}

/**
 * Register a student with email & password via Firebase Auth
 */
export async function registerWithFirebase(email, password, displayName, phone = '') {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: displayName || userCredential.user.displayName || email.split('@')[0],
        phone: phone || '',
        isLoggedIn: true,
        authProvider: 'firebase'
      };
      setLocalUser(userObj);
      return { success: true, user: userObj };
    } catch (error) {
      console.warn('[Firebase Auth] Registration error, using local fallback:', error.message);
      // If Firebase Auth fails (e.g. network or unauthorized domain), fallback to local session
      const fallbackUser = {
        name: displayName || email.split('@')[0],
        email,
        phone,
        isLoggedIn: true,
        authProvider: 'local'
      };
      setLocalUser(fallbackUser);
      return { success: true, user: fallbackUser, warning: error.message };
    }
  }

  // Local-only mode
  const localUser = {
    name: displayName || email.split('@')[0],
    email,
    phone,
    isLoggedIn: true,
    authProvider: 'local'
  };
  setLocalUser(localUser);
  return { success: true, user: localUser };
}

/**
 * Log in student with email & password via Firebase Auth
 */
export async function loginWithFirebase(email, password) {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || email.split('@')[0],
        phone: '',
        isLoggedIn: true,
        authProvider: 'firebase'
      };
      setLocalUser(userObj);
      return { success: true, user: userObj };
    } catch (error) {
      console.warn('[Firebase Auth] Login error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Local fallback
  const localUser = {
    name: email.split('@')[0],
    email,
    isLoggedIn: true,
    authProvider: 'local'
  };
  setLocalUser(localUser);
  return { success: true, user: localUser };
}

/**
 * Log out user
 */
export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('[Firebase Auth] Sign out error:', error);
    }
  }
  setLocalUser(null);
}

/**
 * Listen to Auth state changes
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
          isLoggedIn: true,
          authProvider: 'firebase'
        };
        setLocalUser(userObj);
        callback(userObj);
      } else {
        const local = getLocalUser();
        if (local && local.authProvider !== 'firebase') {
          callback(local);
        } else {
          callback(null);
        }
      }
    });
  }

  // Local mode
  callback(getLocalUser());
  return () => {};
}

