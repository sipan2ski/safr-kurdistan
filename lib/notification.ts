"use client"

export interface Notification {
  id: string
  userId: string
  type: "booking_cancelled" | "booking_confirmed" | "discount_applied" | "general"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId?: string // booking ID, house ID, etc.
}

export class NotificationService {
  private static instance: NotificationService
  private listeners: ((notifications: Notification[]) => void)[] = []

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      const notifications = this.getAllNotifications()
      listener(notifications)
    })
  }

  getAllNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem("notifications") || "[]")
  }

  getUserNotifications(userId: string): Notification[] {
    const notifications = this.getAllNotifications()
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  getUnreadCount(userId: string): number {
    const userNotifications = this.getUserNotifications(userId)
    return userNotifications.filter((n) => !n.isRead).length
  }

  addNotification(notification: Omit<Notification, "id" | "createdAt">): { success: boolean; message: string } {
    try {
      const notifications = this.getAllNotifications()

      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      notifications.push(newNotification)
      localStorage.setItem("notifications", JSON.stringify(notifications))

      this.notifyListeners()
      return { success: true, message: "Notification sent successfully" }
    } catch (error) {
      return { success: false, message: "Failed to send notification" }
    }
  }

  markAsRead(notificationId: string): { success: boolean; message: string } {
    try {
      const notifications = this.getAllNotifications()
      const index = notifications.findIndex((n) => n.id === notificationId)

      if (index === -1) {
        return { success: false, message: "Notification not found" }
      }

      notifications[index].isRead = true
      localStorage.setItem("notifications", JSON.stringify(notifications))

      this.notifyListeners()
      return { success: true, message: "Notification marked as read" }
    } catch (error) {
      return { success: false, message: "Failed to mark notification as read" }
    }
  }

  markAllAsRead(userId: string): { success: boolean; message: string } {
    try {
      const notifications = this.getAllNotifications()
      const updated = notifications.map((n) => (n.userId === userId ? { ...n, isRead: true } : n))

      localStorage.setItem("notifications", JSON.stringify(updated))

      this.notifyListeners()
      return { success: true, message: "All notifications marked as read" }
    } catch (error) {
      return { success: false, message: "Failed to mark notifications as read" }
    }
  }

  deleteNotification(notificationId: string): { success: boolean; message: string } {
    try {
      const notifications = this.getAllNotifications()
      const filtered = notifications.filter((n) => n.id !== notificationId)

      if (notifications.length === filtered.length) {
        return { success: false, message: "Notification not found" }
      }

      localStorage.setItem("notifications", JSON.stringify(filtered))

      this.notifyListeners()
      return { success: true, message: "Notification deleted successfully" }
    } catch (error) {
      return { success: false, message: "Failed to delete notification" }
    }
  }
}
