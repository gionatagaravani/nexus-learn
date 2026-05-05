import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { query, materialId, subjectId, limit = 5 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Perform similarity search using pgvector via RPC
    const { data: results, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      p_material_id: materialId || null,
      p_subject_id: subjectId || null,
    })

    if (error) {
      console.error('RPC search error:', error)
      throw error
    }

    return NextResponse.json({ results: results || [] })
  } catch (error) {
    console.error('Similarity search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
