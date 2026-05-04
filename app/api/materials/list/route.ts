import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const userId = searchParams.get('userId')

    if (!subjectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const { data: materials, error } = await supabase
      .from('materials')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('List materials error:', error)
    return NextResponse.json(
      { error: 'Failed to list materials' },
      { status: 500 }
    )
  }
}
