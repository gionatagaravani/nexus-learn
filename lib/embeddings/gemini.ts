import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export interface EmbeddingResponse {
  embedding: number[]
  text: string
}

/**
 * Generate embedding for text using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
      config: {
        outputDimensionality: 768
      }
    })
    return result.embeddings?.[0]?.values || []
  } catch (error) {
    console.error('Embedding generation failed:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  try {
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    )
    return embeddings
  } catch (error) {
    console.error('Batch embedding generation failed:', error)
    // Fallback to sequential if concurrent fails
    const embeddings: number[][] = []
    for (const text of texts) {
      const embedding = await generateEmbedding(text)
      embeddings.push(embedding)
    }
    return embeddings
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
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
