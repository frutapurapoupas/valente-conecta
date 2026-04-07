'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Megaphone, 
  Wallet, 
  Dumbbell, 
  QrCode,
  Search,
  Users,
  Settings,
  X
} from 'lucide-react'

interface SidebarProps {
  isMobile: boolean
  onClose: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingCart, label: 'PDV', href: '/pdv' },
  { icon: Megaphone, label: 'Anúncios', href: '/anuncios' },
  { icon: Wallet, label: 'Carteira', href: '/carteira' },
  { icon: Dumbbell, label: 'Academia', href: '/academia' },
  { icon: QrCode, label: 'Meu QR Code', href: '/qrcode' },
  { icon: Search, label: 'Buscar', href: '/buscar' },
  { icon: Users, label: 'Indicar Amigos', href: '/indicar' },
]

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (isMobile) onClose()
  }

  return (
    <aside className={`
      h-full bg-white dark:bg-gray-800 shadow-lg flex flex-col
      ${isMobile ? 'w-80' : 'w-64'}
    `}>
      {/* Header do Sidebar */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
          <span className="font-bold">Menu</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Configurações</span>
        </button>
      </div>
    </aside>
  )
}