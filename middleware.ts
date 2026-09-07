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

  // Link de acesso direto do Admin Master (ver app/admin-master/entrar +
  // app/api/admin-master/bootstrap) -- precisa ficar de fora da checagem
  // abaixo, senão vira loop: pedir o cookie de admin pra abrir a própria
  // página que concede o cookie. Temporário, pra usar enquanto não existe
  // autenticação em camadas de verdade.
  if (pathname === '/admin-master/entrar') {
    return NextResponse.next();
  }

  // Regra específica para o painel administrativo (incluindo admin-master)
  // -- SEMPRE checada, mesmo em MODO_DEV. Antes essa checagem vinha depois
  // do "if (MODO_DEV) return NextResponse.next()", ou seja, com MODO_DEV
  // ligado (como estava) NENHUMA rota admin tinha barreira nenhuma do lado
  // do servidor. O resto do app continua deliberadamente aberto pra
  // navegação sem login (catálogo, busca, diretórios etc), então MODO_DEV
  // só afeta o gate genérico abaixo, nunca o admin.
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-master')) {
    const userRole = request.cookies.get('user_role')?.value;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Se estiver em modo dev, libera o resto
  if (MODO_DEV) return NextResponse.next();

  // Libera rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
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

