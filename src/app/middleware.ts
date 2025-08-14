import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for now - just protect the dashboard route
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // For now, let the client-side handle authentication
  // In a real app, you'd want to check the session here
  
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}
