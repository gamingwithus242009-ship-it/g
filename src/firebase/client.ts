import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => v == null || String(v).trim() === '')
  .map(([k]) => k)

/** True when all VITE_FIREBASE_* vars are non-empty */
export const firebaseConfigured = missingKeys.length === 0

export let firebaseInitError: string | null = null
export let firebaseApp: FirebaseApp | undefined
export let auth: Auth | null = null
export let db: Firestore | null = null
export let storage: FirebaseStorage | null = null

/** True when Firebase initialized successfully — app should not mount data providers until this is true */
export const firebaseReady: boolean = (() => {
  if (!firebaseConfigured) {
    firebaseInitError = `Missing or empty: ${missingKeys.join(', ')}. Copy .env.example to .env in the project root and paste your Firebase Web App config (Firebase Console → Project settings → Your apps).`
    return false
  }
  try {
    firebaseApp = initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    db = getFirestore(firebaseApp)
    storage = getStorage(firebaseApp)
    return true
  } catch (e) {
    firebaseInitError =
      e instanceof Error ? e.message : 'Firebase failed to initialize.'
    console.error('[Firebase]', e)
    return false
  }
})()
