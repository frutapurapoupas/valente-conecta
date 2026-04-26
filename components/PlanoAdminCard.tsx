'use client'

import { usePlanos } from '@/hooks/usePlanos'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Calendar, Store, Dumbbell, ChevronRight, Settings, AlertCircle } from 'lucide-react'

export default function PlanoAdminCard() {
  const { user } = useAuth()
  const planosHook = usePlanos(user?.id)
  const planosAtivos = planosHook.getPlanosAtivos()

  if (!user || planosAtivos.length === 0) {
    return null
  }

  // Determinar o plano mais relevante para mostrar
  const planoServicoAgendamento = planosAtivos.find(p => p.tipoPlano.includes('servico_agendamento'))
  const planoLoja = planosAtivos.find(p => p.tipoPlano.includes('empresa') || p.tipoPlano.includes('loja'))
  const planoAcademia = planosAtivos.find(p => p.tipoPlano.includes('academia'))

  const planoDestaque = planoServicoAgendamento || planoLoja || planoAcademia

  if (!planoDestaque) {
    return null
  }

  const getPlanoInfo = (tipoPlano: string) => {
    if (tipoPlano.includes('servico_agendamento')) {
      return {
        icon: <Calendar className="w-5 h-5 text-purple-400" />,
        title: 'Serviços com Agendamento',
        description: 'Gerencie seus serviços, agendamentos e clientes',
        href: '/admin-servico',
        color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30'
      }
    }
    if (tipoPlano.includes('empresa') || tipoPlano.includes('loja')) {
      return {
        icon: <Store className="w-5 h-5 text-emerald-400" />,
        title: 'Gestão de Loja',
        description: 'Controle estoque, vendas e catálogo',
        href: '/admin-loja',
        color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30'
      }
    }
    if (tipoPlano.includes('academia')) {
      return {
        icon: <Dumbbell className="w-5 h-5 text-blue-400" />,
        title: 'Academia',
        description: 'Gerencie treinos, alunos e check-ins',
        href: '/academia/dashboard',
        color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      }
    }
    return null
  }

  const planoInfo = getPlanoInfo(planoDestaque.tipoPlano)

  if (!planoInfo) {
    return null
  }

  return (
    <Link
      href={planoInfo.href}
      className="block w-full bg-gradient-to-r ${planoInfo.color} border-2 rounded-2xl p-4 mb-4 hover:opacity-90 transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
          {planoInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-white text-base">{planoInfo.title}</h3>
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              ATIVO
            </span>
          </div>
          <p className="text-sm text-zinc-400">{planoInfo.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 flex-shrink-0" />
      </div>
    </Link>
  )
}
