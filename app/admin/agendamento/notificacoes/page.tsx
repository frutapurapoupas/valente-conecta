'use client'

import { useAgendamento } from '@/hooks/useAgendamento'
import { NotificacaoAgendamento } from '@/components/agendamento/NotificacaoAgendamento'
import { useState } from 'react'

export default function NotificacoesAgendamentoPage() {
  const agendamentoData = useAgendamento()
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null)

  const handleEnviarNotificacao = async (tipo: string, mensagem: string) => {
    await agendamentoData.enviarNotificacaoAgendamento(agendamentoSelecionado?.id || '', tipo, mensagem)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notificações de Agendamento</h1>
      <p className="text-gray-600 mb-4">Selecione um agendamento para enviar notificações</p>
      
      {agendamentoSelecionado ? (
        <NotificacaoAgendamento
          agendamento={agendamentoSelecionado}
          onEnviarNotificacao={handleEnviarNotificacao}
          onFechar={() => setAgendamentoSelecionado(null)}
        />
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">Nenhum agendamento selecionado</p>
        </div>
      )}
    </div>
  )
}
