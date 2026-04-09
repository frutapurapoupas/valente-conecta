'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Financeiro', path: '/admin/financeiro', icon: '💰' },
    { name: 'Usuários', path: '/admin/usuarios', icon: '👥' },
    { name: 'Voltar', path: '/', icon: '🏠' },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* MENU RESPONSIVO: Barra fixa no topo para Mobile / Lateral ou Estilizada para Desktop */}
      <nav className="no-print bg-zinc-900/50 backdrop-blur-md border-b-2 border-zinc-800 p-4 sticky top-0 z-[300]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="text-yellow-400 font-black italic text-2xl tracking-tighter">
            VALENTE <span className="text-white">CONECTA</span>
          </div>
          
          <div className="flex gap-2 md:gap-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-xl font-black uppercase italic transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]' 
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className={`${isActive ? 'block' : 'hidden md:block'}`}>{item.name}</span>
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