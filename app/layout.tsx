import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import NotificacaoBanner from '@/components/NotificacaoBanner'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Valente Conecta - PDV Colaborativo',
  description: 'Sistema descentralizado de PDV colaborativo com criptomoeda própria',
  manifest: '/manifest.json',
  icons: {
    icon: '/icone.png',
    apple: '/icone.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Valente Conecta',
  },
  formatDetection: {
    telephone: true,
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
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icone.png" />
        <link rel="icon" type="image/png" href="/icone.png" />
        <link rel="shortcut icon" href="/icone.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Valente Conecta" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <NotificacaoBanner />
      </body>
    </html>
  )
}