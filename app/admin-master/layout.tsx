import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VC Admin Master',
  description: 'Painel Admin Master — Valente Conecta',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    title: 'VC Admin',
    statusBarStyle: 'black-translucent',
  },
}

export default function AdminMasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="apple-touch-icon" href="/icon-192.png" />
      {children}
    </>
  )
}
