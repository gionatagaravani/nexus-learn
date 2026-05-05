import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from '@/lib/ai/gemini'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')

    if (!subjectId) {
      return NextResponse.json({ suggestions: getDefaultSuggestions() })
    }

    const supabase = await createClient()

    // Get notes for this subject to ground suggestions
    const { data: notes, error } = await supabase
      .from('notes')
      .select('title, content')
      .eq('subject_id', subjectId)
      .limit(5)

    if (error || !notes || notes.length === 0) {
      return NextResponse.json({ suggestions: getDefaultSuggestions() })
    }

    const context = notes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join('\n\n')
    
    const prompt = `Based on these study notes, generate 4 short, engaging, and relevant questions or tasks a student might want to ask an AI tutor. 
Keep them under 6 words each.
Return ONLY a comma-separated list of the 4 suggestions.

Notes:
${context}`

    const response = await generateText(prompt)
    const suggestions = response.split(',').map(s => s.trim().replace(/^"|"$/g, ''))

    return NextResponse.json({ suggestions: suggestions.slice(0, 4) })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json({ suggestions: getDefaultSuggestions() })
  }
}

function getDefaultSuggestions() {
  return [
    "Create a quiz on this",
    "Explain key concepts",
    "Summarize materials",
    "Practice questions"
  ]
}
