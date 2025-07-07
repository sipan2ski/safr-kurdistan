"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  MapPin,
  Phone,
  MessageCircle,
  Filter,
  Star,
  Bed,
  Bath,
  Users,
  Car,
  Heart,
  Calendar,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { UserMenu } from "@/components/user-menu"
import { AuthModal } from "@/components/auth-modal"
import { BookingModal } from "@/components/booking-modal"
import { FavoritesModal } from "@/components/favorites-modal"
import { getTranslation, type Language } from "@/lib/translations"
import { AuthService, type AuthState } from "@/lib/auth"
import { HouseDatabaseService } from "@/lib/house-database"
import { DiscountService } from "@/lib/discount"
import { HouseDetailsModal } from "@/components/house-details-modal"
import { UserBookingsModal } from "@/components/user-bookings-modal"
import { SiteSettingsService } from "@/lib/site-settings"

const getAreas = (lang: Language) => [
  getTranslation(lang, "allAreas"),
  getTranslation(lang, "zawita"),
  getTranslation(lang, "sarsing"),
  getTranslation(lang, "mangesh"),
  getTranslation(lang, "amedi"),
  getTranslation(lang, "deralok"),
  getTranslation(lang, "barzan"),
  getTranslation(lang, "rezan"),
  getTranslation(lang, "akre"),
]

const getCities = (lang: Language) => [
  getTranslation(lang, "allCities"),
  getTranslation(lang, "duhok"),
  getTranslation(lang, "erbil"),
  getTranslation(lang, "sulaymaniyah"),
]

export default function HouseBookingPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [searchArea, setSearchArea] = useState(getTranslation(language, "allAreas"))
  const [searchCity, setSearchCity] = useState(getTranslation(language, "allCities"))
  const [priceSort, setPriceSort] = useState("none")
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<any>(null)
  const [showHouseDetails, setShowHouseDetails] = useState(false)
  const [selectedHouseForDetails, setSelectedHouseForDetails] = useState<any>(null)
  const [showUserBookings, setShowUserBookings] = useState(false)

  // Auth states
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })

  // Houses from database
  const [houses, setHouses] = useState<any[]>([])

  // Force re-render for favorites
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0)

  const authService = AuthService.getInstance()
  const houseDatabaseService = HouseDatabaseService.getInstance()
  const discountService = DiscountService.getInstance()
  const siteSettingsService = SiteSettingsService.getInstance()

  useEffect(() => {
    // Load auth states
    setAuthState(authService.getAuthState())

    // Subscribe to auth changes
    const unsubscribeAuth = authService.subscribe((newAuthState) => {
      setAuthState(newAuthState)
      // Trigger favorites update when auth state changes
      setFavoritesUpdateTrigger((prev) => prev + 1)
    })

    // Load houses from database
    loadHouses()

    return () => {
      unsubscribeAuth()
    }
  }, [])

  // Re-render when favorites change
  useEffect(() => {
    // This effect runs when favoritesUpdateTrigger changes
    // It forces the component to re-evaluate favorite states
  }, [favoritesUpdateTrigger])

  const loadHouses = () => {
    const dbHouses = houseDatabaseService.getAllHouses()
    // Convert database houses to display format with discount calculation
    const displayHouses = dbHouses.map((house) => {
      const { price: discountedPrice, discount } = discountService.calculateDiscountedPrice(house.price, house.id)

      return {
        id: house.id,
        title: house.title,
        area: house.area,
        city: house.city,
        price: discountedPrice,
        originalPrice: discount ? house.price : undefined,
        discount: discount,
        currency: house.currency,
        period: getTranslation(language, "perNight"),
        rating: house.rating,
        reviews: house.reviews,
        bedrooms: house.bedrooms,
        bathrooms: house.bathrooms,
        guests: house.guests,
        parking: house.parking,
        available: house.available,
        images: house.images,
        description: house.description,
        amenities: house.amenities,
        phone: house.phone,
        whatsapp: house.whatsapp,
        mapLocation: house.mapLocation,
      }
    })
    setHouses(displayHouses)
  }

  const areas = getAreas(language)
  const cities = getCities(language)

  // Update search values when language changes
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setSearchArea(getTranslation(newLang, "allAreas"))
    setSearchCity(getTranslation(newLang, "allCities"))
  }

  // Filter and sort houses
  const filteredAndSortedHouses = useMemo(() => {
    const filtered = houses.filter((house) => {
      const areaMatch = searchArea === getTranslation(language, "allAreas") || house.area === searchArea
      const cityMatch = searchCity === getTranslation(language, "allCities") || house.city === searchCity
      const availabilityMatch = !showAvailableOnly || house.available
      return areaMatch && cityMatch && availabilityMatch
    })

    if (priceSort === "low-to-high") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (priceSort === "high-to-low") {
      filtered.sort((a, b) => b.price - a.price)
    }

    return filtered
  }, [houses, searchArea, searchCity, priceSort, showAvailableOnly, language])

  const toggleFavorite = (houseId: string) => {
    if (!authState.isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (authService.isFavorite(houseId)) {
      authService.removeFromFavorites(houseId)
    } else {
      authService.addToFavorites(houseId)
    }

    // Trigger immediate re-render
    setFavoritesUpdateTrigger((prev) => prev + 1)
  }

  // Function to check if house is favorite (with real-time updates)
  const isHouseFavorite = (houseId: string) => {
    // This will be re-evaluated when favoritesUpdateTrigger changes
    return authService.isFavorite(houseId)
  }

  const handleBookClick = (house: any) => {
    if (!authState.isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    setSelectedHouse(house)
    setShowBookingModal(true)
  }

  const openWhatsApp = (phone: string, houseName: string) => {
    const message = encodeURIComponent(getTranslation(language, "whatsappMessage").replace("{houseName}", houseName))
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank")
  }

  const openGoogleMaps = (location: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&t=m`
    window.open(url, "_blank")
  }

  const handleViewDetails = (house: any) => {
    setSelectedHouseForDetails(house)
    setShowHouseDetails(true)
  }

  // RTL support for Arabic
  const isRTL = language === "ar"
  const directionClass = isRTL ? "rtl" : "ltr"

  return (
    <div className={`min-h-screen bg-background ${directionClass}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Logo with Kurdistan flag and mountains */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 via-white to-green-500 flex items-center justify-center shadow-lg border-2 border-white">
                  {/* Kurdistan flag colors with mountain silhouette */}
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    {/* Flag stripes */}
                    <div className="absolute top-0 w-full h-1/3 bg-red-500"></div>
                    <div className="absolute top-1/3 w-full h-1/3 bg-white"></div>
                    <div className="absolute bottom-0 w-full h-1/3 bg-green-500"></div>

                    {/* Mountain silhouette overlay */}
                    <div className="absolute inset-0 flex items-end justify-center">
                      <svg viewBox="0 0 40 20" className="w-full h-1/2 text-gray-700 opacity-60" fill="currentColor">
                        <path d="M0,20 L8,8 L12,12 L16,6 L20,10 L24,4 L28,8 L32,6 L36,10 L40,8 L40,20 Z" />
                      </svg>
                    </div>

                    {/* Sun symbol */}
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate">
                  {siteSettingsService.getSiteTitle(language)}
                </h1>
                {/* Hide description on small screens */}
                <div className="text-xs text-muted-foreground hidden md:block">
                  {siteSettingsService.getHeaderDescription(language)}
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
              <UserMenu
                language={language}
                onLoginClick={() => setShowAuthModal(true)}
                onFavoritesClick={() => setShowFavoritesModal(true)}
                onBookingsClick={() => setShowUserBookings(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.4) contrast(1.1)" }}
          >
            <source src={siteSettingsService.getHeroVideoUrl()} type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <div className="w-full h-full bg-gradient-to-r from-slate-600 to-slate-800"></div>
          </video>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">
              {siteSettingsService.getHeroTitle(language)}
            </h2>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              {siteSettingsService.getHeroSubtitle(language)}
            </p>
          </div>

          {/* Search Box with enhanced styling */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 md:p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getTranslation(language, "searchCity")}
                </label>
                <Select value={searchCity} onValueChange={setSearchCity}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900">
                    <SelectValue>{searchCity}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city} className="text-gray-900 hover:bg-gray-100 cursor-pointer">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getTranslation(language, "searchArea")}
                </label>
                <Select value={searchArea} onValueChange={setSearchArea}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900">
                    <SelectValue>{searchArea}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {areas.map((area) => (
                      <SelectItem key={area} value={area} className="text-gray-900 hover:bg-gray-100 cursor-pointer">
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getTranslation(language, "sortPrice")}
                </label>
                <Select value={priceSort} onValueChange={setPriceSort}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-900">
                    <SelectValue>
                      {priceSort === "none" && getTranslation(language, "noSorting")}
                      {priceSort === "low-to-high" && getTranslation(language, "priceLowHigh")}
                      {priceSort === "high-to-low" && getTranslation(language, "priceHighLow")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="none" className="text-gray-900 hover:bg-gray-100 cursor-pointer">
                      {getTranslation(language, "noSorting")}
                    </SelectItem>
                    <SelectItem value="low-to-high" className="text-gray-900 hover:bg-gray-100 cursor-pointer">
                      {getTranslation(language, "priceLowHigh")}
                    </SelectItem>
                    <SelectItem value="high-to-low" className="text-gray-900 hover:bg-gray-100 cursor-pointer">
                      {getTranslation(language, "priceHighLow")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={loadHouses}>
                  <Search className="w-4 h-4 mr-2" />
                  {getTranslation(language, "searchButton")}
                </Button>
              </div>
            </div>

            {/* Available Only Filter */}
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="available-only"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="available-only" className="text-sm text-gray-700">
                {language === "ar"
                  ? "إظهار المتاح فقط"
                  : language === "ku"
                    ? "تەنها بەردەستەکان پیشان بدە"
                    : "Show available only"}
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {getTranslation(language, "availableHouses")} ({filteredAndSortedHouses.length}{" "}
              {getTranslation(language, "housesFound")})
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              {getTranslation(language, "filteredBy")}{" "}
              {searchCity !== getTranslation(language, "allCities") && searchCity}
              {searchArea !== getTranslation(language, "allAreas") && `, ${searchArea}`}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAndSortedHouses.map((house) => {
              const isFavorite = isHouseFavorite(house.id.toString())

              return (
                <Card key={house.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={house.images[0] || "/placeholder.svg"}
                      alt={house.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className={`absolute top-2 right-2 ${house.available ? "bg-green-600" : "bg-red-600"}`}>
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
                    {house.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {house.discount.discountType === "percentage"
                          ? `${house.discount.discountValue}% OFF`
                          : `$${house.discount.discountValue} OFF`}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={isFavorite ? "default" : "secondary"}
                      className={`absolute bottom-2 left-2 transition-all duration-200 ${
                        isFavorite
                          ? "bg-red-500 hover:bg-red-600 text-white shadow-lg scale-105"
                          : "bg-white/80 hover:bg-white text-gray-700"
                      }`}
                      onClick={() => toggleFavorite(house.id.toString())}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-200 ${
                          isFavorite ? "fill-current text-white" : "text-gray-600"
                        }`}
                      />
                    </Button>
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base md:text-lg">{house.title}</CardTitle>
                      <div className="text-right">
                        <div className="flex flex-col items-end">
                          {house.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${house.originalPrice}</span>
                          )}
                          <div className="text-xl md:text-2xl font-bold text-primary">${house.price}</div>
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">{house.period}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">{house.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({house.reviews} {getTranslation(language, "reviews")})
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {house.bedrooms} {getTranslation(language, "beds")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {house.bathrooms} {getTranslation(language, "baths")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {house.guests} {getTranslation(language, "guests")}
                      </div>
                      {house.parking && (
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {getTranslation(language, "parking")}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="mb-4 text-sm">{house.description}</CardDescription>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {house.amenities.slice(0, 3).map((amenity: string) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {house.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{house.amenities.length - 3} {getTranslation(language, "more")}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent text-xs"
                        onClick={() => openGoogleMaps(house.mapLocation)}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        {getTranslation(language, "viewMap")}
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => window.open(`tel:${house.phone}`, "_self")}>
                        <Phone className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs"
                        onClick={() => openWhatsApp(house.whatsapp, house.title)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {getTranslation(language, "whatsapp")}
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-2 bg-transparent"
                      onClick={() => handleViewDetails(house)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {language === "ar" ? "عرض التفاصيل" : language === "ku" ? "وردەکارییەکان ببینە" : "View Details"}
                    </Button>

                    <Button
                      className="w-full"
                      size="sm"
                      disabled={!house.available}
                      onClick={() => handleBookClick(house)}
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
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredAndSortedHouses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{getTranslation(language, "noHousesFound")}</h3>
              <p className="text-gray-500">{getTranslation(language, "adjustSearch")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-muted/50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              {getTranslation(language, "whyKurdistan")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏔️</div>
              <h4 className="text-lg font-semibold mb-2">{getTranslation(language, "coolWeather")}</h4>
              <p className="text-muted-foreground text-sm">{getTranslation(language, "coolWeatherDesc")}</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🏡</div>
              <h4 className="text-lg font-semibold mb-2">{getTranslation(language, "comfortableAccommodations")}</h4>
              <p className="text-muted-foreground text-sm">{getTranslation(language, "accommodationsDesc")}</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🌿</div>
              <h4 className="text-lg font-semibold mb-2">{getTranslation(language, "beautifulNature")}</h4>
              <p className="text-muted-foreground text-sm">{getTranslation(language, "natureDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">{siteSettingsService.getSiteTitle(language)}</h4>
              <p className="text-gray-300 text-sm">{siteSettingsService.getFooterDescription(language)}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{getTranslation(language, "popularAreas")}</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  {getTranslation(language, "zawita")} - {getTranslation(language, "mountainViews")}
                </li>
                <li>
                  {getTranslation(language, "sarsing")} - {getTranslation(language, "valleyHouses")}
                </li>
                <li>
                  {getTranslation(language, "amedi")} - {getTranslation(language, "historicTown")}
                </li>
                <li>
                  {getTranslation(language, "mangesh")} - {getTranslation(language, "familyFriendly")}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{getTranslation(language, "contactInfo")}</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                {(() => {
                  const contactInfo = siteSettingsService.getContactInfo()
                  return (
                    <>
                      <p>📞 {contactInfo.phone}</p>
                      <p>
                        📱 {getTranslation(language, "whatsapp")}: {contactInfo.whatsapp}
                      </p>
                      <p>📧 {contactInfo.email}</p>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2024 {siteSettingsService.getSiteTitle(language)}. {getTranslation(language, "allRightsReserved")}
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} language={language} />

      {selectedHouse && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          house={selectedHouse}
          language={language}
        />
      )}

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        language={language}
        houses={houses}
        onBookClick={handleBookClick}
      />

      {selectedHouseForDetails && (
        <HouseDetailsModal
          isOpen={showHouseDetails}
          onClose={() => setShowHouseDetails(false)}
          house={selectedHouseForDetails}
          language={language}
          onBookClick={handleBookClick}
          onWhatsAppClick={openWhatsApp}
          onMapClick={openGoogleMaps}
        />
      )}

      <UserBookingsModal isOpen={showUserBookings} onClose={() => setShowUserBookings(false)} language={language} />
    </div>
  )
}
