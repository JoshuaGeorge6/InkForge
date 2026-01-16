import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from './database.types'

// Server-side Supabase client with cookie-based auth
export const createServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const cookieStore = await cookies()
  
  // Create a simple cookie storage adapter for Next.js
  // Note: For production, use @supabase/auth-helpers-nextjs for better cookie handling
  const cookieAdapter = {
    getItem: (key: string): string | null => {
      const cookie = cookieStore.get(key)
      return cookie?.value ?? null
    },
    setItem: (key: string, value: string): void => {
      cookieStore.set(key, value, {
        httpOnly: false, // Must be false for client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    },
    removeItem: (key: string): void => {
      cookieStore.delete(key)
    },
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: cookieAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}
