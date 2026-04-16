'use client'

import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Garantir que pathname não é null antes de usar
  if (!pathname) {
    return <>{children}</>
  }
  
  // Rotas que não devem usar o layout admin padrão
  if (pathname === '/admin/login') {
    return <>{children}</>
  }
  
  // /admin/master tem layout próprio — renderiza direto sem o sidebar do admin comum
  if (pathname.startsWith('/admin/master')) {
    return <>{children}</>
  }
  
  // /admin/dashboard tem layout próprio
  if (pathname === '/admin/dashboard') {
    return <>{children}</>
  }
  
  // Layout padrão do admin com sidebar
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex">
        {/* Sidebar do Admin */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen fixed left-0 top-0">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-yellow-500">Admin</h2>
            <p className="text-xs text-zinc-500">Painel de Controle</p>
          </div>
          <nav className="p-4 space-y-2">
            <a href="/admin/dashboard" className="block p-2 hover:bg-zinc-800 rounded-lg transition">📊 Dashboard</a>
            <a href="/admin/agendamento" className="block p-2 hover:bg-zinc-800 rounded-lg transition">📅 Agendamentos</a>
            <a href="/admin/profissionais" className="block p-2 hover:bg-zinc-800 rounded-lg transition">👥 Profissionais</a>
            <a href="/admin/configuracoes" className="block p-2 hover:bg-zinc-800 rounded-lg transition">⚙️ Configurações</a>
          </nav>
        </aside>
        
        {/* Conteúdo principal */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}