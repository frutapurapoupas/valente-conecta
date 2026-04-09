'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Building2, Package, Megaphone, DollarSign, Settings, LogOut, Sparkles } from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuários', href: '/admin/usuarios', icon: Users },
  { label: 'Empresas', href: '/admin/empresas', icon: Building2 },
  { label: 'Catálogo', href: '/admin/catalogo', icon: Package },
  { label: 'Ofertas', href: '/admin/ofertas', icon: Megaphone },
  { label: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('admin_logged')
    router.push('/admin/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-dark-2/95 to-dark-1/95 backdrop-blur-xl border-r border-primary/20 shadow-2xl z-50">
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center animate-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Valente Conecta</h1>
            <p className="text-xs text-gray-400">Admin Master</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </Link>
          )
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}