import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * GET: Fetch all notes for a subject or user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    
    const supabase = await createClient()
    
    let query = supabase.from('notes').select('*').order('updated_at', { ascending: false })
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Fetch notes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new note
 */
export async function POST(request: NextRequest) {
  try {
    const { subjectId, title, content, userId } = await request.json()

    if (!subjectId || !title || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notes')
      .insert({
        subject_id: subjectId,
        title,
        content,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
