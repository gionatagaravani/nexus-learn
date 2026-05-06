import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings/gemini'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Compiles raw chunks into structured wiki pages for a subject.
 * This is the "Ingest" phase of the Karpathy-style RAG.
 */
export async function updateWikiForSubject(subjectId: string, userId: string, chunks: string[]) {
  // If no chunks, nothing to do
  if (!chunks.length) return

  const supabase = await createClient()

  // 1. Identify and synthesize concepts from new chunks
  const prompt = `You are a knowledge organizer for a university learning platform. 
Given the following excerpts from study materials for a subject, identify the core concepts, theories, or entities discussed.
For each concept, provide a comprehensive but concise explanation in structured Markdown.

Format each concept as follows:
[[TITLE: Concept Name]]
[[CONTENT]]
Markdown content here...
[[END]]

Excerpts:
${chunks.join('\n\n---\n\n')}
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })

    const text = response.text || ''
    const conceptRegex = /\[\[TITLE:\s*(.*?)\]\]\s*\[\[CONTENT\]\]([\s\S]*?)\[\[END\]\]/g
    let match

    while ((match = conceptRegex.exec(text)) !== null) {
      const title = match[1].trim()
      const newContent = match[2].trim()

      // Check if concept exists
      const { data: existingPage } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('subject_id', subjectId)
        .ilike('title', title)
        .maybeSingle()

      if (existingPage) {
        // Merge
        const mergePrompt = `Merge these two explanations of "${title}" into a single, high-quality, and comprehensive Markdown document.
Remove redundancies, ensure logical flow, and keep all unique information.

Existing Wiki Page:
${existingPage.content}

New Information to Integrate:
${newContent}
`
        const mergeResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: mergePrompt }] }]
        })

        const mergedContent = mergeResult.text || existingPage.content
        const embedding = await generateEmbedding(mergedContent)

        await supabase
          .from('wiki_pages')
          .update({
            content: mergedContent,
            embedding,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPage.id)
      } else {
        // Create
        const embedding = await generateEmbedding(newContent)
        await supabase
          .from('wiki_pages')
          .insert({
            subject_id: subjectId,
            user_id: userId,
            title,
            content: newContent,
            embedding
          })
      }
    }
  } catch (error) {
    console.error('Wiki synthesis error:', error)
  }
}

/**
 * Searches the Wiki for relevant context.
 * This provides "High-Signal" context for the LLM.
 */
export async function searchWiki(subjectId: string, query: string, limit: number = 3) {
  const supabase = await createClient()
  const queryEmbedding = await generateEmbedding(query)

  const { data: results, error } = await supabase.rpc('match_wiki_pages', {
    query_embedding: queryEmbedding,
    match_threshold: 0.4, // Slightly lower threshold for wiki to catch broader concepts
    match_count: limit,
    p_subject_id: subjectId,
  })

  if (error) {
    console.error('Wiki search error:', error)
    return []
  }

  return results || []
}
