import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { CadastroPopupWrapper } from '@/components/CadastroPopupWrapper';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Valente Conecta',
  description: 'Plataforma multifuncional que conecta Valente, BA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Valente Conecta',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className={inter.className}>
        <AppProvider>
          <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>
            {children}
          </Suspense>
          <Toaster position="top-right" />
          <CadastroPopupWrapper />
          <InstallPrompt />
        </AppProvider>
      </body>
    </html>
  );
}