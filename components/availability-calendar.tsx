"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { BookingService, type Booking } from "@/lib/booking"
import type { Language } from "@/lib/translations"

interface AvailabilityCalendarProps {
  houseId: string
  language: Language
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isAvailable: boolean
  isBooked: boolean
  isPast: boolean
  bookingInfo?: Booking
}

export function AvailabilityCalendar({ houseId, language }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  const bookingService = BookingService.getInstance()

  useEffect(() => {
    loadBookings()
  }, [houseId])

  useEffect(() => {
    generateCalendar()
  }, [currentDate, bookings])

  const loadBookings = () => {
    const houseBookings = bookingService.getHouseBookings(houseId)
    setBookings(houseBookings)
  }

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get the first day of the calendar (might be from previous month)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // Get the last day of the calendar (might be from next month)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 41) // 6 weeks * 7 days - 1

    const days: CalendarDay[] = []
    const currentDateIter = new Date(startDate)

    while (currentDateIter <= endDate) {
      const dateStr = currentDateIter.toISOString().split("T")[0]
      const isCurrentMonth = currentDateIter.getMonth() === month
      const isToday = currentDateIter.getTime() === today.getTime()
      const isPast = currentDateIter < today

      // Check if this date is booked
      const booking = bookings.find((b) => {
        const checkIn = new Date(b.checkIn)
        const checkOut = new Date(b.checkOut)
        return currentDateIter >= checkIn && currentDateIter < checkOut && b.status !== "cancelled"
      })

      const isBooked = !!booking
      const isAvailable = !isBooked && !isPast && isCurrentMonth

      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth,
        isToday,
        isAvailable,
        isBooked,
        isPast,
        bookingInfo: booking,
      })

      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }

    setCalendarDays(days)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getMonthName = (date: Date) => {
    const months = {
      en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      ar: [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ],
      ku: [
        "کانوونی دووەم",
        "شوبات",
        "ئازار",
        "نیسان",
        "ئایار",
        "حوزەیران",
        "تەمووز",
        "ئاب",
        "ئەیلوول",
        "تشرینی یەکەم",
        "تشرینی دووەم",
        "کانوونی یەکەم",
      ],
    }
    return months[language][date.getMonth()]
  }

  const getDayNames = () => {
    const days = {
      en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
      ku: ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی", "شەممە"],
    }
    return days[language]
  }

  const getDayClass = (day: CalendarDay) => {
    let baseClass = "w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors relative"

    if (!day.isCurrentMonth) {
      baseClass += " text-gray-300"
    } else if (day.isPast) {
      baseClass += " text-gray-400 bg-gray-50"
    } else if (day.isBooked) {
      baseClass += " bg-red-100 text-red-800 font-medium"
    } else if (day.isAvailable) {
      baseClass += " bg-green-100 text-green-800 font-medium hover:bg-green-200"
    } else {
      baseClass += " text-gray-600"
    }

    if (day.isToday) {
      baseClass += " ring-2 ring-blue-500"
    }

    return baseClass
  }

  const getStatusIcon = (day: CalendarDay) => {
    if (day.isBooked) {
      return <XCircle className="w-3 h-3 absolute -top-1 -right-1 text-red-600" />
    } else if (day.isAvailable) {
      return <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
    } else if (day.isPast) {
      return <Clock className="w-3 h-3 absolute -top-1 -right-1 text-gray-400" />
    }
    return null
  }

  const getBookingStats = () => {
    const currentMonthDays = calendarDays.filter((day) => day.isCurrentMonth && !day.isPast)
    const availableDays = currentMonthDays.filter((day) => day.isAvailable).length
    const bookedDays = currentMonthDays.filter((day) => day.isBooked).length
    const totalDays = currentMonthDays.length

    return { availableDays, bookedDays, totalDays }
  }

  const stats = getBookingStats()
  const isRTL = language === "ar"

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {language === "ar" ? "تقويم التوفر" : language === "ku" ? "ڕۆژژمێری بەردەستی" : "Availability Calendar"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {getMonthName(currentDate)} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border"></div>
              <span>{language === "ar" ? "متاح" : language === "ku" ? "بەردەست" : "Available"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded border"></div>
              <span>{language === "ar" ? "محجوز" : language === "ku" ? "حیجزکراو" : "Booked"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded border"></div>
              <span>{language === "ar" ? "ماضي" : language === "ku" ? "ڕابردوو" : "Past"}</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {getDayNames().map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="relative">
                  <div className={getDayClass(day)}>
                    {day.date.getDate()}
                    {getStatusIcon(day)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.availableDays}</div>
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "أيام متاحة" : language === "ku" ? "ڕۆژی بەردەست" : "Available Days"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.bookedDays}</div>
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "أيام محجوزة" : language === "ku" ? "ڕۆژی حیجزکراو" : "Booked Days"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.availableDays > 0 ? Math.round((stats.availableDays / stats.totalDays) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "معدل التوفر" : language === "ku" ? "ڕێژەی بەردەستی" : "Availability Rate"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Bookings */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === "ar" ? "الحجوزات الحالية" : language === "ku" ? "حیجزکردنە ئێستاکان" : "Current Bookings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.guests} {language === "ar" ? "ضيوف" : language === "ku" ? "میوان" : "guests"} • $
                      {booking.totalPrice}
                    </div>
                  </div>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {booking.status === "confirmed"
                      ? language === "ar"
                        ? "مؤكد"
                        : language === "ku"
                          ? "پشتڕاستکراوە"
                          : "Confirmed"
                      : booking.status === "pending"
                        ? language === "ar"
                          ? "في الانتظار"
                          : language === "ku"
                            ? "چاوەڕوان"
                            : "Pending"
                        : language === "ar"
                          ? "ملغي"
                          : language === "ku"
                            ? "هەڵوەشاوە"
                            : "Cancelled"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
