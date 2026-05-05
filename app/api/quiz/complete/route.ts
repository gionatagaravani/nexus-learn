import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { quizId, score } = await request.json()

    if (!quizId || score === undefined) {
      return NextResponse.json(
        { error: 'Missing quizId or score' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('quizzes')
      .update({
        last_score: score,
        completed_at: new Date().toISOString(),
      })
      .eq('id', quizId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete quiz error:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz results' },
      { status: 500 }
    )
  }
}
