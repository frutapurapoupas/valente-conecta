import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { PWAInstallBanner } from '@/components/PWAInstallBanner'

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
        <meta name="theme-color" content="#6366f1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Valente Conecta" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('Service Worker error:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <PWAInstallBanner />
      </body>
    </html>
  )
}