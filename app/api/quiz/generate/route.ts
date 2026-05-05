import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQuiz } from '@/lib/ai/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { subjectId, userId, topic, difficulty = 'intermediate', questionCount = 5 } = await request.json()

    if (!subjectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get materials for the subject
    const { data: materials } = await supabase
      .from('materials')
      .select('id')
      .eq('subject_id', subjectId)

    // Get chunks for the subject
    let dbQuery = supabase.from('chunks').select('content, material_id')

    if (materials && materials.length > 0) {
      const materialIds = materials.map(m => m.id)
      dbQuery = dbQuery.in('material_id', materialIds)
    }

    const { data: chunks } = await dbQuery

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'No materials found for this subject' },
        { status: 404 }
      )
    }

    // Build context from chunks - use more chunks for better quiz quality
    const context = chunks
      .map((m) => m.content)
      .slice(0, 15) // Increased from 5 to 15 for better coverage
      .join('\n\n---\n\n')

    // Generate quiz
    const quizQuestions = await generateQuiz(
      topic || 'Subject Materials',
      context,
      difficulty,
      questionCount
    )

    // Create quiz in database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        subject_id: subjectId,
        title: `${topic || 'Practice'} Quiz`,
        description: `Generated from ${chunks.length} chunks`,
        questions: quizQuestions,
        difficulty,
        user_id: userId,
      })
      .select()
      .single()

    if (quizError) throw quizError

    return NextResponse.json({
      quiz,
      questions: quizQuestions,
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
