import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin-master')) {
    // Página de login e API de auth ficam liberadas
    if (
      pathname === '/admin-master/login' ||
      pathname.startsWith('/api/admin-master/')
    ) {
      return NextResponse.next()
    }

    const pass = process.env.ADMIN_MASTER_PASS ?? 'VC@master2026'
    const token = request.cookies.get('am_token')?.value

    if (token !== pass) {
      const loginUrl = new URL('/admin-master/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin-master/:path*'],
}
