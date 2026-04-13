// Exemplo de uso do hook para atualizar a tela automaticamente
import { useState } from 'react'
import { useRealtimeAgendamentos } from '@/hooks/useRealtimeAgendamentos'

export default function AgendaRealtimeExample() {
  const [eventos, setEventos] = useState<any[]>([])
  useRealtimeAgendamentos(payload => {
    setEventos(evts => [payload, ...evts])
    // Aqui você pode disparar um alerta, atualizar lista, etc.
    alert('Alteração detectada na agenda!')
  })
  return (
    <div>
      <h2>Eventos em tempo real</h2>
      <ul>
        {eventos.map((e, i) => (
          <li key={i}>{JSON.stringify(e)}</li>
        ))}
      </ul>
    </div>
  )
}
