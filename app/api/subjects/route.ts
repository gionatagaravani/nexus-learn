import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

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
    const { title, description, userId } = body

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        title,
        description,
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
