import { initializeApp, FirebaseApp, getApps } from 'firebase/app'
import { getDatabase, ref, onValue, DatabaseReference } from 'firebase/database'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getMessaging, Messaging } from 'firebase/messaging'
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  OAuthProvider,
  Auth,
  UserCredential
} from 'firebase/auth'

let app: FirebaseApp | null = null

export function initFirebase() {
  if (typeof window === 'undefined') return
  if (!getApps().length) {
    console.log('🔥 Initializing Firebase...')
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
    console.log('✅ Firebase initialized successfully')
  } else {
    console.log('🔥 Firebase already initialized')
  }
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined' || !app) return null
  return getAuth(app)
}

export function getFirebaseFirestore(): Firestore | null {
  if (typeof window === 'undefined' || !app) {
    console.warn('⚠️ Firestore: window or app not available')
    return null
  }
  try {
    const db = getFirestore(app)
    console.log('✅ Firestore instance retrieved')
    return db
  } catch (error) {
    console.error('❌ Error getting Firestore:', error)
    return null
  }
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined' || !app) return null
  try {
    return getMessaging(app)
  } catch (error) {
    console.warn('Messaging not supported:', error)
    return null
  }
}

// Google Sign-In
export async function signInWithGoogle(): Promise<UserCredential> {
  initFirebase()
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')
  
  const provider = new GoogleAuthProvider()
  return await signInWithPopup(auth, provider)
}

// Facebook Sign-In
export async function signInWithFacebook(): Promise<UserCredential> {
  initFirebase()
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')
  
  const provider = new FacebookAuthProvider()
  return await signInWithPopup(auth, provider)
}

// Apple Sign-In
export async function signInWithApple(): Promise<UserCredential> {
  initFirebase()
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')
  
  const provider = new OAuthProvider('apple.com')
  return await signInWithPopup(auth, provider)
}

export function subscribeToPath(path: string, cb: (data: any) => void) {
  if (typeof window === 'undefined') return () => {}
  const db = getDatabase()
  const r = ref(db, path)
  // onValue returns an unsubscribe function; return it so callers can detach.
  const unsubscribe = onValue(r, (snapshot) => {
    cb(snapshot.val())
  })
  return unsubscribe
}
