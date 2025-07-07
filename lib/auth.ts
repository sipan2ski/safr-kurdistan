"use client"

export interface User {
  id: string
  email: string
  name: string
  favorites: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Simple authentication system using localStorage
export class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.loadUserFromStorage()
    }
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      this.authState = {
        user,
        isAuthenticated: true,
      }
    }
  }

  private saveUserToStorage(user: User) {
    localStorage.setItem("user", JSON.stringify(user))
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.authState))
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getAuthState(): AuthState {
    return this.authState
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    // Simple validation - in real app, this would be server-side
    if (!email || !password) {
      return { success: false, message: "Please enter email and password" }
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const existingUser = users.find((u: any) => u.email === email && u.password === password)

    if (existingUser) {
      const user: User = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        favorites: existingUser.favorites || [],
      }

      this.authState = {
        user,
        isAuthenticated: true,
      }

      this.saveUserToStorage(user)
      this.notifyListeners()
      return { success: true, message: "Login successful" }
    }

    return { success: false, message: "Invalid email or password" }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; message: string }> {
    if (!email || !password || !name) {
      return { success: false, message: "Please fill all fields" }
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const existingUser = users.find((u: any) => u.email === email)

    if (existingUser) {
      return { success: false, message: "User already exists with this email" }
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      favorites: [],
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      favorites: [],
    }

    this.authState = {
      user,
      isAuthenticated: true,
    }

    this.saveUserToStorage(user)
    this.notifyListeners()
    return { success: true, message: "Account created successfully" }
  }

  logout() {
    this.authState = {
      user: null,
      isAuthenticated: false,
    }
    localStorage.removeItem("user")
    this.notifyListeners()
  }

  addToFavorites(houseId: string) {
    if (!this.authState.user) return

    const updatedUser = {
      ...this.authState.user,
      favorites: [...this.authState.user.favorites, houseId],
    }

    this.authState.user = updatedUser
    this.saveUserToStorage(updatedUser)
    this.updateUserInStorage(updatedUser)
    this.notifyListeners()
  }

  removeFromFavorites(houseId: string) {
    if (!this.authState.user) return

    const updatedUser = {
      ...this.authState.user,
      favorites: this.authState.user.favorites.filter((id) => id !== houseId),
    }

    this.authState.user = updatedUser
    this.saveUserToStorage(updatedUser)
    this.updateUserInStorage(updatedUser)
    this.notifyListeners()
  }

  private updateUserInStorage(user: User) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, favorites: user.favorites } : u))
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  isFavorite(houseId: string): boolean {
    return this.authState.user?.favorites.includes(houseId) || false
  }
}
