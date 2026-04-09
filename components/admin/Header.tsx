'use client'

import { useState } from 'react'
import { Bell, Search, Menu, User } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [search, setSearch] = useState('')

  return (
    <header className="sticky top-0 z-40 bg-dark-2/80 backdrop-blur-xl border-b border-primary/20">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuários, empresas, produtos..."
              className="w-96 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-white">AD</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">Admin Master</p>
              <p className="text-xs text-gray-400">Super Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}