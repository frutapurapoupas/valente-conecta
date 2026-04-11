import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin-master')) {
    const basicAuth = request.headers.get('authorization')

    const user = process.env.ADMIN_MASTER_USER ?? 'master'
    const pass = process.env.ADMIN_MASTER_PASS ?? 'VC@master2026'
    const expected = 'Basic ' + btoa(`${user}:${pass}`)

    if (basicAuth !== expected) {
      return new NextResponse('Acesso restrito', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Master — Valente Conecta"',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin-master/:path*'],
}
