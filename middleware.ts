import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes - check NextAuth session
  if (pathname.startsWith('/admin/politicians') || pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // Site password protection (for public pages)
  const sitePassword = process.env.SITE_PASSWORD
  if (!sitePassword) {
    return NextResponse.next()
  }

  // Allow access to the login page and API routes
  if (pathname === '/auth/login' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get('site_auth')

  if (!authCookie || authCookie.value !== sitePassword) {
    // Redirect to login page
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
