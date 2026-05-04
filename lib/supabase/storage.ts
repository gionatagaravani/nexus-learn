import { supabase } from './client'

interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string | null
  metadata: Record<string, any>
  size: number
  buckets_id: string
  path: string
}

const MATERIALS_BUCKET = 'materials'

export type FileType = 'pdf' | 'image' | 'slide' | 'document'

export interface UploadResult {
  path: string
  url: string
  filename: string
  size: number
  type: FileType
}

/**
 * Get file type from extension
 */
export function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'pdf'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'image'
    case 'ppt':
    case 'pptx':
    case 'key':
      return 'slide'
    default:
      return 'document'
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadMaterial(
  userId: string,
  subjectId: string,
  file: File
): Promise<UploadResult> {
  // Create path: {userId}/{subjectId}/{timestamp}-{filename}
  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name}`
  const path = `${userId}/${subjectId}/${filename}`

  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const fileType = getFileType(file.name)

  return {
    path,
    url: `${MATERIALS_BUCKET}/${path}`,
    filename: file.name,
    size: file.size,
    type: fileType,
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteMaterial(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(MATERIALS_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * List all files for a subject
 */
export async function listSubjectMaterials(
  userId: string,
  subjectId: string
): Promise<any[]> {
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .list(`${userId}/${subjectId}`, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) {
    throw new Error(`List failed: ${error.message}`)
  }

  return data || []
}
