import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    // Find relevant chunks using similarity search via RPC
    let context = ''
    let sources: string[] = []

    try {
      const supabase = await createClient()
      const queryEmbedding = await generateEmbedding(lastUserMessage.content)

      // Call the match_chunks function in Postgres
      const { data: chunks, error: rpcError } = await supabase.rpc('match_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
        p_subject_id: subjectId,
      })

      if (rpcError) throw rpcError

      if (chunks && chunks.length > 0) {
        context = chunks.map((r: any) => r.content).join('\n\n---\n\n')
        sources = chunks.map((r: any) => r.id)
      }
    } catch (error) {
      console.error('Context retrieval error:', error)
      // Continue without context if retrieval fails
    }

    // Get AI response with context
    const response = await chatWithGemini(messages, context)

    // Save chat messages if chatId is provided
    if (chatId) {
      const supabase = await createClient()
      
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
