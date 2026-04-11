'use client'

import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Briefcase
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', color: 'text-blue-500' },
  { icon: Users, label: 'Usuários', href: '/admin/usuarios', color: 'text-green-500' },
  { icon: Building2, label: 'Empresas', href: '/admin/empresas', color: 'text-purple-500' },
  { icon: Package, label: 'Catálogo', href: '/admin/catalogo', color: 'text-orange-500' },
  { icon: Megaphone, label: 'Ofertas', href: '/admin/ofertas', color: 'text-pink-500' },
  { icon: DollarSign, label: 'Financeiro', href: '/admin/financeiro', color: 'text-emerald-500' },
  { icon: Dumbbell, label: 'Academias', href: '/admin/academias', color: 'text-indigo-500' },
  { icon: Briefcase, label: 'Profissionais', href: '/admin/profissionais', color: 'text-violet-500' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes', color: 'text-gray-500' },
]

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center justify-between w-full">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-black text-lg text-gray-900">Valente</h1>
                <p className="text-xs text-gray-500">Conecta</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Dumbbell className="text-white" size={20} />
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight size={16} className="text-gray-500" />
            ) : (
              <ChevronLeft size={16} className="text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-500'} />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white">
            <p className="text-xs font-medium">Admin Master</p>
            <p className="text-xs opacity-90">Sistema de Gestão</p>
          </div>
        </div>
      )}
    </div>
  )
}