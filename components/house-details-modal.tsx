"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Bed,
  Bath,
  Users,
  Car,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Wifi,
  Wind,
  ChefHat,
  Trees,
  Mountain,
  Utensils,
} from "lucide-react"
import { getTranslation, type Language } from "@/lib/translations"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { ReviewSection } from "@/components/review-section"

interface HouseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  house: any
  language: Language
  onBookClick: (house: any) => void
  onWhatsAppClick: (phone: string, houseName: string) => void
  onMapClick: (location: { lat: number; lng: number }) => void
}

export function HouseDetailsModal({
  isOpen,
  onClose,
  house,
  language,
  onBookClick,
  onWhatsAppClick,
  onMapClick,
}: HouseDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % house.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + house.images.length) % house.images.length)
  }

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes("wifi")) return <Wifi className="w-4 h-4" />
    if (amenityLower.includes("ac") || amenityLower.includes("air")) return <Wind className="w-4 h-4" />
    if (amenityLower.includes("kitchen")) return <ChefHat className="w-4 h-4" />
    if (amenityLower.includes("garden")) return <Trees className="w-4 h-4" />
    if (amenityLower.includes("mountain") || amenityLower.includes("view")) return <Mountain className="w-4 h-4" />
    if (amenityLower.includes("bbq")) return <Utensils className="w-4 h-4" />
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />
  }

  const isRTL = language === "ar"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Image Slider */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img
              src={house.images[currentImageIndex] || "/placeholder.svg"}
              alt={`${house.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {house.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {house.images.map((_: any, index: number) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Status Badge */}
            <Badge className={`absolute top-4 left-4 ${house.available ? "bg-green-600" : "bg-red-600"}`}>
              {house.available
                ? language === "ar"
                  ? "متاح"
                  : language === "ku"
                    ? "بەردەست"
                    : "Available"
                : language === "ar"
                  ? "محجوز"
                  : language === "ku"
                    ? "حیجزکراو"
                    : "Booked"}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
            <DialogHeader className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl mb-2">{house.title}</DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {house.area}, {house.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{house.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({house.reviews} {getTranslation(language, "reviews")})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">${house.price}</div>
                  <div className="text-sm text-muted-foreground">{house.period}</div>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  {language === "ar" ? "نظرة عامة" : language === "ku" ? "گشتی" : "Overview"}
                </TabsTrigger>
                <TabsTrigger value="amenities">
                  {language === "ar" ? "المرافق" : language === "ku" ? "ئامرازەکان" : "Amenities"}
                </TabsTrigger>
                <TabsTrigger value="availability">
                  {language === "ar" ? "التوفر" : language === "ku" ? "بەردەستی" : "Availability"}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  {language === "ar" ? "التقييمات" : language === "ku" ? "هەڵسەنگاندنەکان" : "Reviews"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="flex items-center gap-2 p-4">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{house.bedrooms}</div>
                        <div className="text-xs text-muted-foreground">{getTranslation(language, "beds")}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-2 p-4">
                      <Bath className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{house.bathrooms}</div>
                        <div className="text-xs text-muted-foreground">{getTranslation(language, "baths")}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-2 p-4">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{house.guests}</div>
                        <div className="text-xs text-muted-foreground">{getTranslation(language, "guests")}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {house.parking && (
                    <Card>
                      <CardContent className="flex items-center gap-2 p-4">
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {language === "ar" ? "نعم" : language === "ku" ? "بەڵێ" : "Yes"}
                          </div>
                          <div className="text-xs text-muted-foreground">{getTranslation(language, "parking")}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {language === "ar" ? "الوصف" : language === "ku" ? "وەسف" : "Description"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{house.description}</p>
                </div>

                {/* Contact Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    {language === "ar"
                      ? "معلومات الاتصال"
                      : language === "ku"
                        ? "زانیاری پەیوەندی"
                        : "Contact Information"}
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{house.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3 h-3" />
                      <span>{house.whatsapp}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4">
                {house.amenities && house.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {house.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === "ar"
                      ? "لا توجد مرافق محددة"
                      : language === "ku"
                        ? "هیچ ئامرازێکی دیاریکراو نییە"
                        : "No specific amenities listed"}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="availability" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {language === "ar"
                      ? "التوفر والحجوزات"
                      : language === "ku"
                        ? "بەردەستی و حیجزکردن"
                        : "Availability & Bookings"}
                  </h3>
                  <AvailabilityCalendar houseId={house.id.toString()} language={language} />
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="space-y-4">
                <ReviewSection
                  houseId={house.id.toString()}
                  language={language}
                  onAuthRequired={() => {
                    onClose()
                    // This will trigger the auth modal in the parent component
                    setTimeout(() => {
                      const authButton = document.querySelector("[data-auth-trigger]")
                      if (authButton) {
                        ;(authButton as HTMLElement).click()
                      }
                    }, 100)
                  }}
                />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="flex-1 min-w-[120px] bg-transparent"
                  onClick={() => onMapClick(house.mapLocation)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {getTranslation(language, "viewMap")}
                </Button>

                <Button variant="outline" onClick={() => window.open(`tel:${house.phone}`, "_self")}>
                  <Phone className="w-4 h-4 mr-2" />
                  {language === "ar" ? "اتصال" : language === "ku" ? "پەیوەندی" : "Call"}
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onWhatsAppClick(house.whatsapp, house.title)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {getTranslation(language, "whatsapp")}
                </Button>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!house.available}
                onClick={() => {
                  onBookClick(house)
                  onClose()
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {house.available
                  ? language === "ar"
                    ? "احجز الآن"
                    : language === "ku"
                      ? "ئێستا حیجز بکە"
                      : "Book Now"
                  : language === "ar"
                    ? "غير متاح"
                    : language === "ku"
                      ? "بەردەست نییە"
                      : "Not Available"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
