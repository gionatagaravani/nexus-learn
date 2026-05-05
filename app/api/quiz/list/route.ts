import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const userId = searchParams.get('userId')

    if (!subjectId || !userId) {
      return NextResponse.json(
        { error: 'Missing subjectId or userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ quizzes: quizzes || [] })
  } catch (error) {
    console.error('List quizzes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
