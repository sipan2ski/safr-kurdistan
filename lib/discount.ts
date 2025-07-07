"use client"

export interface Discount {
  id: string
  houseId: string
  discountType: "percentage" | "fixed"
  discountValue: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  createdBy: string
}

export class DiscountService {
  private static instance: DiscountService

  static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService()
    }
    return DiscountService.instance
  }

  getAllDiscounts(): Discount[] {
    return JSON.parse(localStorage.getItem("discounts") || "[]")
  }

  getHouseDiscounts(houseId: string): Discount[] {
    const discounts = this.getAllDiscounts()
    return discounts.filter((d) => d.houseId === houseId && d.isActive)
  }

  getActiveDiscount(houseId: string): Discount | null {
    const discounts = this.getHouseDiscounts(houseId)
    const now = new Date()

    return (
      discounts.find((discount) => {
        const startDate = new Date(discount.startDate)
        const endDate = new Date(discount.endDate)
        return now >= startDate && now <= endDate && discount.isActive
      }) || null
    )
  }

  calculateDiscountedPrice(originalPrice: number, houseId: string): { price: number; discount: Discount | null } {
    const activeDiscount = this.getActiveDiscount(houseId)

    if (!activeDiscount) {
      return { price: originalPrice, discount: null }
    }

    let discountedPrice = originalPrice

    if (activeDiscount.discountType === "percentage") {
      discountedPrice = originalPrice * (1 - activeDiscount.discountValue / 100)
    } else {
      discountedPrice = Math.max(0, originalPrice - activeDiscount.discountValue)
    }

    return { price: Math.round(discountedPrice), discount: activeDiscount }
  }

  addDiscount(discount: Omit<Discount, "id" | "createdAt">): { success: boolean; message: string } {
    try {
      const discounts = this.getAllDiscounts()

      // Check for overlapping discounts
      const overlapping = discounts.find((d) => {
        if (d.houseId !== discount.houseId || !d.isActive) return false

        const existingStart = new Date(d.startDate)
        const existingEnd = new Date(d.endDate)
        const newStart = new Date(discount.startDate)
        const newEnd = new Date(discount.endDate)

        return (
          (newStart >= existingStart && newStart <= existingEnd) ||
          (newEnd >= existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        )
      })

      if (overlapping) {
        return { success: false, message: "Discount period overlaps with existing discount" }
      }

      const newDiscount: Discount = {
        ...discount,
        id: `discount-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      discounts.push(newDiscount)
      localStorage.setItem("discounts", JSON.stringify(discounts))

      return { success: true, message: "Discount added successfully" }
    } catch (error) {
      return { success: false, message: "Failed to add discount" }
    }
  }

  updateDiscount(id: string, updates: Partial<Discount>): { success: boolean; message: string } {
    try {
      const discounts = this.getAllDiscounts()
      const index = discounts.findIndex((d) => d.id === id)

      if (index === -1) {
        return { success: false, message: "Discount not found" }
      }

      discounts[index] = { ...discounts[index], ...updates }
      localStorage.setItem("discounts", JSON.stringify(discounts))

      return { success: true, message: "Discount updated successfully" }
    } catch (error) {
      return { success: false, message: "Failed to update discount" }
    }
  }

  deleteDiscount(id: string): { success: boolean; message: string } {
    try {
      const discounts = this.getAllDiscounts()
      const filteredDiscounts = discounts.filter((d) => d.id !== id)

      localStorage.setItem("discounts", JSON.stringify(filteredDiscounts))
      return { success: true, message: "Discount deleted successfully" }
    } catch (error) {
      return { success: false, message: "Failed to delete discount" }
    }
  }
}
