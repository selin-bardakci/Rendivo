import { initializeApp, FirebaseApp, getApps } from 'firebase/app'
import { getDatabase, ref, onValue, DatabaseReference } from 'firebase/database'

let app: FirebaseApp | null = null

export function initFirebase() {
  if (typeof window === 'undefined') return
  if (!getApps().length) {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  }
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
