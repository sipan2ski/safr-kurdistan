"use client"

import { NotificationService } from "./notification"

export interface Booking {
  id: string
  houseId: string
  userId: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  originalPrice?: number
  discountApplied?: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
}

export class BookingService {
  private static instance: BookingService

  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService()
    }
    return BookingService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSampleBookings()
    }
  }

  private initializeSampleBookings() {
    const existingBookings = localStorage.getItem("bookings")
    if (!existingBookings) {
      // Create some sample bookings for demonstration
      const sampleBookings: Booking[] = [
        {
          id: "booking-1",
          houseId: "house-1",
          userId: "user-1",
          checkIn: "2024-07-15",
          checkOut: "2024-07-20",
          guests: 4,
          totalPrice: 900,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "booking-2",
          houseId: "house-1",
          userId: "user-2",
          checkIn: "2024-07-25",
          checkOut: "2024-07-30",
          guests: 6,
          totalPrice: 900,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "booking-3",
          houseId: "house-2",
          userId: "user-3",
          checkIn: "2024-07-10",
          checkOut: "2024-07-15",
          guests: 3,
          totalPrice: 600,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "booking-4",
          houseId: "house-1",
          userId: "user-4",
          checkIn: "2024-08-05",
          checkOut: "2024-08-12",
          guests: 8,
          totalPrice: 1260,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        {
          id: "booking-5",
          houseId: "house-2",
          userId: "user-5",
          checkIn: "2024-08-15",
          checkOut: "2024-08-20",
          guests: 4,
          totalPrice: 600,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("bookings", JSON.stringify(sampleBookings))
    }
  }

  async createBooking(
    booking: Omit<Booking, "id" | "createdAt" | "status">,
  ): Promise<{ success: boolean; message: string; bookingId?: string }> {
    try {
      const newBooking: Booking = {
        ...booking,
        id: Date.now().toString(),
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      // Check if dates are available
      if (!this.isDateAvailable(booking.houseId, booking.checkIn, booking.checkOut)) {
        return { success: false, message: "Selected dates are not available" }
      }

      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      bookings.push(newBooking)
      localStorage.setItem("bookings", JSON.stringify(bookings))

      return { success: true, message: "Booking created successfully", bookingId: newBooking.id }
    } catch (error) {
      return { success: false, message: "Failed to create booking" }
    }
  }

  cancelBooking(bookingId: string, cancelledBy: string, reason?: string): { success: boolean; message: string } {
    try {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      const bookingIndex = bookings.findIndex((b: Booking) => b.id === bookingId)

      if (bookingIndex === -1) {
        return { success: false, message: "Booking not found" }
      }

      const booking = bookings[bookingIndex]

      if (booking.status === "cancelled") {
        return { success: false, message: "Booking is already cancelled" }
      }

      // Update booking status
      bookings[bookingIndex] = {
        ...booking,
        status: "cancelled" as const,
        cancelledAt: new Date().toISOString(),
        cancelledBy,
        cancellationReason: reason,
      }

      localStorage.setItem("bookings", JSON.stringify(bookings))

      // Send notification to user if cancelled by admin
      if (cancelledBy.startsWith("admin")) {
        const notificationService = NotificationService.getInstance()
        notificationService.addNotification({
          userId: booking.userId,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          message: `Your booking for ${booking.checkIn} to ${booking.checkOut} has been cancelled by the administrator. ${reason ? `Reason: ${reason}` : ""}`,
          isRead: false,
          relatedId: bookingId,
        })
      }

      return { success: true, message: "Booking cancelled successfully" }
    } catch (error) {
      return { success: false, message: "Failed to cancel booking" }
    }
  }

  cancelBookingByUser(bookingId: string, userId: string, reason?: string): { success: boolean; message: string } {
    try {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      const bookingIndex = bookings.findIndex((b: Booking) => b.id === bookingId)

      if (bookingIndex === -1) {
        return { success: false, message: "Booking not found" }
      }

      const booking = bookings[bookingIndex]

      if (booking.userId !== userId) {
        return { success: false, message: "You can only cancel your own bookings" }
      }

      if (booking.status === "cancelled") {
        return { success: false, message: "Booking is already cancelled" }
      }

      // Check if booking is more than 7 days away
      const checkInDate = new Date(booking.checkIn)
      const today = new Date()
      const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDifference <= 7) {
        return {
          success: false,
          message: "You can only cancel bookings that are more than 7 days away from the check-in date",
        }
      }

      // Update booking status
      bookings[bookingIndex] = {
        ...booking,
        status: "cancelled" as const,
        cancelledAt: new Date().toISOString(),
        cancelledBy: userId,
        cancellationReason: reason || "Cancelled by user",
      }

      localStorage.setItem("bookings", JSON.stringify(bookings))

      // Send notification to admin
      const notificationService = NotificationService.getInstance()
      notificationService.addNotification({
        userId: "admin-1", // Send to admin
        type: "booking_cancelled",
        title: "User Cancelled Booking",
        message: `A user has cancelled their booking for ${booking.checkIn} to ${booking.checkOut}. ${reason ? `Reason: ${reason}` : ""}`,
        isRead: false,
        relatedId: bookingId,
      })

      return { success: true, message: "Booking cancelled successfully" }
    } catch (error) {
      return { success: false, message: "Failed to cancel booking" }
    }
  }

  isDateAvailable(houseId: string, checkIn: string, checkOut: string): boolean {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const houseBookings = bookings.filter((b: Booking) => b.houseId === houseId && b.status !== "cancelled")

    const newCheckIn = new Date(checkIn)
    const newCheckOut = new Date(checkOut)

    return !houseBookings.some((booking: Booking) => {
      const existingCheckIn = new Date(booking.checkIn)
      const existingCheckOut = new Date(booking.checkOut)

      return (
        (newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut) ||
        (newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut) ||
        (newCheckIn <= existingCheckIn && newCheckOut >= existingCheckOut)
      )
    })
  }

  getUserBookings(userId: string): Booking[] {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    return bookings.filter((b: Booking) => b.userId === userId)
  }

  getHouseBookings(houseId: string): Booking[] {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    return bookings.filter((b: Booking) => b.houseId === houseId && b.status !== "cancelled")
  }

  getAllBookings(): Booking[] {
    return JSON.parse(localStorage.getItem("bookings") || "[]")
  }

  updateBookingStatus(bookingId: string, status: Booking["status"]): { success: boolean; message: string } {
    try {
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      const bookingIndex = bookings.findIndex((b: Booking) => b.id === bookingId)

      if (bookingIndex === -1) {
        return { success: false, message: "Booking not found" }
      }

      const booking = bookings[bookingIndex]
      bookings[bookingIndex].status = status
      localStorage.setItem("bookings", JSON.stringify(bookings))

      // Send notification to user
      if (status === "confirmed") {
        const notificationService = NotificationService.getInstance()
        notificationService.addNotification({
          userId: booking.userId,
          type: "booking_confirmed",
          title: "Booking Confirmed",
          message: `Your booking for ${booking.checkIn} to ${booking.checkOut} has been confirmed!`,
          isRead: false,
          relatedId: bookingId,
        })
      }

      return { success: true, message: "Booking status updated successfully" }
    } catch (error) {
      return { success: false, message: "Failed to update booking status" }
    }
  }

  canUserCancelBooking(booking: Booking): boolean {
    if (booking.status === "cancelled") return false

    const checkInDate = new Date(booking.checkIn)
    const today = new Date()
    const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return daysDifference > 7
  }
}
