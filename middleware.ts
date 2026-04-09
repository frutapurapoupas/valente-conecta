import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  if (url.pathname.startsWith('/admin-master')) {
    const userIp = request.ip || request.headers.get('x-forwarded-for') || "";
    // No seu teste local, o IP pode vir como ::1 ou 127.0.0.1
    const AUTHORIZED_IPS = ["127.0.0.1", "::1", "192.168.1.10"]; // Adicione seu IP aqui

    if (!AUTHORIZED_IPS.some(ip => userIp.includes(ip))) {
      url.pathname = '/login-comum';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}