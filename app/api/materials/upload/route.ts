import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadMaterial } from '@/lib/supabase/storage'
import { parsePDF, chunkPDF } from '@/lib/parsers/pdf'
import { parseImage } from '@/lib/parsers/image'
import { parseDocumentWithAI } from '@/lib/parsers/document'
import { generateEmbedding, generateEmbeddingsBatch } from '@/lib/embeddings/gemini'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const subjectId = formData.get('subjectId') as string
    const userId = formData.get('userId') as string

    if (!file || !subjectId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userIdToUse = user.id

    // Upload file to Supabase Storage using the authenticated server client
    console.log(`[Upload] Starting upload for file: ${file.name}, type: ${file.type}, size: ${file.size}`)
    const uploadResult = await uploadMaterial(userIdToUse, subjectId, file, supabase)
    console.log(`[Upload] Storage upload successful: ${uploadResult.path}, detected type: ${uploadResult.type}`)

    // Insert material metadata into database
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .insert({
        subject_id: subjectId,
        storage_path: uploadResult.path,
        filename: uploadResult.filename,
        file_type: uploadResult.type,
        file_size: uploadResult.size,
        user_id: userIdToUse,
      })
      .select()
      .single()

    if (materialError) {
      console.error('[Upload] Database error inserting material:', materialError)
      // Rollback storage upload
      await supabase.storage.from('materials').remove([uploadResult.path])
      throw materialError
    }

    console.log(`[Upload] Material metadata inserted, ID: ${material.id}`)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process file based on type
    if (uploadResult.type === 'pdf') {
      console.log(`[Upload] Processing PDF: ${material.id}`)
      const parsedPDF = await parsePDF(buffer)
      console.log(`[Upload] PDF parsed: ${parsedPDF.totalPages} pages, ${parsedPDF.text.length} chars`)
      
      const chunks = chunkPDF(parsedPDF)
      console.log(`[Upload] PDF chunked: ${chunks.length} chunks`)

      if (chunks.length > 0) {
        // Generate embeddings for all chunks
        const chunkTexts = chunks.map(c => c.text)
        console.log(`[Upload] Generating embeddings for ${chunks.length} chunks...`)
        const embeddings = await generateEmbeddingsBatch(chunkTexts)
        console.log(`[Upload] Embeddings generated: ${embeddings.length}`)

        // Store chunks in chunks table with embeddings
        const { error: chunksError } = await supabase
          .from('chunks')
          .insert(
            chunks.map((chunk, index) => ({
              material_id: material.id,
              chunk_index: index,
              content: chunk.text,
              metadata: {
                pageNumbers: chunk.pageNumbers,
                totalChunks: chunks.length,
              },
              user_id: userIdToUse,
              embedding: embeddings[index],
            }))
          )

        if (chunksError) {
          console.error('[Upload] Error inserting chunks:', chunksError)
          throw chunksError
        }
        console.log(`[Upload] ${chunks.length} chunks stored successfully`)
      } else {
        console.warn(`[Upload] No chunks created for PDF: ${material.id}.`)
      }
    } 
    else if (uploadResult.type === 'image') {
      console.log(`[Upload] Processing Image: ${material.id}`)
      const parsedImage = await parseImage(buffer, file.type)
      console.log(`[Upload] Image parsed: ${parsedImage.text.length} chars of text`)
      
      // Generate embedding for the image text/description
      const contentToEmbed = `${parsedImage.description}\n\n${parsedImage.text}`
      console.log(`[Upload] Generating embedding for image content...`)
      const embedding = await generateEmbedding(contentToEmbed)

      // Store as a single chunk for images
      const { error: chunkError } = await supabase
        .from('chunks')
        .insert({
          material_id: material.id,
          chunk_index: 0,
          content: contentToEmbed,
          metadata: {
            concepts: parsedImage.concepts,
            type: 'image_ocr'
          },
          user_id: userIdToUse,
          embedding: embedding,
        })

      if (chunkError) {
        console.error('[Upload] Error inserting image chunk:', chunkError)
        throw chunkError
      }
      console.log(`[Upload] Image chunk stored successfully`)
    }
    else {
      // Use AI to parse slides, Word docs, etc.
      console.log(`[Upload] Processing ${uploadResult.type} with Gemini AI: ${material.id}`)
      
      const parsedDoc = await parseDocumentWithAI(buffer, file.type, file.name)
      const contentToEmbed = `${parsedDoc.description}\n\n${parsedDoc.text}`
      
      console.log(`[Upload] Generating embedding for ${uploadResult.type} content...`)
      const embedding = await generateEmbedding(contentToEmbed)

      const { error: chunkError } = await supabase
        .from('chunks')
        .insert({
          material_id: material.id,
          chunk_index: 0,
          content: contentToEmbed,
          metadata: {
            type: 'ai_document_extraction',
            original_type: uploadResult.type,
            concepts: parsedDoc.concepts,
            filename: uploadResult.filename
          },
          user_id: userIdToUse,
          embedding: embedding,
        })
      
      if (chunkError) {
        console.error('[Upload] Error inserting AI extracted chunk:', chunkError)
        throw chunkError
      }
      console.log(`[Upload] AI extracted chunk stored for ${uploadResult.type}`)
    }

    return NextResponse.json({
      material,
      uploadResult,
      processed: true
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    )
  }
}
