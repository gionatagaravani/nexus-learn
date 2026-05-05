import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from '@/lib/ai/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { subjectId, userId, prompt } = await request.json()

    if (!subjectId || !userId) {
      return NextResponse.json(
        { error: 'Missing subjectId or userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Fetch some context from the materials of this subject
    const { data: chunks, error: chunksError } = await supabase
      .from('chunks')
      .select('content, materials!inner(subject_id)')
      .eq('materials.subject_id', subjectId)
      .limit(20) // Get more context for better notes

    if (chunksError) throw chunksError

    const contextText = chunks?.map(c => c.content).join('\n\n') || ''

    if (!contextText) {
      return NextResponse.json(
        { error: 'No materials found for this subject. Upload some documents first.' },
        { status: 400 }
      )
    }

    // 2. Build the prompt for Gemini
    const fullPrompt = `
      You are an expert academic assistant. Based on the following course materials, generate a structured, comprehensive, and clear set of study notes in Markdown format.
      
      The user specifically asked for: ${prompt || "A general summary and key concepts"}
      
      COURSE CONTEXT:
      ${contextText}
      
      INSTRUCTIONS:
      - Use professional and clear language.
      - Use Markdown for structure (headings, lists, bold text).
      - Focus on key concepts, definitions, and practical examples.
      - Keep it concise but thorough.
      - If the context is not enough to answer specifically, provide a general educational overview related to the topic.
    `

    console.log(`Generating notes for subject ${subjectId}...`)
    const aiResponse = await generateText(fullPrompt)
    
    if (!aiResponse) {
      throw new Error('AI returned an empty response')
    }

    return NextResponse.json({ notes: aiResponse })
  } catch (error) {
    console.error('Generate notes error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI notes' },
      { status: 500 }
    )
  }
}
