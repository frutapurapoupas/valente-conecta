'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function useAdminLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem('admin_logged')
    // /admin/master não requer login — e propaga sessão para o restante do admin
    if (pathname.startsWith('/admin/master')) {
      localStorage.setItem('admin_logged', 'master')
      setIsLoggedIn(true)
      return
    }
    if (!loggedIn && pathname !== '/admin/login') {
      router.push('/admin/login')
    } else {
      setIsLoggedIn(true)
    }
  }, [pathname, router])

  function handleLogout() {
    localStorage.removeItem('admin_logged')
    router.push('/admin/login')
  }

  return { isLoggedIn, pathname, handleLogout }
}
