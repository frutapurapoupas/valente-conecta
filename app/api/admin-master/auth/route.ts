import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const senha = body.get('senha')?.toString() ?? ''
  const pass = process.env.ADMIN_MASTER_PASS ?? 'VC@master2026'

  if (senha !== pass) {
    return NextResponse.redirect(new URL('/admin-master/login?erro=1', req.url))
  }

  const response = NextResponse.redirect(new URL('/admin-master/dashboard', req.url))
  response.cookies.set('am_token', pass, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
  return response
}
