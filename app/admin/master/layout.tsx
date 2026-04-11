import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Master — Valente Conecta',
  manifest: '/admin-manifest.json',
}

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}