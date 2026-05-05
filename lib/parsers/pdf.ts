import { readFile } from 'fs/promises'
import { GoogleGenAI } from '@google/genai'

// Correct initialization: it takes the API key string directly, not an object
const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

// ... (keep polyfills as they are)
// ... (omitted polyfills for brevity, I will include them in the real call)
// pdf-parse depends on these browser globals which are missing in Node.js
if (typeof global !== 'undefined') {
  // @ts-ignore
  if (!global.DOMMatrix) {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
      a: number = 1; b: number = 0; c: number = 0; d: number = 1; e: number = 0; f: number = 0;
      constructor(init?: string | number[]) {
        if (Array.isArray(init)) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        }
      }
    };
  }
  // @ts-ignore
  if (!global.ImageData) {
    // @ts-ignore
    global.ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    };
  }
  // @ts-ignore
  if (!global.Path2D) {
    // @ts-ignore
    global.Path2D = class Path2D {};
  }
}

export interface PDFPage {
  pageNumber: number
  text: string
}

export interface ParsedPDF {
  text: string
  pages: PDFPage[]
  totalPages: number
}

/**
 * Extract text from a scanned PDF using Gemini Vision/OCR
 */
export async function parsePDFWithAI(buffer: Buffer): Promise<ParsedPDF> {
  try {
    console.log('[Parser] Sending PDF to Gemini for OCR extraction...')
    
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
                mimeType: 'application/pdf'
              }
            },
            { text: "Extract all text from this PDF document. Provide a comprehensive transcription of each page. Format the output as JSON with an array of objects called 'pages', each containing 'pageNumber' and 'text'." }
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
        console.log(`[Parser] AI extraction successful: ${parsed.pages.length} pages found`)
        return {
          text: parsed.pages.map((p: any) => p.text).join('\n\n'),
          pages: parsed.pages,
          totalPages: parsed.pages.length
        }
      } catch (e) {
        console.error('Failed to parse PDF OCR JSON:', e)
      }
    }

    return {
      text: text,
      pages: [{ pageNumber: 1, text: text }],
      totalPages: 1
    }
  } catch (error) {
    console.error('AI PDF parsing error:', error)
    throw new Error('Failed to parse PDF with AI')
  }
}

/**
 * Parse a PDF file and extract text
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  try {
    console.log('[Parser] Attempting standard PDF parsing...')
    
    let parse: any
    try {
      // Trying different import strategies for pdf-parse
      const mod = await import('pdf-parse')
      parse = mod.default || mod
      if (typeof parse !== 'function' && (parse as any).default) {
        parse = (parse as any).default
      }
    } catch (importError) {
      console.warn('[Parser] Could not import pdf-parse, will try AI fallback immediately.')
      return parsePDFWithAI(buffer)
    }

    if (typeof parse !== 'function') {
      console.warn('[Parser] pdf-parse is not a function, falling back to AI.')
      return parsePDFWithAI(buffer)
    }

    const data = await parse(buffer)

    const pages: PDFPage[] = data.text.split('\f').map((text: string, index: number) => ({
      pageNumber: index + 1,
      text: text.trim(),
    }))

    const filteredPages = pages.filter((page) => page.text.length > 0)
    
    // If no text was extracted (likely a scan), try AI fallback
    if (filteredPages.length === 0 && data.numpages > 0) {
      console.log('[Parser] PDF seems to be a scan (0 characters extracted), falling back to Gemini OCR...')
      return parsePDFWithAI(buffer)
    }

    return {
      text: data.text,
      pages: filteredPages,
      totalPages: data.numpages || pages.length,
    }
  } catch (error) {
    console.error('[Parser] Standard PDF parsing error:', error)
    console.log('[Parser] Falling back to Gemini OCR...')
    return parsePDFWithAI(buffer)
  }
}

/**
 * Parse a PDF file from file path
 */
export async function parsePDFFile(filePath: string): Promise<ParsedPDF> {
  const buffer = await readFile(filePath)
  return parsePDF(buffer)
}

/**
 * Count approximate tokens in text
 * Roughly: 1 token ≈ 4 characters for English
 */
export function countTokens(text: string): number {
  // Simple approximation - for production use proper tokenizer
  return Math.ceil(text.length / 4)
}

/**
 * Split text into chunks of approximately targetTokenCount tokens
 */
export interface TextChunk {
  text: string
  startIndex: number
  endIndex: number
  pageNumbers: number[]
}

export function chunkText(
  text: string,
  targetTokenCount: number = 500,
  overlapTokens: number = 100
): TextChunk[] {
  const chunks: TextChunk[] = []
  const targetCharCount = targetTokenCount * 4
  const overlapCharCount = overlapTokens * 4

  let currentIndex = 0

  while (currentIndex < text.length) {
    let endIndex = currentIndex + targetCharCount

    // Try to break at sentence/paragraph boundaries
    if (endIndex < text.length) {
      // Look for sentence ending
      const sentenceEnd = text.lastIndexOf('. ', endIndex)
      if (sentenceEnd > currentIndex + targetCharCount * 0.5) {
        endIndex = sentenceEnd + 2
      } else {
        // Try paragraph break
        const paragraphEnd = text.lastIndexOf('\n\n', endIndex)
        if (paragraphEnd > currentIndex + targetCharCount * 0.5) {
          endIndex = paragraphEnd + 2
        }
      }
    }

    endIndex = Math.min(endIndex, text.length)

    chunks.push({
      text: text.slice(currentIndex, endIndex).trim(),
      startIndex: currentIndex,
      endIndex,
      pageNumbers: [], // Will be filled in when we have page info
    })

    currentIndex = endIndex - overlapCharCount
  }

  return chunks
}

/**
 * Chunk PDF with page boundaries
 */
export function chunkPDF(
  parsed: ParsedPDF,
  targetTokenCount: number = 500
): TextChunk[] {
  const chunks: TextChunk[] = []
  let currentChunk: string[] = []
  let currentTokens = 0
  let currentPageStart = 1

  for (const page of parsed.pages) {
    const pageText = page.text
    const pageTokens = countTokens(pageText)

    // If page fits in current chunk
    if (currentTokens + pageTokens <= targetTokenCount && currentChunk.length < 3) {
      currentChunk.push(pageText)
      currentTokens += pageTokens
    } else {
      // Save current chunk
      if (currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.join('\n\n'),
          startIndex: 0,
          endIndex: 0,
          pageNumbers: Array.from(
            { length: currentChunk.length },
            (_, i) => currentPageStart + i
          ),
        })
      }

      // Start new chunk
      currentChunk = [pageText]
      currentTokens = pageTokens
      currentPageStart = page.pageNumber
    }
  }

  // Add last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      text: currentChunk.join('\n\n'),
      startIndex: 0,
      endIndex: 0,
      pageNumbers: Array.from(
        { length: currentChunk.length },
        (_, i) => currentPageStart + i
      ),
    })
  }

  return chunks
}
