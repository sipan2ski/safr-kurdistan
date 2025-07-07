"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff } from "lucide-react"
import { AdminAuthService } from "@/lib/admin-auth"

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminLogin({ isOpen, onClose, onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const adminAuthService = AdminAuthService.getInstance()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const result = await adminAuthService.login(username, password)
    setMessage(result.message)

    if (result.success) {
      setTimeout(() => {
        onSuccess()
        onClose()
        setUsername("")
        setPassword("")
        setMessage("")
      }, 1000)
    }

    setIsLoading(false)
  }

  const fillCredentials = () => {
    setUsername("admin")
    setPassword("admin123")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Admin Authentication
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Default Credentials:</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillCredentials}
              className="text-xs bg-transparent"
            >
              Auto-fill
            </Button>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Username:</strong> <code className="bg-blue-100 px-2 py-1 rounded">admin</code>
            </p>
            <p>
              <strong>Password:</strong> <code className="bg-blue-100 px-2 py-1 rounded">admin123</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Shield className="w-4 h-4 mr-2" />
            {isLoading ? "Authenticating..." : "Access Admin Panel"}
          </Button>
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
          <p className="text-xs text-gray-500">Secure admin access for Kurdistan Summer Houses management</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
