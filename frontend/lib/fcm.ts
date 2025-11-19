import { getMessaging, getToken as getFcmTokenNative, onMessage } from 'firebase/messaging'

export async function getFcmToken(vapidKey?: string) {
  try {
    const messaging = getMessaging()
    const currentToken = await getFcmTokenNative(messaging, { vapidKey })
    return currentToken
  } catch (err) {
    console.warn('FCM token error', err)
    return null
  }
}

export function onFcmMessage(cb: (payload: any) => void) {
  try {
    const messaging = getMessaging()
    onMessage(messaging, (payload) => cb(payload))
  } catch (err) {
    // ignore on server or if messaging not supported
  }
}
