import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbeddingsBatch } from '@/lib/embeddings/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { chunkIds } = await request.json()

    if (!chunkIds || !Array.isArray(chunkIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch chunks
    const { data: chunks, error } = await supabase
      .from('chunks')
      .select('id, content')
      .in('id', chunkIds)

    if (error) throw error
    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: 'No chunks found' },
        { status: 404 }
      )
    }

    // Generate embeddings
    const texts = chunks.map((d) => d.content)
    const embeddings = await generateEmbeddingsBatch(texts)

    // Update chunks with embeddings
    const updates = chunks.map((doc, index) =>
      supabase
        .from('chunks')
        .update({ embedding: embeddings[index] })
        .eq('id', doc.id)
    )

    await Promise.all(updates)

    return NextResponse.json({
      success: true,
      count: chunks.length,
    })
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    )
  }
}
