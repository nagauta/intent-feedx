import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check both cookie names: __Secure- prefix is used in production (HTTPS)
  const secureCookie = request.cookies.get('__Secure-better-auth.session_token')
  const normalCookie = request.cookies.get('better-auth.session_token')
  const sessionCookie = secureCookie || normalCookie
  const { pathname } = request.nextUrl

  // Debug logging
  console.log('[MIDDLEWARE DEBUG]', {
    pathname,
    hasSecureCookie: !!secureCookie,
    hasNormalCookie: !!normalCookie,
    allCookies: request.cookies.getAll().map(c => c.name),
  })

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      console.log('[MIDDLEWARE DEBUG] No session cookie, redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    console.log('[MIDDLEWARE DEBUG] Has session, redirecting to /admin')
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup'],
}
