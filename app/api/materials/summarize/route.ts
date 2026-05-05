import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { summarizeDocument } from '@/lib/ai/gemini'

export const runtime = 'nodejs'

/**
 * POST: Summarize a specific material
 */
export async function POST(request: NextRequest) {
  try {
    const { materialId } = await request.json()

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Get material content
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .select('filename, extracted_text')
      .eq('id', materialId)
      .single()

    if (materialError) throw materialError

    let content = material.extracted_text

    // 2. If no extracted text, get chunks
    if (!content) {
      const { data: chunks, error: chunksError } = await supabase
        .from('chunks')
        .select('content')
        .eq('material_id', materialId)
        .order('chunk_index', { ascending: true })

      if (chunksError) throw chunksError
      
      if (!chunks || chunks.length === 0) {
        return NextResponse.json(
          { error: 'No content found for this material' },
          { status: 404 }
        )
      }

      content = chunks.map(c => c.content).join('\n\n')
    }

    // 3. Generate summary
    const summary = await summarizeDocument(content)

    return NextResponse.json({ 
      summary, 
      filename: material.filename 
    })
  } catch (error) {
    console.error('Summarization API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
