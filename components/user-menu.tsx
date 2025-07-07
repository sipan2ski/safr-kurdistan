"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, Heart, LogOut, Bell, Calendar, Trash2 } from "lucide-react"
import { AuthService, type AuthState } from "@/lib/auth"
import { NotificationService, type Notification } from "@/lib/notification"
import type { Language } from "@/lib/translations"

interface UserMenuProps {
  language: Language
  onLoginClick: () => void
  onFavoritesClick: () => void
  onBookingsClick: () => void
}

export function UserMenu({ language, onLoginClick, onFavoritesClick, onBookingsClick }: UserMenuProps) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const authService = AuthService.getInstance()
  const notificationService = NotificationService.getInstance()

  useEffect(() => {
    setAuthState(authService.getAuthState())
    const unsubscribeAuth = authService.subscribe(setAuthState)

    if (authService.getAuthState().isAuthenticated) {
      loadNotifications()
      const unsubscribeNotifications = notificationService.subscribe(loadNotifications)
      return () => {
        unsubscribeAuth()
        unsubscribeNotifications()
      }
    }

    return unsubscribeAuth
  }, [])

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadNotifications()
      const unsubscribeNotifications = notificationService.subscribe(loadNotifications)
      return unsubscribeNotifications
    }
  }, [authState.isAuthenticated])

  const loadNotifications = () => {
    if (authState.user) {
      const userNotifications = notificationService.getUserNotifications(authState.user.id)
      setNotifications(userNotifications)
      setUnreadCount(notificationService.getUnreadCount(authState.user.id))
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const markNotificationAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
  }

  const deleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    notificationService.deleteNotification(notificationId)
  }

  const markAllAsRead = () => {
    if (authState.user) {
      notificationService.markAllAsRead(authState.user.id)
    }
  }

  if (!authState.isAuthenticated) {
    return (
      <Button
        onClick={onLoginClick}
        variant="outline"
        data-auth-trigger
        size="sm"
        className="text-xs sm:text-sm bg-transparent"
      >
        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden xs:inline">
          {language === "ar" ? "تسجيل الدخول" : language === "ku" ? "چوونەژوورەوە" : "Login"}
        </span>
        <span className="xs:hidden">{language === "ar" ? "دخول" : language === "ku" ? "ژوور" : "Login"}</span>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative bg-transparent p-2">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="font-medium">
              {language === "ar" ? "الإشعارات" : language === "ku" ? "ئاگادارکردنەوەکان" : "Notifications"}
            </span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                {language === "ar" ? "قراءة الكل" : language === "ku" ? "هەموو بخوێنەرەوە" : "Mark all read"}
              </Button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {language === "ar"
                  ? "لا توجد إشعارات"
                  : language === "ku"
                    ? "هیچ ئاگادارکردنەوەیەک نییە"
                    : "No notifications"}
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{notification.title}</span>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-100"
                          onClick={(e) => deleteNotification(notification.id, e)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm max-w-[120px] sm:max-w-none bg-transparent">
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{authState.user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onBookingsClick}>
            <Calendar className="w-4 h-4 mr-2" />
            {language === "ar" ? "حجوزاتي" : language === "ku" ? "حیجزکردنەکانم" : "My Bookings"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFavoritesClick}>
            <Heart className="w-4 h-4 mr-2" />
            {language === "ar" ? "المفضلة" : language === "ku" ? "دڵخوازەکان" : "Favorites"} (
            {authState.user?.favorites.length || 0})
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {language === "ar" ? "تسجيل الخروج" : language === "ku" ? "چوونەدەرەوە" : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
