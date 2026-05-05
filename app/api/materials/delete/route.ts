import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * DELETE: Remove a material and its associated chunks and storage file
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('materialId')

    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Get material details to find storage path
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('storage_path, user_id')
      .eq('id', materialId)
      .single()

    if (fetchError) throw fetchError

    // 2. Delete from storage if path exists
    if (material.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('materials')
        .remove([material.storage_path])
      
      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // We continue anyway to clean up DB
      }
    }

    // 3. Delete from database (cascading should handle chunks if configured, 
    // but let's be explicit if needed or rely on the foreign key)
    const { error: deleteError } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete material error:', error)
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}
