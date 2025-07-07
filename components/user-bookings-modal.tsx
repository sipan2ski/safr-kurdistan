"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, X, AlertTriangle } from "lucide-react"
import { BookingService, type Booking } from "@/lib/booking"
import { AuthService, type AuthState } from "@/lib/auth"
import { HouseDatabaseService } from "@/lib/house-database"
import type { Language } from "@/lib/translations"

interface UserBookingsModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

export function UserBookingsModal({ isOpen, onClose, language }: UserBookingsModalProps) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [message, setMessage] = useState("")

  const authService = AuthService.getInstance()
  const bookingService = BookingService.getInstance()
  const houseDatabaseService = HouseDatabaseService.getInstance()

  useEffect(() => {
    setAuthState(authService.getAuthState())
    const unsubscribe = authService.subscribe(setAuthState)
    loadBookings()
    return unsubscribe
  }, [])

  const loadBookings = () => {
    if (authState.user) {
      const userBookings = bookingService.getUserBookings(authState.user.id)
      setBookings(userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }

  const getHouseName = (houseId: string) => {
    const house = houseDatabaseService.getHouseById(houseId)
    return house?.title || "Unknown House"
  }

  const handleCancelBooking = (booking: Booking) => {
    const reason = prompt("Please enter cancellation reason (optional):")

    if (confirm("Are you sure you want to cancel this booking?")) {
      const result = bookingService.cancelBookingByUser(booking.id, authState.user!.id, reason || undefined)
      setMessage(result.message)

      if (result.success) {
        loadBookings()
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const canCancelBooking = (booking: Booking) => {
    return bookingService.canUserCancelBooking(booking)
  }

  const getDaysUntilCheckIn = (checkInDate: string) => {
    const checkIn = new Date(checkInDate)
    const today = new Date()
    return Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return language === "ar" ? "مؤكد" : language === "ku" ? "پشتڕاستکراوە" : "Confirmed"
      case "pending":
        return language === "ar" ? "في الانتظار" : language === "ku" ? "چاوەڕوان" : "Pending"
      case "cancelled":
        return language === "ar" ? "ملغي" : language === "ku" ? "هەڵوەشاوە" : "Cancelled"
      default:
        return status
    }
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {language === "ar" ? "حجوزاتي" : language === "ku" ? "حیجزکردنەکانم" : "My Bookings"} ({bookings.length})
          </DialogTitle>
        </DialogHeader>

        {message && (
          <div
            className={`text-center text-sm p-3 rounded mb-4 ${
              message.includes("success")
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === "ar" ? "لا توجد حجوزات" : language === "ku" ? "هیچ حیجزکردنێک نییە" : "No bookings yet"}
            </h3>
            <p className="text-gray-500">
              {language === "ar"
                ? "ابدأ بحجز منزل صيفي"
                : language === "ku"
                  ? "دەست بکە بە حیجزکردنی خانووی هاوینی"
                  : "Start by booking a summer house"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkIn)
              const canCancel = canCancelBooking(booking)

              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{getHouseName(booking.houseId)}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>Booking ID: {booking.id}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {language === "ar"
                              ? "تواريخ الإقامة"
                              : language === "ku"
                                ? "ڕۆژەکانی مانەوە"
                                : "Stay Dates"}
                          </span>
                        </div>
                        <p className="text-sm">
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil(
                            (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          {language === "ar" ? "ليالي" : language === "ku" ? "شەو" : "nights"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {language === "ar" ? "الضيوف والسعر" : language === "ku" ? "میوان و نرخ" : "Guests & Price"}
                          </span>
                        </div>
                        <p className="text-sm">
                          {booking.guests} {language === "ar" ? "ضيوف" : language === "ku" ? "میوان" : "guests"}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          ${booking.totalPrice}
                          {booking.originalPrice && booking.originalPrice !== booking.totalPrice && (
                            <span className="text-sm text-green-600 ml-2">
                              (${booking.discountApplied}{" "}
                              {language === "ar" ? "خصم" : language === "ku" ? "داشکاندن" : "discount"})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? "تم الحجز في" : language === "ku" ? "حیجزکراوە لە" : "Booked on"}:{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                        {booking.status === "cancelled" && booking.cancelledAt && (
                          <div className="text-red-600 mt-1">
                            {language === "ar" ? "ألغي في" : language === "ku" ? "هەڵوەشێندراوە لە" : "Cancelled on"}:{" "}
                            {new Date(booking.cancelledAt).toLocaleDateString()}
                            {booking.cancellationReason && (
                              <div className="mt-1">
                                {language === "ar" ? "السبب" : language === "ku" ? "هۆکار" : "Reason"}:{" "}
                                {booking.cancellationReason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status !== "cancelled" && (
                          <>
                            {daysUntilCheckIn > 7 ? (
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                <span>
                                  {language === "ar"
                                    ? `يمكن الإلغاء (${daysUntilCheckIn} أيام متبقية)`
                                    : language === "ku"
                                      ? `دەتوانرێت هەڵبوەشێنرێت (${daysUntilCheckIn} ڕۆژ ماوە)`
                                      : `Can cancel (${daysUntilCheckIn} days left)`}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>
                                  {language === "ar"
                                    ? `لا يمكن الإلغاء (${daysUntilCheckIn} أيام متبقية)`
                                    : language === "ku"
                                      ? `ناتوانرێت هەڵبوەشێنرێت (${daysUntilCheckIn} ڕۆژ ماوە)`
                                      : `Cannot cancel (${daysUntilCheckIn} days left)`}
                                </span>
                              </div>
                            )}

                            {canCancel && (
                              <Button size="sm" variant="destructive" onClick={() => handleCancelBooking(booking)}>
                                <X className="w-4 h-4 mr-1" />
                                {language === "ar" ? "إلغاء" : language === "ku" ? "هەڵوەشاندن" : "Cancel"}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
