import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { uploadMaterial, getFileType } from '@/lib/supabase/storage'
import { parsePDF, chunkPDF } from '@/lib/parsers/pdf'

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

    // Upload file to Supabase Storage
    const uploadResult = await uploadMaterial(userId, subjectId, file)

    // Insert material metadata into database
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .insert({
        subject_id: subjectId,
        storage_path: uploadResult.path,
        filename: uploadResult.filename,
        file_type: uploadResult.type,
        file_size: uploadResult.size,
        user_id: userId,
      })
      .select()
      .single()

    if (materialError) {
      // Rollback storage upload
      await supabase.storage.from('materials').remove([uploadResult.path])
      throw materialError
    }

    // Parse PDF if applicable
    if (uploadResult.type === 'pdf') {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const parsedPDF = await parsePDF(buffer)
      const chunks = chunkPDF(parsedPDF)

      // Store chunks in documents table
      // Note: Embeddings would be generated here with AI API
      const { error: documentsError } = await supabase
        .from('documents')
        .insert(
          chunks.map((chunk, index) => ({
            material_id: material.id,
            chunk_index: index,
            content: chunk.text,
            metadata: {
              pageNumbers: chunk.pageNumbers,
              totalChunks: chunks.length,
            },
            user_id: userId,
            // embedding: null, // Will be updated after AI generation
          }))
        )

      if (documentsError) {
        throw documentsError
      }
    }

    return NextResponse.json({
      material,
      uploadResult,
      chunks: uploadResult.type === 'pdf' ? 'parsed' : null,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    )
  }
}
