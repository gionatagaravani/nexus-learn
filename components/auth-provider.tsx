'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  supabase: typeof supabase
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
  initialSession
}: {
  children: ReactNode
  initialSession?: {
    user: User | null
    profile: Profile | null
  } | null
}) {
  // Initialize state from server-provided session if available
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [profile, setProfile] = useState<Profile | null>(initialSession?.profile ?? null)
  const [loading, setLoading] = useState(!initialSession) // No loading if we have initial session
  const [mounted, setMounted] = useState(false)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('Profile fetch error:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    // If we already have session from server, just set up listeners
    if (initialSession?.user) {
      console.log('[AuthProvider] Using initial session from server:', initialSession.user.id)
      supabase.auth.getSession().then(() => {
        setLoading(false)
        setMounted(true)
      })
    } else {
      // Otherwise try to get session from client
      const initializeAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
        } finally {
          setLoading(false)
          setMounted(true)
        }
      }
      initializeAuth()
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, initialSession])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshUser = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Don't render children until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshUser, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
