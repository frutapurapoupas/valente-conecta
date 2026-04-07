import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dispositivos autorizados (hardware IDs simulados)
const DISPOSITIVOS_AUTORIZADOS = [
  { nome: "Notebook Principal", hardwareId: "WIN10-CHROME-146" },
  { nome: "Celular Pessoal", hardwareId: "SAMSUNG-SM-A145M" },
  { nome: "Tablet Trabalho", hardwareId: "SAMSUNG-SM-X110" }
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Verificar se é rota admin
  if (pathname.startsWith("/admin")) {
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Verificar dispositivo autorizado
    const dispositivoAutorizado = DISPOSITIVOS_AUTORIZADOS.some(d => 
      userAgent.includes(d.hardwareId) || 
      userAgent.includes("Windows NT 10.0") ||
      userAgent.includes("SM-A145M") ||
      userAgent.includes("SM-X110")
    );
    
    // Verificar autenticação
    const token = req.cookies.get("admin_token")?.value;
    const session = req.cookies.get("admin_session")?.value;
    
    if (!token || !session || !dispositivoAutorizado) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    
    // Log de acesso
    console.log(`[AUDIT] Acesso admin: ${pathname} | IP: ${ip} | UA: ${userAgent.substring(0, 100)}`);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};