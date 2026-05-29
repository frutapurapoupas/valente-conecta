// C:\valente_conecta\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas (não exigem autenticação)
const publicRoutes = [
  '/', '/login', '/register', '/planos', '/qr-code', '/convite',
  '/convite-expirado', // Nova rota de retenção viral
  '/busca', '/comercio', '/academia', '/servicos', '/cozinha', '/mototaxi',
  '/ajuda', '/diagnostico', '/lancamento', '/teste-geo', '/servico-indisponivel',
  '/_next', '/favicon.ico', '/manifest.json', '/sw.js', '/icons',
  '/api/busca', '/api/comercio', '/api/academia', '/api/mototaxi', '/api/servicos'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Rotas admin
  if (pathname.startsWith('/admin')) {
    const userRole = request.cookies.get('user_role')?.value;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Verificar autenticação
  const isLoggedIn = request.cookies.get('user_logged_in')?.value === 'true';
  const sessaoTemp = request.cookies.get('sessao_temp_id')?.value;
  const userStatus = request.cookies.get('user_status')?.value; // 'premium' ou 'gratis'

  if (isLoggedIn) {
    return NextResponse.next();
  }
  
  // Lógica Viral: Verificar Expiração do Trial (2 dias) ou Status Premium
  if (sessaoTemp) {
    const sessaoExpira = request.cookies.get('sessao_temp_expira')?.value;
    
    // Libera se for premium OU se o trial ainda estiver válido
    if (userStatus === 'premium' || (sessaoExpira && new Date(sessaoExpira) > new Date())) {
      return NextResponse.next();
    }
    
    // Se chegou aqui, o trial expirou e não é premium
    return NextResponse.redirect(new URL('/convite-expirado', request.url));
  }
  
  // Redirecionar para home com popup caso não tenha sessão
  const url = new URL('/', request.url);
  url.searchParams.set('showCadastro', 'true');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};