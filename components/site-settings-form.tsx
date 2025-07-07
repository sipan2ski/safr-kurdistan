"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Upload, Globe, Video, Phone, Mail, MessageCircle } from "lucide-react"
import { SiteSettingsService, type SiteSettings } from "@/lib/site-settings"
import { AdminAuthService } from "@/lib/admin-auth"

interface SiteSettingsFormProps {
  onSuccess: (message: string) => void
}

export function SiteSettingsForm({ onSuccess }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const siteSettingsService = SiteSettingsService.getInstance()
  const adminAuthService = AdminAuthService.getInstance()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const currentSettings = siteSettingsService.getSettings()
    setSettings(currentSettings)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setIsLoading(true)
    setMessage("")

    const admin = adminAuthService.getAuthState().admin
    if (!admin) {
      setMessage("Admin authentication required")
      setIsLoading(false)
      return
    }

    const result = siteSettingsService.updateSettings(settings, admin.id)
    setMessage(result.message)

    if (result.success) {
      onSuccess(result.message)
      setTimeout(() => setMessage(""), 3000)
    }

    setIsLoading(false)
  }

  const updateSettings = (updates: Partial<SiteSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates })
    }
  }

  const updateMultiLanguageField = (
    field: keyof Pick<
      SiteSettings,
      "siteTitle" | "headerDescription" | "heroTitle" | "heroSubtitle" | "footerDescription"
    >,
    language: "en" | "ar" | "ku",
    value: string,
  ) => {
    if (settings) {
      setSettings({
        ...settings,
        [field]: {
          ...settings[field],
          [language]: value,
        },
      })
    }
  }

  if (!settings) {
    return <div>Loading settings...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="header">Header & Logo</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Header Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    value={settings.logoUrl}
                    onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png (leave empty for default logo)"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a logo image or provide a URL. Leave empty to use the default Kurdistan flag logo.
                </p>
              </div>

              {/* Site Title */}
              <div className="space-y-4">
                <Label>Site Title (Multi-language)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="title-en" className="text-sm">
                      English
                    </Label>
                    <Input
                      id="title-en"
                      value={settings.siteTitle.en}
                      onChange={(e) => updateMultiLanguageField("siteTitle", "en", e.target.value)}
                      placeholder="Safr Kurdistan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title-ar" className="text-sm">
                      Arabic
                    </Label>
                    <Input
                      id="title-ar"
                      value={settings.siteTitle.ar}
                      onChange={(e) => updateMultiLanguageField("siteTitle", "ar", e.target.value)}
                      placeholder="سافر كوردستان"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title-ku" className="text-sm">
                      Kurdish
                    </Label>
                    <Input
                      id="title-ku"
                      value={settings.siteTitle.ku}
                      onChange={(e) => updateMultiLanguageField("siteTitle", "ku", e.target.value)}
                      placeholder="گەشتی کوردستان"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* Header Description */}
              <div className="space-y-4">
                <Label>Header Description (Multi-language)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="desc-en" className="text-sm">
                      English
                    </Label>
                    <Input
                      id="desc-en"
                      value={settings.headerDescription.en}
                      onChange={(e) => updateMultiLanguageField("headerDescription", "en", e.target.value)}
                      placeholder="Perfect for Iraqi families visiting Kurdistan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc-ar" className="text-sm">
                      Arabic
                    </Label>
                    <Input
                      id="desc-ar"
                      value={settings.headerDescription.ar}
                      onChange={(e) => updateMultiLanguageField("headerDescription", "ar", e.target.value)}
                      placeholder="مثالي للعائلات العراقية التي تزور كردستان"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc-ku" className="text-sm">
                      Kurdish
                    </Label>
                    <Input
                      id="desc-ku"
                      value={settings.headerDescription.ku}
                      onChange={(e) => updateMultiLanguageField("headerDescription", "ku", e.target.value)}
                      placeholder="تەواو بۆ خێزانە عێراقییەکان کە سەردانی کوردستان دەکەن"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Hero Section Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Video */}
              <div className="space-y-4">
                <Label htmlFor="hero-video">Background Video URL</Label>
                <Input
                  id="hero-video"
                  value={settings.heroVideoUrl}
                  onChange={(e) => updateSettings({ heroVideoUrl: e.target.value })}
                  placeholder="https://videos.pexels.com/video-files/..."
                />
                <p className="text-xs text-muted-foreground">
                  Provide a direct link to an MP4 video file for the hero background. Recommended: 1920x1080 or higher
                  resolution.
                </p>

                {/* Video Preview */}
                {settings.heroVideoUrl && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Video Preview</Label>
                    <div
                      className="mt-2 relative rounded-lg overflow-hidden bg-gray-100"
                      style={{ aspectRatio: "16/9", maxWidth: "400px" }}
                    >
                      <video
                        src={settings.heroVideoUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement
                          target.style.display = "none"
                          const errorDiv = target.nextElementSibling as HTMLElement
                          if (errorDiv) errorDiv.style.display = "flex"
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                        style={{ display: "none" }}
                      >
                        Video failed to load. Please check the URL.
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Videos */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-800">Suggested Background Videos</Label>
                  <div className="mt-2 space-y-2">
                    <button
                      type="button"
                      className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 underline"
                      onClick={() =>
                        updateSettings({
                          heroVideoUrl: "https://videos.pexels.com/video-files/4009409/4009409-uhd_2560_1440_25fps.mp4",
                        })
                      }
                    >
                      Mountain Landscape (Recommended)
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 underline"
                      onClick={() =>
                        updateSettings({
                          heroVideoUrl: "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4",
                        })
                      }
                    >
                      Forest Valley (Original)
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 underline"
                      onClick={() =>
                        updateSettings({
                          heroVideoUrl: "https://videos.pexels.com/video-files/2499611/2499611-uhd_2560_1440_30fps.mp4",
                        })
                      }
                    >
                      Mountain Lake
                    </button>
                    <button
                      type="button"
                      className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 underline"
                      onClick={() =>
                        updateSettings({
                          heroVideoUrl: "https://videos.pexels.com/video-files/1448735/1448735-uhd_2560_1440_24fps.mp4",
                        })
                      }
                    >
                      Scenic Hills
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero Title */}
              <div className="space-y-4">
                <Label>Hero Title (Multi-language)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hero-title-en" className="text-sm">
                      English
                    </Label>
                    <Textarea
                      id="hero-title-en"
                      value={settings.heroTitle.en}
                      onChange={(e) => updateMultiLanguageField("heroTitle", "en", e.target.value)}
                      placeholder="Find Your Perfect Summer House in Kurdistan"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-title-ar" className="text-sm">
                      Arabic
                    </Label>
                    <Textarea
                      id="hero-title-ar"
                      value={settings.heroTitle.ar}
                      onChange={(e) => updateMultiLanguageField("heroTitle", "ar", e.target.value)}
                      placeholder="اعثر على بيت الصيف المثالي في كردستان"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-title-ku" className="text-sm">
                      Kurdish
                    </Label>
                    <Textarea
                      id="hero-title-ku"
                      value={settings.heroTitle.ku}
                      onChange={(e) => updateMultiLanguageField("heroTitle", "ku", e.target.value)}
                      placeholder="خانووی هاوینی تەواوی خۆت لە کوردستان بدۆزەرەوە"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Subtitle */}
              <div className="space-y-4">
                <Label>Hero Subtitle (Multi-language)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hero-subtitle-en" className="text-sm">
                      English
                    </Label>
                    <Textarea
                      id="hero-subtitle-en"
                      value={settings.heroSubtitle.en}
                      onChange={(e) => updateMultiLanguageField("heroSubtitle", "en", e.target.value)}
                      placeholder="Escape the Iraqi summer heat in the cool mountains of Kurdistan"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-subtitle-ar" className="text-sm">
                      Arabic
                    </Label>
                    <Textarea
                      id="hero-subtitle-ar"
                      value={settings.heroSubtitle.ar}
                      onChange={(e) => updateMultiLanguageField("heroSubtitle", "ar", e.target.value)}
                      placeholder="اهرب من حر الصيف العراقي في جبال كردستان الباردة"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-subtitle-ku" className="text-sm">
                      Kurdish
                    </Label>
                    <Textarea
                      id="hero-subtitle-ku"
                      value={settings.heroSubtitle.ku}
                      onChange={(e) => updateMultiLanguageField("heroSubtitle", "ku", e.target.value)}
                      placeholder="لە گەرمی هاوینی عێراق دەرباز ببە لە چیا ساردەکانی کوردستان"
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Footer Description */}
              <div className="space-y-4">
                <Label>Footer Description (Multi-language)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="footer-desc-en" className="text-sm">
                      English
                    </Label>
                    <Textarea
                      id="footer-desc-en"
                      value={settings.footerDescription.en}
                      onChange={(e) => updateMultiLanguageField("footerDescription", "en", e.target.value)}
                      placeholder="Your gateway to cool, comfortable summer vacations..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer-desc-ar" className="text-sm">
                      Arabic
                    </Label>
                    <Textarea
                      id="footer-desc-ar"
                      value={settings.footerDescription.ar}
                      onChange={(e) => updateMultiLanguageField("footerDescription", "ar", e.target.value)}
                      placeholder="بوابتك إلى عطلات صيفية باردة ومريحة..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer-desc-ku" className="text-sm">
                      Kurdish
                    </Label>
                    <Textarea
                      id="footer-desc-ku"
                      value={settings.footerDescription.ku}
                      onChange={(e) => updateMultiLanguageField("footerDescription", "ku", e.target.value)}
                      placeholder="دەرگاکەت بۆ پشووی هاوینی سارد و ئاسوودە..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contact-phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="contact-phone"
                    value={settings.contactPhone}
                    onChange={(e) => updateSettings({ contactPhone: e.target.value })}
                    placeholder="+964 750 000 0000"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="contact-whatsapp"
                    value={settings.contactWhatsApp}
                    onChange={(e) => updateSettings({ contactWhatsApp: e.target.value })}
                    placeholder="+964 750 000 0000"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                    placeholder="info@kurdistanhouses.com"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <Label>Social Media Links (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="facebook" className="text-sm">
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={settings.socialMedia.facebook || ""}
                      onChange={(e) =>
                        updateSettings({
                          socialMedia: { ...settings.socialMedia, facebook: e.target.value },
                        })
                      }
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="text-sm">
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={settings.socialMedia.instagram || ""}
                      onChange={(e) =>
                        updateSettings({
                          socialMedia: { ...settings.socialMedia, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm">
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={settings.socialMedia.twitter || ""}
                      onChange={(e) =>
                        updateSettings({
                          socialMedia: { ...settings.socialMedia, twitter: e.target.value },
                        })
                      }
                      placeholder="https://twitter.com/yourpage"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Message */}
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
    </form>
  )
}
