import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-minimal-32-karakter'
const key = new TextEncoder().encode(secretKey)

export default async function proxy(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value
  const pathname = request.nextUrl.pathname

  let isValid = false

  if (session) {
    try {
      await jwtVerify(session, key)
      isValid = true
    } catch {
      isValid = false
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/login')) {
    if (isValid) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}