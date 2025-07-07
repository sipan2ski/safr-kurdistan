"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Percent, DollarSign, Save, X } from "lucide-react"
import { DiscountService } from "@/lib/discount"
import { AdminAuthService } from "@/lib/admin-auth"
import type { HouseData } from "@/lib/house-database"

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  houses: HouseData[]
  selectedHouseId?: string | null
  onSuccess: () => void
}

export function DiscountModal({ isOpen, onClose, houses, selectedHouseId, onSuccess }: DiscountModalProps) {
  const [formData, setFormData] = useState({
    houseId: selectedHouseId || "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    startDate: "",
    endDate: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const discountService = DiscountService.getInstance()
  const adminAuthService = AdminAuthService.getInstance()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    if (!formData.houseId) {
      setMessage("Please select a house")
      setIsLoading(false)
      return
    }

    if (formData.discountValue <= 0) {
      setMessage("Discount value must be greater than 0")
      setIsLoading(false)
      return
    }

    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      setMessage("Percentage discount cannot exceed 100%")
      setIsLoading(false)
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setMessage("End date must be after start date")
      setIsLoading(false)
      return
    }

    const admin = adminAuthService.getAuthState().admin
    if (!admin) {
      setMessage("Admin authentication required")
      setIsLoading(false)
      return
    }

    const result = discountService.addDiscount({
      houseId: formData.houseId,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: true,
      createdBy: admin.id,
    })

    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onSuccess()
        onClose()
        setFormData({
          houseId: "",
          discountType: "percentage",
          discountValue: 0,
          startDate: "",
          endDate: "",
        })
        setMessage("")
      }, 1000)
    }

    setIsLoading(false)
  }

  const selectedHouse = houses.find((h) => h.id === formData.houseId)
  const previewPrice = selectedHouse ? calculatePreviewPrice() : null

  function calculatePreviewPrice() {
    if (!selectedHouse) return null

    const originalPrice = selectedHouse.price
    let discountedPrice = originalPrice

    if (formData.discountType === "percentage") {
      discountedPrice = originalPrice * (1 - formData.discountValue / 100)
    } else {
      discountedPrice = Math.max(0, originalPrice - formData.discountValue)
    }

    return {
      original: originalPrice,
      discounted: Math.round(discountedPrice),
      savings: originalPrice - Math.round(discountedPrice),
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-green-600" />
            Add Discount
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="house">Select House *</Label>
            <Select value={formData.houseId} onValueChange={(value) => setFormData({ ...formData, houseId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a house" />
              </SelectTrigger>
              <SelectContent>
                {houses.map((house) => (
                  <SelectItem key={house.id} value={house.id}>
                    {house.title} - ${house.price}/night
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountType">Discount Type *</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discountValue">
                Discount Value * {formData.discountType === "percentage" ? "(%)" : "($)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="1"
                max={formData.discountType === "percentage" ? "100" : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number.parseInt(e.target.value) })}
                placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 50"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                min={formData.startDate || today}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Price Preview */}
          {previewPrice && formData.discountValue > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-green-800 mb-2">Price Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span className="line-through text-gray-500">${previewPrice.original}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discounted Price:</span>
                    <span className="font-bold text-green-600">${previewPrice.discounted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Saves:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ${previewPrice.savings}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Adding..." : "Add Discount"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>

        {message && (
          <div
            className={`text-center text-sm p-3 rounded ${
              message.includes("success")
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Discounts will automatically apply to bookings made during the specified period
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
