import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const authCookies = cookies.filter(c => c.name.includes('sb-') || c.name.includes('supabase'))

  return NextResponse.json({
    totalCookies: cookies.length,
    authCookies: authCookies.map(c => ({
      name: c.name,
      value: c.value ? `${c.value.substring(0, 20)}...` : 'empty',
      exists: !!c.value,
    })),
    allCookieNames: cookies.map(c => c.name),
  })
}
