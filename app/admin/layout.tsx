'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Users, Dumbbell, Home } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Financeiro', path: '/admin/financeiro', icon: <Wallet size={20} /> },
    { name: 'Academia', path: '/admin/academia', icon: <Dumbbell size={20} /> },
    { name: 'Usuários', path: '/admin/usuarios', icon: <Users size={20} /> },
    { name: 'Voltar', path: '/', icon: <Home size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="no-print bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 p-4 sticky top-0 z-[300]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="text-yellow-400 font-black italic text-xl md:text-2xl tracking-tighter">
            VALENTE <span className="text-white font-light">CONECTA</span>
          </div>
          
          <div className="flex gap-1 md:gap-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-sm font-bold uppercase italic transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' 
                      : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {item.icon}
                  <span className={`${isActive ? 'block' : 'hidden lg:block'}`}>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}