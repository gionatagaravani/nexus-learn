import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithGemini, type ChatMessage } from '@/lib/ai/gemini'
import { generateEmbedding } from '@/lib/embeddings/gemini'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const userId = searchParams.get('userId')

    if (!subjectId || !userId) {
      return NextResponse.json(
        { error: 'Missing subjectId or userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the chat for this subject/user
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('user_id', userId)
      .single()

    if (chatError && chatError.code !== 'PGRST116') {
      throw chatError
    }

    if (!chat) {
      return NextResponse.json({ messages: [] })
    }

    // Get messages for this chat
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true })

    if (messagesError) throw messagesError

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, subjectId, userId, image, lingua } = await request.json()

    if (!messages || !userId || !subjectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ensure a chat exists for this subject/user
    let { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('user_id', userId)
      .single()

    if (chatError && chatError.code === 'PGRST116') {
      const { data: newChat, error: createChatError } = await supabase
        .from('chats')
        .insert({ subject_id: subjectId, user_id: userId })
        .select()
        .single()
      
      if (createChatError) throw createChatError
      chat = newChat
    } else if (chatError) {
      throw chatError
    }

    const chatId = chat!.id

    // Get last user message
    const lastUserMessage = messages.filter((m: ChatMessage) => m.role === 'user').pop()
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 })
    }

    // Handle Image Persistence
    let imageUrl = null
    if (image) {
      try {
        const buffer = Buffer.from(image.data, 'base64')
        const fileName = `chat-${Date.now()}.${image.mimeType.split('/')[1]}`
        const path = `${userId}/chats/${chatId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(path, buffer, {
            contentType: image.mimeType,
            upsert: true
          })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('materials')
            .getPublicUrl(path)
          imageUrl = publicUrl
        }
      } catch (err) {
        console.error('Image upload failed:', err)
      }
    }

    // RAG Context (Karpathy-style: Wiki + Chunks)
    let context = ''
    let sources: string[] = []
    if (lastUserMessage.content.trim()) {
      try {
        const queryEmbedding = await generateEmbedding(lastUserMessage.content)
        
        // 1. Search the Wiki (Synthesized, high-level knowledge)
        const { data: wikiResults } = await supabase.rpc('match_wiki_pages', {
          query_embedding: queryEmbedding,
          match_threshold: 0.4,
          match_count: 2,
          p_subject_id: subjectId,
        })

        // 2. Search Raw Chunks (Detailed, specific evidence)
        const { data: chunkResults } = await supabase.rpc('match_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: 3,
          p_subject_id: subjectId,
        })

        let contextParts: string[] = []
        
        if (wikiResults && wikiResults.length > 0) {
          contextParts.push("### Synthesized Wiki Knowledge:")
          wikiResults.forEach((w: any) => {
            contextParts.push(`Title: ${w.title}\n${w.content}`)
          })
        }

        if (chunkResults && chunkResults.length > 0) {
          contextParts.push("### Raw Study Material Excerpts:")
          chunkResults.forEach((c: any) => {
            contextParts.push(c.content)
            sources.push(c.id)
          })
        }

        context = contextParts.join('\n\n---\n\n')
      } catch (error) {
        console.error('RAG error:', error)
      }
    }

    // AI Response
    const response = await chatWithGemini(messages, context, image, lingua)

    // Persist messages
    await Promise.all([
      supabase.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: lastUserMessage.content,
        context_sources: sources,
        user_id: userId,
        image_url: imageUrl
      }),
      supabase.from('messages').insert({
        chat_id: chatId,
        role: 'assistant',
        content: response.message,
        user_id: userId,
      })
    ])

    return NextResponse.json({
      message: response.message,
      sources,
      imageUrl
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
