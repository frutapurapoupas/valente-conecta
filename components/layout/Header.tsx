'use client'

import { Menu, Bell, User, Wallet } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
            <span className="font-bold text-lg hidden sm:inline">Valente Conecta</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Saldo */}
          <div className="bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-sm">R$ 150,00</span>
          </div>

          {/* Notificações */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Bell className="w-5 h-5" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-50">
                <div className="p-3 border-b">
                  <h3 className="font-semibold">Notificações</h3>
                </div>
                <div className="p-4 text-center text-gray-500">
                  Nenhuma notificação no momento
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}