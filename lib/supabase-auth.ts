import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  name: string
  favorites: string[]
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService()
    }
    return SupabaseAuthService.instance
  }

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.user) {
      await this.loadUserProfile(session.user)
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user)
      } else {
        this.authState = {
          user: null,
          isAuthenticated: false,
        }
        this.notifyListeners()
      }
    })
  }

  private async loadUserProfile(user: User) {
    try {
      // Get user profile
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

      // Get user favorites
      const { data: favorites } = await supabase.from("favorites").select("house_id").eq("user_id", user.id)

      const favoriteIds = favorites?.map((f) => f.house_id) || []

      this.authState = {
        user: {
          id: user.id,
          email: user.email!,
          name: profile?.name || user.email!,
          favorites: favoriteIds,
        },
        isAuthenticated: true,
      }

      this.notifyListeners()
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, message: "Login successful" }
    } catch (error) {
      return { success: false, message: "Login failed" }
    }
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("user_profiles").insert({
          id: data.user.id,
          email,
          name,
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
        }
      }

      return { success: true, message: "Account created successfully" }
    } catch (error) {
      return { success: false, message: "Registration failed" }
    }
  }

  async logout() {
    await supabase.auth.signOut()
  }

  async addToFavorites(houseId: string) {
    if (!this.authState.user) return

    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: this.authState.user.id,
        house_id: houseId,
      })

      if (!error) {
        this.authState.user.favorites.push(houseId)
        this.notifyListeners()
      }
    } catch (error) {
      console.error("Error adding to favorites:", error)
    }
  }

  async removeFromFavorites(houseId: string) {
    if (!this.authState.user) return

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", this.authState.user.id)
        .eq("house_id", houseId)

      if (!error) {
        this.authState.user.favorites = this.authState.user.favorites.filter((id) => id !== houseId)
        this.notifyListeners()
      }
    } catch (error) {
      console.error("Error removing from favorites:", error)
    }
  }

  isFavorite(houseId: string): boolean {
    return this.authState.user?.favorites.includes(houseId) || false
  }
}
