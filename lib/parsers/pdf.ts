import { readFile } from 'fs/promises'

// @ts-ignore - pdf-parse doesn't have proper types
const pdf = require('pdf-parse')

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
 * Parse a PDF file and extract text
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const data = await pdf(buffer)

  const pages: PDFPage[] = data.text.split('\f').map((text: string, index: number) => ({
    pageNumber: index + 1,
    text: text.trim(),
  }))

  return {
    text: data.text,
    pages: pages.filter((page) => page.text.length > 0),
    totalPages: data.numpages || pages.length,
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
