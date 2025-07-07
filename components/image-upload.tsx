"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const newImages: string[] = []

      for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
        const file = files[i]

        // Check file type
        if (!file.type.startsWith("image/")) {
          alert(`File ${file.name} is not an image`)
          continue
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        // Convert to base64
        const base64 = await fileToBase64(file)
        newImages.push(base64)
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
      }
    } catch (error) {
      alert("Error uploading images. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    // Basic URL validation
    try {
      new URL(urlInput)
      if (images.length < maxImages) {
        onImagesChange([...images, urlInput.trim()])
        setUrlInput("")
      } else {
        alert(`Maximum ${maxImages} images allowed`)
      }
    } catch {
      alert("Please enter a valid URL")
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <Label>
        House Images ({images.length}/{maxImages})
      </Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload from PC</TabsTrigger>
          <TabsTrigger value="url">Add URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">Click to upload images from your computer</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || images.length >= maxImages}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Choose Images"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">Maximum {maxImages} images, 5MB each. Supports JPG, PNG, GIF</p>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUrlAdd()}
            />
            <Button type="button" onClick={handleUrlAdd} disabled={images.length >= maxImages}>
              <Link className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            You can use free image hosting services like imgur.com, or any direct image URL
          </p>
        </TabsContent>
      </Tabs>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Current Images:</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`House image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=100&width=150"
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
