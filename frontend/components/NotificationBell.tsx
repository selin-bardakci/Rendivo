import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
  subscribeToNotifications,
  subscribeToUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification
} from '../lib/notifications'
import styles from '../styles/notificationBell.module.css'

interface NotificationBellProps {
  userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Convert userId to string for Firestore
  const userIdStr = userId?.toString()

  console.log('🔔 NotificationBell rendered with userId:', userId, 'as string:', userIdStr)

  useEffect(() => {
    if (!userIdStr) {
      console.warn('⚠️ No userId provided to NotificationBell')
      return
    }

    console.log('🔔 Setting up notification subscriptions for user:', userIdStr)
    setLoading(true)

    // Subscribe to notifications
    const unsubscribeNotifs = subscribeToNotifications(userIdStr, (notifs) => {
      setNotifications(notifs.slice(0, 20)) // Show latest 20
      setLoading(false)
    })

    // Subscribe to unread count
    const unsubscribeCount = subscribeToUnreadCount(userIdStr, (count) => {
      setUnreadCount(count)
    })

    return () => {
      console.log('🔔 Cleaning up notification subscriptions')
      unsubscribeNotifs()
      unsubscribeCount()
    }
  }, [userIdStr])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read && userIdStr) {
      await markNotificationAsRead(userIdStr, notification.id)
    }

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }

    setIsOpen(false)
  }

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation() // Prevent triggering the notification click
    if (userIdStr) {
      await deleteNotification(userIdStr, notificationId)
    }
  }

  const handleMarkAllRead = async () => {
    if (userIdStr) {
      await markAllNotificationsAsRead(userIdStr)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment_booked':
        return '✓'
      case 'appointment_cancelled_by_customer':
      case 'appointment_cancelled_by_business':
      case 'appointment_assigned_cancelled':
        return '✕'
      case 'appointment_reminder_week':
      case 'appointment_reminder_day':
        return '⏰'
      case 'staff_added':
      case 'appointment_assigned':
        return '👤'
      case 'staff_removed':
        return '🗑️'
      default:
        return '•'
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={styles.notificationBell} ref={dropdownRef}>
      <button 
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Image 
          src="/ikonlar/ring.svg" 
          alt="Notifications" 
          width={24} 
          height={24}
          className={styles.bellIcon}
        />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className={styles.markAllRead}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unread : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                  <div className={styles.content}>
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.message}>{notification.message}</div>
                    <div className={styles.time}>
                      {getTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className={styles.unreadDot}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
