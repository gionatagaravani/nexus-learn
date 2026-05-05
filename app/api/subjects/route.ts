import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('List subjects error:', error)
    return NextResponse.json(
      { error: 'Failed to list subjects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, icon, userId } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        name,
        icon: icon || '📚',
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ subject })
  } catch (error) {
    console.error('Create subject error:', error)
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}
