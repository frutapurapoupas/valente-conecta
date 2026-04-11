'use client'

import { useState } from 'react'
import { Bell, Search, User, LogOut, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
}

export default function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
  const [notifications] = useState(3) // Mock notifications count

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do sistema administrativo?')) {
      localStorage.removeItem('admin_logged')
      window.location.href = '/admin/login'
    }
  }

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 px-6 h-16 flex items-center'>
      <div className='flex items-center justify-between w-full'>
        {/* Left Section */}
        <div className='flex items-center gap-4'>
          <button
            onClick={onMenuClick}
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden'
          >
            <Menu size={20} className='text-gray-600' />
          </button>

          <div>
            <h1 className='text-xl font-bold text-gray-900'>{title}</h1>
            <p className='text-sm text-gray-500'>Painel Administrativo</p>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-4'>
          {/* Search */}
          <div className='hidden md:block relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={16} />
            <input
              type='text'
              placeholder='Buscar...'
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            />
          </div>

          {/* Notifications */}
          <button className='relative p-2 rounded-lg hover:bg-gray-100 transition-colors'>
            <Bell size={20} className='text-gray-600' />
            {notifications > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {notifications}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className='flex items-center gap-3'>
            <div className='hidden md:block text-right'>
              <p className='text-sm font-medium text-gray-900'>Admin Master</p>
              <p className='text-xs text-gray-500'>admin@valente.com</p>
            </div>

            <div className='w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center'>
              <User className='text-white' size={16} />
            </div>

            <button
              onClick={handleLogout}
              className='p-2 rounded-lg hover:bg-red-100 transition-colors group'
              title='Sair do sistema'
            >
              <LogOut size={16} className='text-gray-600 group-hover:text-red-600' />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
