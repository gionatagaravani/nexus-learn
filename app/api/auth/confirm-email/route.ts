import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the current session and check if the logged-in user matches
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 })
    }

    if (session.user?.email === email) {
      return NextResponse.json({
        message: 'User found. Please check your email for the confirmation link.',
        emailConfirmed: !!session.user.email_confirmed_at
      })
    }

    return NextResponse.json({ error: 'Email does not match logged-in user' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
