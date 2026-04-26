'use client'

import { useAuth } from '@/hooks/useAuth'
import { usePlanos } from '@/hooks/usePlanos'
import { Store, Calendar, ChevronRight, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function GestaoCard() {
  const { user } = useAuth()
  const planosHook = usePlanos(user?.id)
  const temPlanoGestao = planosHook.temPlanoGestao()
  const planosAtivos = planosHook.getPlanosAtivos()

  if (!temPlanoGestao || !user) return null

  const interfaces = [
    {
      nome: 'Admin Loja',
      icon: <Store className="w-5 h-5" />,
      href: '/admin-loja',
      descricao: 'Gestão de lojas e estoque'
    },
    {
      nome: 'Admin Serviço',
      icon: <Calendar className="w-5 h-5" />,
      href: '/admin-servico',
      descricao: 'Gestão de agendamentos'
    },
    {
      nome: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      href: '/configuracoes',
      descricao: 'Configurar seu plano'
    },
  ]

  return (
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-white">Painel de Gestão</h3>
        </div>
        <span className="text-xs text-zinc-400">{planosAtivos.length} plano(s) ativo(s)</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {interfaces.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg p-3 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-zinc-700 p-2 rounded-lg text-yellow-500">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{item.nome}</p>
                <p className="text-xs text-zinc-400">{item.descricao}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-yellow-500 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
