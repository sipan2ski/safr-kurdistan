"use client"

export interface SiteSettings {
  id: string
  // Header settings
  siteTitle: {
    en: string
    ar: string
    ku: string
  }
  headerDescription: {
    en: string
    ar: string
    ku: string
  }
  logoUrl: string

  // Hero section settings
  heroTitle: {
    en: string
    ar: string
    ku: string
  }
  heroSubtitle: {
    en: string
    ar: string
    ku: string
  }
  heroVideoUrl: string

  // Footer settings
  footerDescription: {
    en: string
    ar: string
    ku: string
  }
  contactPhone: string
  contactWhatsApp: string
  contactEmail: string

  // Social media
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
  }

  updatedAt: string
  updatedBy: string
}

export class SiteSettingsService {
  private static instance: SiteSettingsService

  static getInstance(): SiteSettingsService {
    if (!SiteSettingsService.instance) {
      SiteSettingsService.instance = new SiteSettingsService()
    }
    return SiteSettingsService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeDefaultSettings()
    }
  }

  private initializeDefaultSettings() {
    const settings = this.getSettings()
    if (!settings) {
      const defaultSettings: SiteSettings = {
        id: "site-settings-1",
        siteTitle: {
          en: "Safr Kurdistan",
          ar: "سافر كوردستان",
          ku: "گەشتی کوردستان",
        },
        headerDescription: {
          en: "Perfect for Iraqi families visiting Kurdistan",
          ar: "مثالي للعائلات العراقية التي تزور كردستان",
          ku: "تەواو بۆ خێزانە عێراقییەکان کە سەردانی کوردستان دەکەن",
        },
        logoUrl: "", // Will use default logo if empty
        heroTitle: {
          en: "Find Your Perfect Summer House in Kurdistan",
          ar: "اعثر على بيت الصيف المثالي في كردستان",
          ku: "خانووی هاوینی تەواوی خۆت لە کوردستان بدۆزەرەوە",
        },
        heroSubtitle: {
          en: "Escape the Iraqi summer heat in the cool mountains of Kurdistan",
          ar: "اهرب من حر الصيف العراقي في جبال كردستان الباردة",
          ku: "لە گەرمی هاوینی عێراق دەرباز ببە لە چیا ساردەکانی کوردستان",
        },
        heroVideoUrl: "https://videos.pexels.com/video-files/4009409/4009409-uhd_2560_1440_25fps.mp4",
        footerDescription: {
          en: "Your gateway to cool, comfortable summer vacations in the beautiful mountains of Kurdistan.",
          ar: "بوابتك إلى عطلات صيفية باردة ومريحة في جبال كردستان الجميلة.",
          ku: "دەرگاکەت بۆ پشووی هاوینی سارد و ئاسوودە لە چیا جوانەکانی کوردستان.",
        },
        contactPhone: "+964 750 000 0000",
        contactWhatsApp: "+964 750 000 0000",
        contactEmail: "info@kurdistanhouses.com",
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: "",
        },
        updatedAt: new Date().toISOString(),
        updatedBy: "system",
      }

      localStorage.setItem("site_settings", JSON.stringify(defaultSettings))
    }
  }

  getSettings(): SiteSettings | null {
    const settings = localStorage.getItem("site_settings")
    return settings ? JSON.parse(settings) : null
  }

  updateSettings(updates: Partial<SiteSettings>, updatedBy: string): { success: boolean; message: string } {
    try {
      const currentSettings = this.getSettings()
      if (!currentSettings) {
        return { success: false, message: "Settings not found" }
      }

      const updatedSettings: SiteSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy,
      }

      localStorage.setItem("site_settings", JSON.stringify(updatedSettings))
      return { success: true, message: "Settings updated successfully" }
    } catch (error) {
      return { success: false, message: "Failed to update settings" }
    }
  }

  getSiteTitle(language: "en" | "ar" | "ku"): string {
    const settings = this.getSettings()
    return settings?.siteTitle[language] || "Safr Kurdistan"
  }

  getHeaderDescription(language: "en" | "ar" | "ku"): string {
    const settings = this.getSettings()
    return settings?.headerDescription[language] || "Perfect for Iraqi families visiting Kurdistan"
  }

  getHeroTitle(language: "en" | "ar" | "ku"): string {
    const settings = this.getSettings()
    return settings?.heroTitle[language] || "Find Your Perfect Summer House in Kurdistan"
  }

  getHeroSubtitle(language: "en" | "ar" | "ku"): string {
    const settings = this.getSettings()
    return settings?.heroSubtitle[language] || "Escape the Iraqi summer heat in the cool mountains of Kurdistan"
  }

  getFooterDescription(language: "en" | "ar" | "ku"): string {
    const settings = this.getSettings()
    return (
      settings?.footerDescription[language] ||
      "Your gateway to cool, comfortable summer vacations in the beautiful mountains of Kurdistan."
    )
  }

  getContactInfo() {
    const settings = this.getSettings()
    return {
      phone: settings?.contactPhone || "+964 750 000 0000",
      whatsapp: settings?.contactWhatsApp || "+964 750 000 0000",
      email: settings?.contactEmail || "info@kurdistanhouses.com",
    }
  }

  getHeroVideoUrl(): string {
    const settings = this.getSettings()
    return settings?.heroVideoUrl || "https://videos.pexels.com/video-files/4009409/4009409-uhd_2560_1440_25fps.mp4"
  }

  getLogoUrl(): string {
    const settings = this.getSettings()
    return settings?.logoUrl || ""
  }
}
