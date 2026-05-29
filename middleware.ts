// C:\valente_conecta\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Tipo para usuário com controle de acesso
interface UsuarioAcesso {
  id: number;
  trial_end_at: string | null;
  is_viral_active: boolean;
  viral_end_at: string | null;
  plano: string;
}

// Função para verificar acesso do usuário
async function checkUserAccess(userId: number): Promise<{ hasAccess: boolean; message?: string; daysLeft?: number }> {
  // Aqui você vai buscar os dados do Supabase
  // Por enquanto, vamos simular com um fetch para sua API
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/access?userId=${userId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      return { hasAccess: false, message: 'Erro ao verificar acesso' };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro no middleware:', error);
    return { hasAccess: false, message: 'Sistema temporariamente indisponível' };
  }
}

// Função para buscar ID do usuário pelo token
async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/from-token`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rotas públicas (não precisam de autenticação)
  const publicPaths = [
    '/',           // Home
    '/login',
    '/register',
    '/planos',
    '/convite',
    '/qr-code',
    '/api/webhooks',
    '/api/user/access',
    '/api/user/from-token',
    '/_next',
    '/favicon.ico'
  ];
  
  // Verificar se é rota pública
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Rotas admin - acesso apenas para admins
  if (pathname.startsWith('/admin')) {
    // Verificar se é admin (implementar sua lógica)
    const isAdmin = request.cookies.get('user_role')?.value === 'admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Buscar token de sessão
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                       request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (!sessionToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Buscar ID do usuário
  const userId = await getUserIdFromToken(sessionToken);
  if (!userId) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }
  
  // Verificar acesso (trial, viral, etc.)
  const access = await checkUserAccess(userId);
  
  if (!access.hasAccess) {
    const url = new URL('/acesso-expirado', request.url);
    url.searchParams.set('message', access.message || 'Seu período de acesso expirou');
    if (access.daysLeft) {
      url.searchParams.set('daysLeft', access.daysLeft.toString());
    }
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};