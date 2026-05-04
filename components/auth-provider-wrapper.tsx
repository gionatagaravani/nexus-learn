'use client'

import { AuthProvider } from './auth-provider'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthProviderWrapperProps {
  children: React.ReactNode
  initialSession: {
    user: User | null
    profile: Profile | null
  } | null
}

export function AuthProviderWrapper({ children, initialSession }: AuthProviderWrapperProps) {
  return (
    <AuthProvider initialSession={initialSession}>
      {children}
    </AuthProvider>
  )
}
