import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Mantenha aqui o mesmo código que estava no seu middleware
  // Exemplo básico:
  const response = NextResponse.next()
  
  // Adicione seus headers, cookies ou lógica de roteamento aqui
  // Se você não tinha código personalizado, apenas isso já é suficiente
  
  return response
}

// Configure o matcher se necessário (opcional)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}