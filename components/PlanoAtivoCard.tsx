'use client'

import { useAuth } from '@/hooks/useAuth'
import { usePlanos } from '@/hooks/usePlanos'
import { Crown, Dumbbell, Calendar, Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function PlanoAtivoCard() {
  const { user } = useAuth()
  const planosHook = usePlanos(user?.id)
  const planosAtivos = planosHook.getPlanosAtivos()

  if (planosAtivos.length === 0) return null

  const getIcone = (tipo: string) => {
    if (tipo.includes('academia')) return <Dumbbell className="w-5 h-5" />
    if (tipo.includes('servico_agendamento')) return <Calendar className="w-5 h-5" />
    if (tipo.includes('profissional')) return <Crown className="w-5 h-5" />
    return <Crown className="w-5 h-5" />
  }

  const getCor = (tipo: string) => {
    if (tipo.includes('academia')) return 'from-emerald-500/20 to-green-500/20 border-emerald-500/30'
    if (tipo.includes('servico_agendamento')) return 'from-purple-500/20 to-violet-500/20 border-purple-500/30'
    if (tipo.includes('profissional')) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
  }

  return (
    <div className="space-y-3">
      {planosAtivos.map((plano) => {
        const config = planosHook.configuracoes.find(c => c.id === plano.tipoPlano)
        if (!config) return null

        return (
          <div
            key={plano.id}
            className={`bg-gradient-to-r ${getCor(plano.tipoPlano)} border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800 p-2 rounded-lg text-yellow-500">
                  {getIcone(plano.tipoPlano)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{config.nome}</h3>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-zinc-400">
                    Ativo desde {new Date(plano.dataInicio).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link
                href="/planos"
                className="text-zinc-400 hover:text-white transition"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
