import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session_token')
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup'],
}
