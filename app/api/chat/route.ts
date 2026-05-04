import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { chatWithGemini, type ChatMessage } from '@/lib/ai/gemini'
import { generateEmbedding } from '@/lib/embeddings/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { messages, subjectId, userId, chatId } = await request.json()

    if (!messages || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get last user message for context retrieval
    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === 'user').pop()
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    // Find relevant chunks using similarity search
    let context = ''
    let sources: string[] = []

    try {
      const queryEmbedding = await generateEmbedding(lastUserMessage.content)

      let dbQuery = supabase
        .from('chunks')
        .select('*')

      if (subjectId) {
        dbQuery = dbQuery.eq('material_id', subjectId)
      }

      const { data: chunks } = await dbQuery

      if (chunks && chunks.length > 0) {
        // Calculate similarity (client-side for now)
        const results = chunks
          .map((doc) => ({
            ...doc,
            similarity: cosineSimilarity(queryEmbedding, doc.embedding || []),
          }))
          .filter((doc) => doc.similarity > 0.6)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3)

        context = results.map((r) => r.content).join('\n\n---\n\n')
        sources = results.map((r) => r.id)
      }
    } catch (error) {
      console.error('Context retrieval error:', error)
      // Continue without context if retrieval fails
    }

    // Get AI response with context
    const response = await chatWithGemini(messages, context)

    // Save chat messages if chatId is provided
    if (chatId) {
      // Save user message
      await supabase.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: lastUserMessage.content,
        context_sources: sources,
        user_id: userId,
      })

      // Save assistant response
      await supabase.from('messages').insert({
        chat_id: chatId,
        role: 'assistant',
        content: response.message,
        user_id: userId,
      })
    }

    return NextResponse.json({
      message: response.message,
      sources,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

// Cosine similarity helper
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
