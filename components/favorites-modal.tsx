"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Phone, MessageCircle, Star, Bed, Bath, Users, Car } from "lucide-react"
import { AuthService, type AuthState } from "@/lib/auth"
import { getTranslation, type Language } from "@/lib/translations"

interface FavoritesModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  houses: any[]
  onBookClick: (house: any) => void
}

export function FavoritesModal({ isOpen, onClose, language, houses, onBookClick }: FavoritesModalProps) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0)
  const authService = AuthService.getInstance()

  useEffect(() => {
    setAuthState(authService.getAuthState())
    const unsubscribe = authService.subscribe((newAuthState) => {
      setAuthState(newAuthState)
      setFavoritesUpdateTrigger((prev) => prev + 1)
    })
    return unsubscribe
  }, [])

  // Re-calculate favorites when trigger changes
  const favoriteHouses = houses.filter((house) => authState.user?.favorites.includes(house.id.toString()))

  const removeFavorite = (houseId: string) => {
    authService.removeFromFavorites(houseId)
    setFavoritesUpdateTrigger((prev) => prev + 1)
  }

  const openWhatsApp = (phone: string, houseName: string) => {
    const message = encodeURIComponent(getTranslation(language, "whatsappMessage").replace("{houseName}", houseName))
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank")
  }

  const openGoogleMaps = (location: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&t=m`
    window.open(url, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {language === "ar" ? "المنازل المفضلة" : language === "ku" ? "خانووە دڵخوازەکان" : "Favorite Houses"} (
            {favoriteHouses.length})
          </DialogTitle>
        </DialogHeader>

        {favoriteHouses.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === "ar"
                ? "لا توجد منازل مفضلة"
                : language === "ku"
                  ? "هیچ خانووی دڵخوازت نییە"
                  : "No favorite houses yet"}
            </h3>
            <p className="text-gray-500">
              {language === "ar"
                ? "ابدأ بإضافة منازل إلى قائمة المفضلة"
                : language === "ku"
                  ? "دەست بکە بە زیادکردنی خانووەکان بۆ دڵخوازەکان"
                  : "Start adding houses to your favorites"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteHouses.map((house) => (
              <Card key={house.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={house.images[0] || "/placeholder.svg"}
                    alt={house.title}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">{house.area}</Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 left-2 transition-all duration-200 hover:scale-105"
                    onClick={() => removeFavorite(house.id.toString())}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm">{house.title}</CardTitle>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">${house.price}</div>
                      <div className="text-xs text-muted-foreground">{house.period}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-xs font-medium">{house.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({house.reviews} {getTranslation(language, "reviews")})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {house.bedrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {house.bathrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {house.guests}
                    </div>
                    {house.parking && (
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex gap-1 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs bg-transparent"
                      onClick={() => openGoogleMaps(house.mapLocation)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {getTranslation(language, "viewMap")}
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => window.open(`tel:${house.phone}`, "_self")}>
                      <Phone className="w-3 h-3" />
                    </Button>

                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs"
                      onClick={() => openWhatsApp(house.whatsapp, house.title)}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {getTranslation(language, "whatsapp")}
                    </Button>
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      onBookClick(house)
                      onClose()
                    }}
                  >
                    {language === "ar" ? "احجز الآن" : language === "ku" ? "ئێستا حیجز بکە" : "Book Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
