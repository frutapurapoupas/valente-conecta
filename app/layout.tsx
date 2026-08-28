"use client"; // Precisa ser client para usar usePathname

import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { CadastroPopupWrapper } from '@/components/CadastroPopupWrapper';
import { BoasVindasVideoPopup } from '@/components/BoasVindasVideoPopup';
import { QuizPerfilPopup } from '@/components/QuizPerfilPopup';
import { InteressesPopup } from '@/components/InteressesPopup';
import { InstallPrompt } from '@/components/InstallPrompt';
import PushSubscriptionManager from '@/components/PushSubscriptionManager';
import { Suspense } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

// Rotas que ja tem a propria navegacao/contexto (ferramenta de trabalho,
// fluxo de autenticacao isolado, etc.) -- nao recebem a barra inferior do
// app do consumidor. Ver diagnostico de UX (achado "nao existe navegacao
// persistente fora da home"): a barra passou a existir em todo lugar, exceto
// aqui.
const PREFIXOS_SEM_NAV = [
  '/admin-master', '/admin', '/pdv', '/cdl', '/login', '/register',
  '/academia', '/cozinha', '/autenticacao-completa', '/convite', '/qr-code',
  '/acesso-expirado', '/servico-indisponivel', '/diagnostico', '/teste-geo',
];
const SEGMENTOS_SEM_NAV = ['/motorista', '/entregador', '/fornecedor', '/admin', '/publicar'];

function deveMostrarNav(pathname: string | null): boolean {
  if (!pathname) return false;
  if (PREFIXOS_SEM_NAV.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;
  if (SEGMENTOS_SEM_NAV.some((s) => pathname.includes(s))) return false;
  return true;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin-master');
  const mostrarNav = !isAdminPage && deveMostrarNav(pathname);

  return (
    <html lang="pt-BR" className="h-full">
      <head>
        {isAdminPage ? (
          <>
            <link rel="manifest" href="/manifest-admin.json" />
            <link rel="apple-touch-icon" href="/icons/icon-admin-180x180.png" />
            <meta name="theme-color" content="#DC2626" />
            <meta name="apple-mobile-web-app-title" content="VC Admin" />
          </>
        ) : (
          <>
            <link rel="manifest" href="/manifest.json" />
            <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            <meta name="theme-color" content="#22c55e" />
            <meta name="apple-mobile-web-app-title" content="Valente" />
          </>
        )}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900`}>
        <AppProvider>
          <Suspense fallback={<LoadingSpinner />}>
            {isAdminPage ? (
              // Layout com Sidebar para áreas administrativas
              <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 min-w-0 w-full bg-white overflow-x-hidden">
                  {children}
                </main>
              </div>
            ) : (
              // Layout limpo para o restante do site
              <main className="min-h-screen" style={mostrarNav ? { paddingBottom: '72px' } : undefined}>
                {children}
              </main>
            )}
          </Suspense>
          {mostrarNav && <BottomNav />}
          <Toaster position="top-right" />
          <CadastroPopupWrapper />
          <QuizPerfilPopup />
          <BoasVindasVideoPopup />
          <InteressesPopup />
          <InstallPrompt />
          <PushSubscriptionManager />
        </AppProvider>
      </body>
    </html>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}

