"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Save, X, Home, Star, Shield, LogOut, Calendar, Percent, Tag, Bell } from "lucide-react"
import { AdminAuthService, type AdminAuthState } from "@/lib/admin-auth"
import { HouseDatabaseService, type HouseData } from "@/lib/house-database"
import { BookingService, type Booking } from "@/lib/booking"
import { DiscountService, type Discount } from "@/lib/discount"
import { ImageUpload } from "@/components/image-upload"
import { DiscountModal } from "@/components/discount-modal"
import { SiteSettingsForm } from "@/components/site-settings-form"

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [authState, setAuthState] = useState<AdminAuthState>({ admin: null, isAuthenticated: false })
  const [houses, setHouses] = useState<HouseData[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [showAddHouse, setShowAddHouse] = useState(false)
  const [editingHouse, setEditingHouse] = useState<HouseData | null>(null)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [selectedHouseForDiscount, setSelectedHouseForDiscount] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const adminAuthService = AdminAuthService.getInstance()
  const houseDatabaseService = HouseDatabaseService.getInstance()
  const bookingService = BookingService.getInstance()
  const discountService = DiscountService.getInstance()

  useEffect(() => {
    setAuthState(adminAuthService.getAuthState())
    const unsubscribe = adminAuthService.subscribe(setAuthState)
    loadData()
    return unsubscribe
  }, [])

  const loadData = () => {
    setHouses(houseDatabaseService.getAllHouses())
    setBookings(bookingService.getAllBookings())
    setDiscounts(discountService.getAllDiscounts())
  }

  const handleLogout = () => {
    adminAuthService.logout()
    onClose()
  }

  const deleteHouse = (id: string) => {
    if (confirm("Are you sure you want to delete this house?")) {
      const result = houseDatabaseService.deleteHouse(id)
      setMessage(result.message)
      if (result.success) {
        loadData()
      }
    }
  }

  const cancelBooking = (bookingId: string) => {
    const reason = prompt("Please enter cancellation reason (optional):")
    if (confirm("Are you sure you want to cancel this booking?")) {
      const result = bookingService.cancelBooking(bookingId, authState.admin?.id || "admin", reason || undefined)
      setMessage(result.message)
      if (result.success) {
        loadData()
      }
    }
  }

  const confirmBooking = (bookingId: string) => {
    const result = bookingService.updateBookingStatus(bookingId, "confirmed")
    setMessage(result.message)
    if (result.success) {
      loadData()
    }
  }

  const deleteDiscount = (discountId: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      const result = discountService.deleteDiscount(discountId)
      setMessage(result.message)
      if (result.success) {
        loadData()
      }
    }
  }

  const areas = ["Zawita", "Sarsing", "Mangesh", "Amedi", "Deralok", "Barzan", "Rezan", "Akre"]
  const cities = ["Duhok", "Erbil", "Sulaymaniyah"]

  const getHouseName = (houseId: string) => {
    const house = houses.find((h) => h.id === houseId)
    return house?.title || "Unknown House"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Admin Dashboard - {authState.admin?.username}
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
            <TabsTrigger value="add-house">Add House</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Houses</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{houses.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{discounts.filter((d) => d.isActive).length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "pending").length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{getHouseName(booking.houseId)}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.checkIn} to {booking.checkOut} - ${booking.totalPrice}
                          </p>
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
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Discounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {discounts
                      .filter((d) => d.isActive)
                      .slice(0, 5)
                      .map((discount) => (
                        <div key={discount.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{getHouseName(discount.houseId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {discount.discountValue}
                              {discount.discountType === "percentage" ? "%" : "$"} off
                            </p>
                          </div>
                          <Badge variant="secondary">{new Date(discount.endDate).toLocaleDateString()}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="houses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Houses ({houses.length})</h3>
              <Button onClick={() => setShowAddHouse(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add House
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {houses.map((house) => (
                <Card key={house.id}>
                  <div className="relative">
                    <img
                      src={house.images[0] || "/placeholder.svg"}
                      alt={house.title}
                      className="w-full h-32 object-cover rounded-t"
                    />
                    <Badge className={`absolute top-2 right-2 ${house.available ? "bg-green-600" : "bg-red-600"}`}>
                      {house.available ? "Available" : "Booked"}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{house.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {house.area}, {house.city}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">${house.price}/night</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{house.rating}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingHouse(house)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedHouseForDiscount(house.id)
                          setShowDiscountModal(true)
                        }}
                      >
                        <Percent className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteHouse(house.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Bookings ({bookings.length})</h3>
            </div>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{getHouseName(booking.houseId)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.checkIn} to {booking.checkOut} • {booking.guests} guests
                        </p>
                        <p className="text-sm">
                          Total: ${booking.totalPrice}
                          {booking.originalPrice && booking.originalPrice !== booking.totalPrice && (
                            <span className="text-green-600 ml-2">(${booking.discountApplied} discount applied)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Booked: {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                        {booking.status === "cancelled" && booking.cancellationReason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {booking.cancellationReason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {booking.status}
                        </Badge>
                        {booking.status === "pending" && (
                          <Button size="sm" onClick={() => confirmBooking(booking.id)}>
                            Confirm
                          </Button>
                        )}
                        {booking.status !== "cancelled" && (
                          <Button size="sm" variant="destructive" onClick={() => cancelBooking(booking.id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Discounts ({discounts.length})</h3>
              <Button onClick={() => setShowDiscountModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Discount
              </Button>
            </div>

            <div className="space-y-4">
              {discounts.map((discount) => (
                <Card key={discount.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{getHouseName(discount.houseId)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {discount.discountValue}
                          {discount.discountType === "percentage" ? "%" : "$"} discount
                        </p>
                        <p className="text-sm">
                          {new Date(discount.startDate).toLocaleDateString()} -{" "}
                          {new Date(discount.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(discount.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={discount.isActive ? "default" : "secondary"}>
                          {discount.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button size="sm" variant="destructive" onClick={() => deleteDiscount(discount.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Site Settings</h3>
            </div>
            <SiteSettingsForm
              onSuccess={(message) => {
                setMessage(message)
                setTimeout(() => setMessage(""), 3000)
              }}
            />
          </TabsContent>

          <TabsContent value="add-house">
            <AddHouseForm
              onSuccess={() => {
                loadData()
                setMessage("House added successfully!")
              }}
              areas={areas}
              cities={cities}
            />
          </TabsContent>
        </Tabs>

        {message && <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">{message}</div>}

        {editingHouse && (
          <EditHouseModal
            house={editingHouse}
            isOpen={!!editingHouse}
            onClose={() => setEditingHouse(null)}
            onSuccess={() => {
              loadData()
              setEditingHouse(null)
              setMessage("House updated successfully!")
            }}
            areas={areas}
            cities={cities}
          />
        )}

        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => {
            setShowDiscountModal(false)
            setSelectedHouseForDiscount(null)
          }}
          houses={houses}
          selectedHouseId={selectedHouseForDiscount}
          onSuccess={() => {
            loadData()
            setShowDiscountModal(false)
            setSelectedHouseForDiscount(null)
            setMessage("Discount added successfully!")
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

// Add House Form Component (keeping existing implementation)
function AddHouseForm({
  onSuccess,
  areas,
  cities,
}: {
  onSuccess: () => void
  areas: string[]
  cities: string[]
}) {
  const [formData, setFormData] = useState({
    title: "",
    area: "",
    city: "",
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    guests: 1,
    parking: false,
    available: true,
    description: "",
    amenities: "",
    phone: "",
    whatsapp: "",
    lat: 37.0469,
    lng: 43.0889,
    images: [] as string[],
  })

  const houseDatabaseService = HouseDatabaseService.getInstance()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const houseData = {
      title: formData.title,
      area: formData.area,
      city: formData.city,
      price: formData.price,
      currency: "USD",
      rating: 4.5,
      reviews: 0,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      guests: formData.guests,
      parking: formData.parking,
      available: formData.available,
      images: formData.images.length > 0 ? formData.images : ["/placeholder.svg?height=300&width=400"],
      description: formData.description,
      amenities: formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      mapLocation: { lat: formData.lat, lng: formData.lng },
    }

    const result = houseDatabaseService.addHouse(houseData)
    if (result.success) {
      onSuccess()
      // Reset form
      setFormData({
        title: "",
        area: "",
        city: "",
        price: 0,
        bedrooms: 1,
        bathrooms: 1,
        guests: 1,
        parking: false,
        available: true,
        description: "",
        amenities: "",
        phone: "",
        whatsapp: "",
        lat: 37.0469,
        lng: 43.0889,
        images: [],
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">House Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="area">Area *</Label>
          <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price per Night (USD) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="1"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: Number.parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="1"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: Number.parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="guests">Max Guests</Label>
          <Input
            id="guests"
            type="number"
            min="1"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: Number.parseInt(e.target.value) })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="parking"
            checked={formData.parking}
            onChange={(e) => setFormData({ ...formData, parking: e.target.checked })}
          />
          <Label htmlFor="parking">Has Parking</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
          />
          <Label htmlFor="available">Available for Booking</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="amenities">Amenities (comma separated)</Label>
        <Input
          id="amenities"
          value={formData.amenities}
          onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
          placeholder="WiFi, AC, Kitchen, Garden"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+964 750 123 4567"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="+964 750 123 4567"
          />
        </div>
      </div>

      <ImageUpload
        images={formData.images}
        onImagesChange={(images) => setFormData({ ...formData, images })}
        maxImages={5}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="0.000001"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: Number.parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="0.000001"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: Number.parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can find coordinates by going to Google Maps, right-clicking on the location, and
          copying the coordinates.
        </p>
      </div>

      <Button type="submit" className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Add House
      </Button>
    </form>
  )
}

// Edit House Modal Component (keeping existing implementation)
function EditHouseModal({
  house,
  isOpen,
  onClose,
  onSuccess,
  areas,
  cities,
}: {
  house: HouseData
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  areas: string[]
  cities: string[]
}) {
  const [formData, setFormData] = useState({
    title: house.title,
    area: house.area,
    city: house.city,
    price: house.price,
    bedrooms: house.bedrooms,
    bathrooms: house.bathrooms,
    guests: house.guests,
    parking: house.parking,
    available: house.available,
    description: house.description,
    amenities: house.amenities.join(", "),
    phone: house.phone,
    whatsapp: house.whatsapp,
    lat: house.mapLocation.lat,
    lng: house.mapLocation.lng,
    images: house.images,
  })

  const houseDatabaseService = HouseDatabaseService.getInstance()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updateData = {
      title: formData.title,
      area: formData.area,
      city: formData.city,
      price: formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      guests: formData.guests,
      parking: formData.parking,
      available: formData.available,
      images: formData.images,
      description: formData.description,
      amenities: formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      mapLocation: { lat: formData.lat, lng: formData.lng },
    }

    const result = houseDatabaseService.updateHouse(house.id, updateData)
    if (result.success) {
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit House</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-title">House Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-area">Area *</Label>
              <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-city">City *</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-price">Price per Night (USD) *</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              />
              <Label htmlFor="edit-available">Available for Booking</Label>
            </div>
          </div>

          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={5}
          />

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Update House
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
