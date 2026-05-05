import { GoogleGenAI } from '@google/genai'

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export interface ParsedDocument {
  text: string
  description: string
  concepts: string[]
}

/**
 * Extract text and information from any document type using Gemini
 */
export async function parseDocumentWithAI(
  buffer: Buffer, 
  mimeType: string,
  filename: string
): Promise<ParsedDocument> {
  try {
    console.log(`[Parser] Sending ${filename} (${mimeType}) to Gemini for AI extraction...`)
    
    // Using @google/genai syntax
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: buffer.toString('base64'),
                mimeType
              }
            },
            { text: `Extract all visible text from this document (${filename}). Then, provide a brief description of the content and list 3-5 key study concepts mentioned. Format the output as JSON with fields: 'text', 'description', 'concepts'.` }
          ]
        }
      ]
    })

    const text = response.text || ''
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        console.log(`[Parser] AI extraction successful for ${filename}`)
        return parsed as ParsedDocument
      } catch (e) {
        console.error('Failed to parse AI OCR JSON:', e)
      }
    }

    return {
      text: text,
      description: 'AI extracted content',
      concepts: []
    }
  } catch (error) {
    console.error('Document parsing error:', error)
    throw new Error(`Failed to parse document ${filename} with AI`)
  }
}
