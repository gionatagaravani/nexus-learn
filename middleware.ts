import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update request cookie so server components see it
          req.cookies.set(name, value)
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove request cookie so server components see it
          req.cookies.delete(name)
          res.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/signup')
  const isAuthCallback = req.nextUrl.pathname.startsWith('/auth/callback')
  const isTestPage = req.nextUrl.pathname.startsWith('/test-auth')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  // Allow public access to auth callback, test pages, and API routes
  if (isAuthCallback || isTestPage || isApiRoute) {
    return res
  }

  // Redirect to login if not authenticated (all pages except auth pages)
  if (!user && !isAuthPage) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to home if already authenticated on auth pages
  if (user && isAuthPage) {
    const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
