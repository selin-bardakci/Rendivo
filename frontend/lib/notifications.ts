import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  where,
  writeBatch,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseFirestore, getFirebaseMessaging, initFirebase } from './firebase'

export interface Notification {
  id: string
  userId: string
  type: 'appointment_booked' | 'appointment_cancelled_by_customer' | 'appointment_cancelled_by_business' | 
        'appointment_reminder_week' | 'appointment_reminder_day' | 'staff_added' | 'staff_removed' |
        'appointment_assigned' | 'appointment_assigned_cancelled'
  title: string
  message: string
  read: boolean
  createdAt: Date
  relatedId?: string
  relatedType?: 'appointment' | 'staff'
  actionUrl?: string
}

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    initFirebase()
    const messaging = getFirebaseMessaging()
    if (!messaging) return null

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error('VAPID key not found')
      return null
    }

    const token = await getToken(messaging, { vapidKey })
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const messaging = getFirebaseMessaging()
    if (!messaging) return () => {}

    return onMessage(messaging, callback)
  } catch (error) {
    console.error('Error setting up message listener:', error)
    return () => {}
  }
}

// Subscribe to user's notifications in real-time
export function subscribeToNotifications(
  userId: string, 
  callback: (notifications: Notification[]) => void
): () => void {
  const db = getFirebaseFirestore()
  if (!db) {
    console.error('Firestore not initialized')
    return () => {}
  }

  console.log('📡 Subscribing to notifications for user:', userId)

  const notificationsRef = collection(db, 'notifications', userId, 'items')
  const q = query(notificationsRef, orderBy('createdAt', 'desc'))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('📬 Received notifications snapshot:', snapshot.size, 'items')
    const notifications: Notification[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log('📄 Notification:', doc.id, data)
      notifications.push({
        id: doc.id,
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        actionUrl: data.actionUrl
      })
    })
    callback(notifications)
  }, (error) => {
    console.error('❌ Error subscribing to notifications:', error)
  })

  return unsubscribe
}

// Mark notification as read
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const db = getFirebaseFirestore()
    if (!db) return

    const notificationRef = doc(db, 'notifications', userId, 'items', notificationId)
    await updateDoc(notificationRef, {
      read: true
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Delete notification
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  try {
    const db = getFirebaseFirestore()
    if (!db) return

    const notificationRef = doc(db, 'notifications', userId, 'items', notificationId)
    await deleteDoc(notificationRef)
    console.log('🗑️ Notification deleted:', notificationId)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const db = getFirebaseFirestore()
    if (!db) return

    const notificationsRef = collection(db, 'notifications', userId, 'items')
    const q = query(notificationsRef, where('read', '==', false))
    
    const batch = writeBatch(db)
    const snapshot = await getDocs(q)
    
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// Get unread notification count
export function subscribeToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  const db = getFirebaseFirestore()
  if (!db) return () => {}

  const notificationsRef = collection(db, 'notifications', userId, 'items')
  const q = query(notificationsRef, where('read', '==', false))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size)
  })

  return unsubscribe
}

// Save FCM token to backend
export async function saveFCMToken(token: string): Promise<void> {
  try {
    const response = await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ fcmToken: token })
    })

    if (!response.ok) {
      throw new Error('Failed to save FCM token')
    }
  } catch (error) {
    console.error('Error saving FCM token:', error)
  }
}
