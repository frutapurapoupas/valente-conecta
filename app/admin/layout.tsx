'use client'

import { useAdminLayout } from '@/hooks/useAdminLayout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, pathname, handleLogout } = useAdminLayout()

  if (!isLoggedIn && pathname !== '/admin/login') return null
  if (pathname === '/admin/login') return <>{children}</>
  // /admin/master tem layout próprio — renderiza direto sem o sidebar do admin comum
  if (pathname.startsWith('/admin/master')) return <>{children}</>

  return <>{children}</>
}