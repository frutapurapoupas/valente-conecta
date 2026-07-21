import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ATIVE ESTA VARIÁVEL PARA PULAR LOGIN (true = modo dev)
const MODO_DEV = true; 

const publicRoutes = [
  '/', '/login', '/register', '/planos', '/qr-code', '/convite',
  '/convite-expirado', '/busca', '/comercio', '/academia', 
  '/servicos', '/cozinha', '/mototaxi', '/ajuda', '/diagnostico', 
  '/lancamento', '/teste-geo', '/servico-indisponivel'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Se estiver em modo dev, libera tudo
  if (MODO_DEV) return NextResponse.next();

  // Libera rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Regra específica para o painel administrativo (incluindo admin-master)
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-master')) {
    const userRole = request.cookies.get('user_role')?.value;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Regra para usuários logados comuns
  const isLoggedIn = request.cookies.get('user_logged_in')?.value === 'true';
  if (isLoggedIn) return NextResponse.next();
  
  // Redireciona não logados para a home com parametro de cadastro
  const url = new URL('/', request.url);
  url.searchParams.set('showCadastro', 'true');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

