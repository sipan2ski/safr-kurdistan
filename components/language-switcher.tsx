"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import type { Language } from "@/lib/translations"

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const languages = [
    { code: "en" as Language, name: "EN", fullName: "English", flag: "🇺🇸" },
    { code: "ar" as Language, name: "AR", fullName: "العربية", flag: "🇮🇶" },
    { code: "ku" as Language, name: "KU", fullName: "کوردی", flag: "🟡🔴🟢" },
  ]

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-16 sm:w-20 bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span className="text-xs">{languages.find((lang) => lang.code === currentLanguage)?.flag}</span>
              <span className="font-medium">{languages.find((lang) => lang.code === currentLanguage)?.name}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg">
          {languages.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className="text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span className="hidden sm:inline">{language.fullName}</span>
                <span className="sm:hidden">{language.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
