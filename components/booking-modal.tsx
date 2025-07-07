"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users } from "lucide-react"
import { BookingService } from "@/lib/booking"
import { AuthService } from "@/lib/auth"
import type { Language } from "@/lib/translations"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  house: any
  language: Language
}

export function BookingModal({ isOpen, onClose, house, language }: BookingModalProps) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const bookingService = BookingService.getInstance()
  const authService = AuthService.getInstance()

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    return days * house.price
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const user = authService.getAuthState().user
    if (!user) {
      setMessage("Please login to make a booking")
      setIsLoading(false)
      return
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setMessage("Check-out date must be after check-in date")
      setIsLoading(false)
      return
    }

    if (guests > house.guests) {
      setMessage(`Maximum ${house.guests} guests allowed`)
      setIsLoading(false)
      return
    }

    const result = await bookingService.createBooking({
      houseId: house.id.toString(),
      userId: user.id,
      checkIn,
      checkOut,
      guests,
      totalPrice: calculateTotalPrice(),
    })

    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onClose()
        setCheckIn("")
        setCheckOut("")
        setGuests(1)
        setMessage("")
      }, 2000)
    }

    setIsLoading(false)
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "حجز المنزل" : language === "ku" ? "حیجزکردنی خانوو" : "Book House"}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <h3 className="font-semibold">{house.title}</h3>
          <p className="text-sm text-muted-foreground">
            ${house.price} {house.period}
          </p>
        </div>

        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkin">
                <Calendar className="w-4 h-4 inline mr-1" />
                {language === "ar" ? "تاريخ الوصول" : language === "ku" ? "ڕۆژی گەیشتن" : "Check-in"}
              </Label>
              <Input
                id="checkin"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkout">
                <Calendar className="w-4 h-4 inline mr-1" />
                {language === "ar" ? "تاريخ المغادرة" : language === "ku" ? "ڕۆژی ڕۆیشتن" : "Check-out"}
              </Label>
              <Input
                id="checkout"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guests">
              <Users className="w-4 h-4 inline mr-1" />
              {language === "ar" ? "عدد الضيوف" : language === "ku" ? "ژمارەی میوان" : "Number of Guests"}
            </Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max={house.guests}
              value={guests}
              onChange={(e) => setGuests(Number.parseInt(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar"
                ? `الحد الأقصى ${house.guests} ضيوف`
                : language === "ku"
                  ? `زۆرترین ${house.guests} میوان`
                  : `Maximum ${house.guests} guests`}
            </p>
          </div>

          {checkIn && checkOut && (
            <div className="bg-muted p-3 rounded">
              <div className="flex justify-between">
                <span>{language === "ar" ? "المجموع:" : language === "ku" ? "کۆی گشتی:" : "Total:"}</span>
                <span className="font-semibold">${calculateTotalPrice()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                {language === "ar" ? "ليالي" : language === "ku" ? "شەو" : "nights"} × ${house.price}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? language === "ar"
                ? "جاري الحجز..."
                : language === "ku"
                  ? "حیجزکردن..."
                  : "Booking..."
              : language === "ar"
                ? "تأكيد الحجز"
                : language === "ku"
                  ? "حیجز پشتڕاستکردنەوە"
                  : "Confirm Booking"}
          </Button>
        </form>

        {message && (
          <div className={`text-center text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
