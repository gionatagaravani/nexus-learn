import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ subject })
  } catch (error) {
    console.error('Get subject error:', error)
    return NextResponse.json(
      { error: 'Failed to get subject' },
      { status: 500 }
    )
  }
}
