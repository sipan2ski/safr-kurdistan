"use client"

export interface HouseData {
  id: string
  title: string
  area: string
  city: string
  price: number
  currency: string
  rating: number
  reviews: number
  bedrooms: number
  bathrooms: number
  guests: number
  parking: boolean
  available: boolean
  images: string[]
  description: string
  amenities: string[]
  phone: string
  whatsapp: string
  mapLocation: { lat: number; lng: number }
  createdAt: string
  updatedAt: string
}

export class HouseDatabaseService {
  private static instance: HouseDatabaseService

  static getInstance(): HouseDatabaseService {
    if (!HouseDatabaseService.instance) {
      HouseDatabaseService.instance = new HouseDatabaseService()
    }
    return HouseDatabaseService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeDefaultHouses()
    }
  }

  private initializeDefaultHouses() {
    const houses = this.getAllHouses()
    if (houses.length === 0) {
      // Add some default houses
      const defaultHouses: HouseData[] = [
        {
          id: "house-1",
          title: "Mountain View Villa in Zawita",
          area: "Zawita",
          city: "Duhok",
          price: 180,
          currency: "USD",
          rating: 4.9,
          reviews: 32,
          bedrooms: 4,
          bathrooms: 3,
          guests: 10,
          parking: true,
          available: true,
          images: ["/placeholder.svg?height=300&width=400"],
          description: "Luxury villa with panoramic mountain views, perfect for large families.",
          amenities: ["WiFi", "AC", "Kitchen", "Garden", "Mountain View", "BBQ Area"],
          phone: "+964 750 123 4567",
          whatsapp: "+964 750 123 4567",
          mapLocation: { lat: 37.0469, lng: 43.0889 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "house-2",
          title: "Cozy Family House in Zawita",
          area: "Zawita",
          city: "Duhok",
          price: 120,
          currency: "USD",
          rating: 4.7,
          reviews: 28,
          bedrooms: 3,
          bathrooms: 2,
          guests: 8,
          parking: true,
          available: true,
          images: ["/placeholder.svg?height=300&width=400"],
          description: "Comfortable family house with traditional Kurdish architecture.",
          amenities: ["WiFi", "Kitchen", "Garden", "Traditional Design"],
          phone: "+964 750 123 4568",
          whatsapp: "+964 750 123 4568",
          mapLocation: { lat: 37.0479, lng: 43.0899 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      localStorage.setItem("houses_db", JSON.stringify(defaultHouses))
    }
  }

  getAllHouses(): HouseData[] {
    return JSON.parse(localStorage.getItem("houses_db") || "[]")
  }

  getHouseById(id: string): HouseData | null {
    const houses = this.getAllHouses()
    return houses.find((house) => house.id === id) || null
  }

  addHouse(houseData: Omit<HouseData, "id" | "createdAt" | "updatedAt">): {
    success: boolean
    message: string
    id?: string
  } {
    try {
      const houses = this.getAllHouses()
      const newHouse: HouseData = {
        ...houseData,
        id: `house-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      houses.push(newHouse)
      localStorage.setItem("houses_db", JSON.stringify(houses))

      return { success: true, message: "House added successfully", id: newHouse.id }
    } catch (error) {
      return { success: false, message: "Failed to add house" }
    }
  }

  updateHouse(id: string, houseData: Partial<HouseData>): { success: boolean; message: string } {
    try {
      const houses = this.getAllHouses()
      const houseIndex = houses.findIndex((house) => house.id === id)

      if (houseIndex === -1) {
        return { success: false, message: "House not found" }
      }

      houses[houseIndex] = {
        ...houses[houseIndex],
        ...houseData,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem("houses_db", JSON.stringify(houses))
      return { success: true, message: "House updated successfully" }
    } catch (error) {
      return { success: false, message: "Failed to update house" }
    }
  }

  deleteHouse(id: string): { success: boolean; message: string } {
    try {
      const houses = this.getAllHouses()
      const filteredHouses = houses.filter((house) => house.id !== id)

      if (houses.length === filteredHouses.length) {
        return { success: false, message: "House not found" }
      }

      localStorage.setItem("houses_db", JSON.stringify(filteredHouses))
      return { success: true, message: "House deleted successfully" }
    } catch (error) {
      return { success: false, message: "Failed to delete house" }
    }
  }

  searchHouses(filters: {
    area?: string
    city?: string
    minPrice?: number
    maxPrice?: number
    available?: boolean
  }): HouseData[] {
    const houses = this.getAllHouses()
    return houses.filter((house) => {
      if (filters.area && filters.area !== "All Areas" && house.area !== filters.area) return false
      if (filters.city && filters.city !== "All Cities" && house.city !== filters.city) return false
      if (filters.minPrice && house.price < filters.minPrice) return false
      if (filters.maxPrice && house.price > filters.maxPrice) return false
      if (filters.available !== undefined && house.available !== filters.available) return false
      return true
    })
  }
}
