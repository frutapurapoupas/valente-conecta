import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Valente Conecta',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Valente Conecta',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  )
}