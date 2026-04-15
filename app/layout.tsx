// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { PerformanceOptimizer } from '@/components/ui/PerformanceOptimizer'

export const metadata: Metadata = {
  title: 'Valente Conecta',
  description: 'Plataforma de PDV Colaborativo - Valente-BA',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" style={{ backgroundColor: '#09090b' }}>
      <head>
        {/* Pré-conexão para domínios externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.valenteconecta.com" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" as="style" href="/globals.css" />
        <link rel="preload" as="script" href="/sw.js" />
        
        {/* Meta tags para performance */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Valente Conecta" />
        
        {/* Cache hints */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body>
        <PerformanceOptimizer timeout={5000}>
          <ClientLayout>{children}</ClientLayout>
        </PerformanceOptimizer>
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('Service Worker registrado com sucesso');
                }).catch(function(err) {
                  console.log('Erro ao registrar Service Worker:', err);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}