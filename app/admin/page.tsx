"use client"

import { useState, useEffect } from "react"
import { Shield, LogOut, Eye, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminAuthService, type AdminAuthState } from "@/lib/admin-auth"

export default function AdminPage() {
  const [authState, setAuthState] = useState<AdminAuthState>({ admin: null, isAuthenticated: false })
  const [showLogin, setShowLogin] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  const adminAuthService = AdminAuthService.getInstance()

  useEffect(() => {
    setAuthState(adminAuthService.getAuthState())
    const unsubscribe = adminAuthService.subscribe(setAuthState)

    // If already authenticated, show dashboard
    if (adminAuthService.getAuthState().isAuthenticated) {
      setShowDashboard(true)
    } else {
      setShowLogin(true)
    }

    return unsubscribe
  }, [])

  const handleLoginSuccess = () => {
    setShowLogin(false)
    setShowDashboard(true)
  }

  const handleLogout = () => {
    adminAuthService.logout()
    setShowDashboard(false)
    setShowLogin(true)
  }

  const handleShowDashboard = () => {
    setShowDashboard(true)
  }

  const goToMainSite = () => {
    window.location.href = "/"
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Kurdistan Summer Houses</CardTitle>
              <p className="text-muted-foreground">Admin Panel Access</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Admin Credentials</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Username:</strong> <code className="bg-blue-100 px-1 rounded">admin</code>
                    </p>
                    <p>
                      <strong>Password:</strong> <code className="bg-blue-100 px-1 rounded">admin123</code>
                    </p>
                  </div>
                </div>

                <Button onClick={() => setShowLogin(true)} className="w-full" size="lg">
                  <Shield className="w-4 h-4 mr-2" />
                  Access Admin Panel
                </Button>

                <Button variant="outline" onClick={goToMainSite} className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Main Website
                </Button>
              </div>
            </CardContent>
          </Card>

          <AdminLogin isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <span className="ml-2 text-sm text-gray-500">- {authState.admin?.username}</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleShowDashboard}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={goToMainSite}>
                <Eye className="w-4 h-4 mr-2" />
                View Website
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard
          isOpen={showDashboard}
          onClose={() => {
            setShowDashboard(false)
          }}
        />
      </main>
    </div>
  )
}
