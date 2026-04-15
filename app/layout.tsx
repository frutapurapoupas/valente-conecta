// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout' // ← VERIFIQUE ESTE CAMINHO

export const metadata: Metadata = {
  title: 'Valente Conecta',
  description: 'Plataforma de PDV Colaborativo - Valente-BA',
  manifest: '/manifest.json',
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
        <link rel="apple-touch-icon" href="/icone.png" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout> {/* ← ESTÁ AQUI */}
      </body>
    </html>
  )
}