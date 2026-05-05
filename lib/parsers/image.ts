import { GoogleGenAI } from '@google/genai'

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export interface ParsedImage {
  text: string
  description: string
  concepts: string[]
}

/**
 * Extract text and information from an image using Gemini Vision
 */
export async function parseImage(buffer: Buffer, mimeType: string): Promise<ParsedImage> {
  try {
    console.log('[Parser] Sending image to Gemini for vision analysis...')
    
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
            { text: "Extract all visible text from this image. Then, provide a brief description of the image content and list 3-5 key study concepts mentioned or illustrated. Format the output as JSON with fields: 'text', 'description', 'concepts'." }
          ]
        }
      ]
    })

    const text = response.text || ''
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        console.log('[Parser] Image analysis successful')
        return JSON.parse(jsonMatch[0]) as ParsedImage
      } catch (e) {
        console.error('Failed to parse image OCR JSON:', e)
      }
    }

    return {
      text: text,
      description: 'OCR extracted text',
      concepts: []
    }
  } catch (error) {
    console.error('Image parsing error:', error)
    throw new Error('Failed to parse image')
  }
}
