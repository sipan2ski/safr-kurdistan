"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthService } from "@/lib/auth"
import type { Language } from "@/lib/translations"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

export function AuthModal({ isOpen, onClose, language }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", name: "" })

  const authService = AuthService.getInstance()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const result = await authService.login(loginForm.email, loginForm.password)
    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onClose()
        setLoginForm({ email: "", password: "" })
        setMessage("")
      }, 1000)
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const result = await authService.register(registerForm.email, registerForm.password, registerForm.name)
    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onClose()
        setRegisterForm({ email: "", password: "", name: "" })
        setMessage("")
      }, 1000)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === "ar"
              ? "تسجيل الدخول / إنشاء حساب"
              : language === "ku"
                ? "چوونەژوورەوە / هەژمار دروستکردن"
                : "Login / Create Account"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              {language === "ar" ? "تسجيل الدخول" : language === "ku" ? "چوونەژوورەوە" : "Login"}
            </TabsTrigger>
            <TabsTrigger value="register">
              {language === "ar" ? "إنشاء حساب" : language === "ku" ? "هەژمار دروستکردن" : "Sign Up"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">
                  {language === "ar" ? "البريد الإلكتروني" : language === "ku" ? "ئیمەیڵ" : "Email"}
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">
                  {language === "ar" ? "كلمة المرور" : language === "ku" ? "تێپەڕەوشە" : "Password"}
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? language === "ar"
                    ? "جاري تسجيل الدخول..."
                    : language === "ku"
                      ? "چوونەژوورەوە..."
                      : "Logging in..."
                  : language === "ar"
                    ? "تسجيل الدخول"
                    : language === "ku"
                      ? "چوونەژوورەوە"
                      : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-name">
                  {language === "ar" ? "الاسم" : language === "ku" ? "ناو" : "Name"}
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-email">
                  {language === "ar" ? "البريد الإلكتروني" : language === "ku" ? "ئیمەیڵ" : "Email"}
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="register-password">
                  {language === "ar" ? "كلمة المرور" : language === "ku" ? "تێپەڕەوشە" : "Password"}
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? language === "ar"
                    ? "جاري إنشاء الحساب..."
                    : language === "ku"
                      ? "هەژمار دروستکردن..."
                      : "Creating account..."
                  : language === "ar"
                    ? "إنشاء حساب"
                    : language === "ku"
                      ? "هەژمار دروستکردن"
                      : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {message && (
          <div className={`text-center text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
