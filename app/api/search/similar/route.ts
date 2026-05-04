import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { query, materialId, userId, limit = 5 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    // Perform similarity search using pgvector
    let dbQuery = supabase.from('chunks').select('*')

    if (materialId) {
      dbQuery = dbQuery.eq('material_id', materialId)
    }

    const { data: chunks, error } = await dbQuery

    if (error) throw error
    if (!chunks) {
      return NextResponse.json({ results: [] })
    }

    // Calculate cosine similarity (client-side for now, ideally use pgvector)
    // pgvector would be: WHERE embedding <=> $1 ORDER BY embedding <=> $1
    const results = chunks
      .map((doc) => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding || []),
      }))
      .filter((doc) => doc.similarity > 0.5) // Threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Similarity search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

// Simple cosine similarity for client-side
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
