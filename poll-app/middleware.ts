import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle embed routes
  if (request.nextUrl.pathname.startsWith('/embed/')) {
    const response = NextResponse.next()
    
    // Remove restrictive frame options for embed routes
    response.headers.delete('X-Frame-Options')
    
    // Set permissive CSP for embedding
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *; default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https:;"
    )
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/embed/:path*'
}