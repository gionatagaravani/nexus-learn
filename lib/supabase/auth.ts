import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Auth functions can only be called on the client side')
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export type AuthError = {
  message: string
  code?: string
}

export type AuthResult = {
  data: { user: Database['public']['Tables']['profiles']['Row'] | null } | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const supabase = getSupabaseClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || data.email.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Disable email confirmation for easier testing
        // In production, you might want to enable this
        // noConfirmEmail: true, // This option is not available in JS client
      },
    })


    if (authError) {
      return {
        data: null,
        error: { message: authError.message, code: authError.status?.toString() },
      }
    }

    if (authData.user) {

      // Profile is created automatically via database trigger
      return {
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email || null,
            full_name: data.name || null,
            avatar_url: null,
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      }
    }

    return { data: null, error: { message: 'Sign up failed' } }
  } catch (error) {
    console.error('Sign up exception:', error)
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'An error occurred',
      },
    }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  try {

    const supabase = getSupabaseClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })


    if (authError) {
      console.error('Sign in error:', authError)
      return {
        data: null,
        error: { message: authError.message, code: authError.status?.toString() },
      }
    }

    if (authData.user) {

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()


      return {
        data: {
          user: profile || {
            id: authData.user.id,
            email: authData.user.email || null,
            full_name: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      }
    }

    return { data: null, error: { message: 'Sign in failed: no user returned' } }
  } catch (error) {
    console.error('Sign in exception:', error)
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'An error occurred',
      },
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: { message: error.message, code: error.status?.toString() } }
    }
    return { error: null }
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'An error occurred',
      },
    }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { data: null, error }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { data: profile || { id: user.id, email: user.email, full_name: null, avatar_url: null, created_at: new Date().toISOString() }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: { message: error.message }, data: null }
  }

  // OAuth will redirect to Google
  if (data.url) {
    window.location.href = data.url
  }

  return { error: null, data }
}

/**
 * Handle OAuth callback
 */
export async function handleAuthCallback() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return { error: { message: error.message }, session: null }
  }

  return { error: null, session: data.session }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { error: { message: error.message, code: error.status?.toString() } }
    }

    return { error: null }
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'An error occurred',
      },
    }
  }
}
