import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      houses: {
        Row: {
          id: string
          title: string
          area: string
          city: string
          price: number
          currency: string
          rating: number
          reviews: number
          bedrooms: number
          bathrooms: number
          guests: number
          parking: boolean
          available: boolean
          images: string[]
          description: string | null
          amenities: string[]
          phone: string | null
          whatsapp: string | null
          lat: number | null
          lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          area: string
          city: string
          price: number
          currency?: string
          rating?: number
          reviews?: number
          bedrooms: number
          bathrooms: number
          guests: number
          parking?: boolean
          available?: boolean
          images?: string[]
          description?: string | null
          amenities?: string[]
          phone?: string | null
          whatsapp?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          area?: string
          city?: string
          price?: number
          currency?: string
          rating?: number
          reviews?: number
          bedrooms?: number
          bathrooms?: number
          guests?: number
          parking?: boolean
          available?: boolean
          images?: string[]
          description?: string | null
          amenities?: string[]
          phone?: string | null
          whatsapp?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          house_id: string
          user_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          original_price: number | null
          discount_applied: number
          status: "pending" | "confirmed" | "cancelled"
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          house_id: string
          user_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          original_price?: number | null
          discount_applied?: number
          status?: "pending" | "confirmed" | "cancelled"
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          house_id?: string
          user_id?: string
          check_in?: string
          check_out?: string
          guests?: number
          total_price?: number
          original_price?: number | null
          discount_applied?: number
          status?: "pending" | "confirmed" | "cancelled"
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          house_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          house_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          house_id?: string
          created_at?: string
        }
      }
      discounts: {
        Row: {
          id: string
          house_id: string
          discount_type: "percentage" | "fixed"
          discount_value: number
          start_date: string
          end_date: string
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          house_id: string
          discount_type: "percentage" | "fixed"
          discount_value: number
          start_date: string
          end_date: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          house_id?: string
          discount_type?: "percentage" | "fixed"
          discount_value?: number
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          related_id?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: "admin" | "super-admin"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: "admin" | "super-admin"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "admin" | "super-admin"
          created_at?: string
        }
      }
    }
  }
}
