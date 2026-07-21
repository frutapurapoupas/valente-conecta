"use client"; // Precisa ser client para usar usePathname

import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { CadastroPopupWrapper } from '@/components/CadastroPopupWrapper';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Suspense } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin-master');

  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900`}>
        <AppProvider>
          <Suspense fallback={<LoadingSpinner />}>
            {isAdminPage ? (
              // Layout com Sidebar para áreas administrativas
              <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 w-full bg-white">
                  {children}
                </main>
              </div>
            ) : (
              // Layout limpo para o restante do site
              <main className="min-h-screen">
                {children}
              </main>
            )}
          </Suspense>
          <Toaster position="top-right" />
          <CadastroPopupWrapper />
          <InstallPrompt />
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

