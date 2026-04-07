'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Package, 
  Megaphone, 
  DollarSign, 
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', color: 'text-blue-500' },
  { icon: Users, label: 'Usuários', href: '/admin/usuarios', color: 'text-green-500' },
  { icon: Building2, label: 'Empresas', href: '/admin/empresas', color: 'text-purple-500' },
  { icon: Package, label: 'Catálogo', href: '/admin/catalogo', color: 'text-orange-500' },
  { icon: Megaphone, label: 'Ofertas', href: '/admin/ofertas', color: 'text-pink-500' },
  { icon: DollarSign, label: 'Financeiro', href: '/admin/financeiro', color: 'text-emerald-500' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes', color: 'text-gray-500' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Desktop - 4x MAIOR */}
      <aside 
        className={`hidden lg:block fixed left-0 top-0 h-full bg-white shadow-2xl z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-48' : 'w-[560px]'
        }`}
      >
        <div className={`p-12 border-b flex ${sidebarCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"></div>
              <span className="font-bold text-4xl">Admin Master</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto"></div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-5 hover:bg-gray-100 rounded-xl"
          >
            {sidebarCollapsed ? <ChevronRight className="w-12 h-12" /> : <ChevronLeft className="w-12 h-12" />}
          </button>
        </div>
        
        {!sidebarCollapsed && (
          <p className="text-2xl text-gray-500 px-12 py-6">Valente Conecta</p>
        )}
        
        <nav className="p-10 space-y-5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-8 px-8 py-6 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' 
                    : 'hover:bg-gray-100'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon className={`w-12 h-12 ${isActive ? item.color : 'text-gray-500'}`} />
                {!sidebarCollapsed && <span className="text-2xl font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        
        <div className={`absolute bottom-0 left-0 right-0 p-12 border-t ${sidebarCollapsed ? 'text-center' : ''}`}>
          <button className={`flex items-center gap-8 px-8 py-6 text-red-600 hover:bg-red-50 rounded-xl w-full ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-12 h-12" />
            {!sidebarCollapsed && <span className="text-2xl">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-[560px] bg-white shadow-2xl z-50">
            <div className="p-12 border-b flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"></div>
                <span className="font-bold text-4xl">Admin Master</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-5">
                <X className="w-12 h-12" />
              </button>
            </div>
            <nav className="p-10 space-y-5">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-8 px-8 py-6 rounded-xl transition-colors ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-12 h-12" />
                  <span className="text-2xl">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Header 4x MAIOR */}
      <header className={`bg-white shadow-md sticky top-0 z-20 transition-all duration-300 ${
        !isMobile && !sidebarCollapsed ? 'lg:ml-[560px]' : !isMobile && sidebarCollapsed ? 'lg:ml-48' : ''
      }`}>
        <div className="flex items-center justify-between px-12 py-10">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden p-5 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-12 h-12" />
            </button>
            <div className="lg:hidden flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"></div>
              <span className="font-bold text-4xl">Admin Master</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-5xl mx-12 hidden md:block">
            <div className="relative">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários, empresas, produtos..."
                className="w-full pl-28 pr-10 py-8 border-2 rounded-xl text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-5 hover:bg-gray-100 rounded-xl">
              <Bell className="w-12 h-12" />
              <span className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                AD
              </div>
              <span className="text-2xl font-medium hidden md:inline">Admin Master</span>
            </div>
          </div>
        </div>
        
        {/* Busca mobile */}
        <div className="md:hidden px-12 pb-10">
          <div className="relative">
            <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-28 pr-10 py-8 border-2 rounded-xl text-2xl"
            />
          </div>
        </div>
      </header>

      {/* Main Content 4x MAIOR */}
      <main className={`transition-all duration-300 p-12 ${
        !isMobile && !sidebarCollapsed ? 'lg:ml-[560px]' : !isMobile && sidebarCollapsed ? 'lg:ml-48' : ''
      }`}>
        <div className="max-w-[2800px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}