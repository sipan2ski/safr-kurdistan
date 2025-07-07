"use client"

export interface AdminUser {
  id: string
  username: string
  email: string
  role: "admin" | "super-admin"
}

export interface AdminAuthState {
  admin: AdminUser | null
  isAuthenticated: boolean
}

export class AdminAuthService {
  private static instance: AdminAuthService
  private authState: AdminAuthState = {
    admin: null,
    isAuthenticated: false,
  }
  private listeners: ((state: AdminAuthState) => void)[] = []

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService()
    }
    return AdminAuthService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.loadAdminFromStorage()
      this.initializeDefaultAdmin()
    }
  }

  private initializeDefaultAdmin() {
    const admins = JSON.parse(localStorage.getItem("admins") || "[]")
    if (admins.length === 0) {
      // Create default admin account
      const defaultAdmin = {
        id: "admin-1",
        username: "admin",
        email: "admin@kurdistanhouses.com",
        password: "admin123", // In real app, this would be hashed
        role: "super-admin",
      }
      localStorage.setItem("admins", JSON.stringify([defaultAdmin]))
    }
  }

  private loadAdminFromStorage() {
    const adminData = localStorage.getItem("admin")
    if (adminData) {
      const admin = JSON.parse(adminData)
      this.authState = {
        admin,
        isAuthenticated: true,
      }
    }
  }

  private saveAdminToStorage(admin: AdminUser) {
    localStorage.setItem("admin", JSON.stringify(admin))
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.authState))
  }

  subscribe(listener: (state: AdminAuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getAuthState(): AdminAuthState {
    return this.authState
  }

  async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    if (!username || !password) {
      return { success: false, message: "Please enter username and password" }
    }

    const admins = JSON.parse(localStorage.getItem("admins") || "[]")
    const admin = admins.find((a: any) => a.username === username && a.password === password)

    if (admin) {
      const adminUser: AdminUser = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      }

      this.authState = {
        admin: adminUser,
        isAuthenticated: true,
      }

      this.saveAdminToStorage(adminUser)
      this.notifyListeners()
      return { success: true, message: "Login successful" }
    }

    return { success: false, message: "Invalid username or password" }
  }

  logout() {
    this.authState = {
      admin: null,
      isAuthenticated: false,
    }
    localStorage.removeItem("admin")
    this.notifyListeners()
  }
}
