'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, MapPin, Clock, Navigation, User, Phone, Search, Car } from 'lucide-react'

interface Motorista {
  id: string
  nome: string
  foto: string
  veiculo: string
  placa: string
  valorKm: number
  avaliacao: number
  pix: string
  aprovado: boolean
}

export default function UsuarioTransportePage() {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [horario, setHorario] = useState('')
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<Motorista | null>(null)
  const [comprovanteEnviado, setComprovanteEnviado] = useState(false)
  const [userData] = useState({
    nome: 'João Silva',
    telefone: '(75) 9 8888-7777',
    endereco: 'Rua Principal, 123 - Centro, Valente-BA'
  })

  useEffect(() => {
    // Carregar motoristas aprovados do localStorage
    const motoristasSalvos = localStorage.getItem('motoristas_transportes')
    if (motoristasSalvos) {
      const todos = JSON.parse(motoristasSalvos)
      setMotoristas(todos.filter((m: Motorista) => m.aprovado))
    }
  }, [])

  const buscarMotoristas = () => {
    if (!origem || !destino || !horario) {
      alert('Preencha todos os campos')
      return
    }
    // Motoristas já carregados no useEffect
  }

  const selecionarMotorista = (motorista: Motorista) => {
    setMotoristaSelecionado(motorista)
  }

  const enviarComprovante = () => {
    setComprovanteEnviado(true)
    alert('Comprovante enviado para o motorista. Aguarde confirmação.')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/transportes-delivery" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Solicitar Corrida</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Dados do usuário */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Seus Dados
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-400"><span className="text-white font-medium">Nome:</span> {userData.nome}</p>
            <p className="text-zinc-400"><span className="text-white font-medium">Telefone:</span> {userData.telefone}</p>
            <p className="text-zinc-400"><span className="text-white font-medium">Endereço:</span> {userData.endereco}</p>
          </div>
        </div>

        {/* Formulário de solicitação */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white">Detalhes da Corrida</h3>
          
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Origem</label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                value={origem}
                onChange={e => setOrigem(e.target.value)}
                placeholder="Endereço de origem"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Destino</label>
            <div className="relative mt-1">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                value={destino}
                onChange={e => setDestino(e.target.value)}
                placeholder="Endereço de destino"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Horário da apanha</label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="time"
                value={horario}
                onChange={e => setHorario(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={buscarMotoristas}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-white hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar Motoristas
          </button>
        </div>

        {/* Lista de motoristas */}
        {motoristas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-white">Motoristas Disponíveis</h3>
            {motoristas.map((motorista) => (
              <div
                key={motorista.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer"
                onClick={() => selecionarMotorista(motorista)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-zinc-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{motorista.nome}</h4>
                    <p className="text-sm text-zinc-400">{motorista.veiculo} • {motorista.placa}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-400 font-bold">R$ {motorista.valorKm}/km</span>
                      <span className="text-yellow-400 text-sm">★ {motorista.avaliacao}</span>
                    </div>
                  </div>
                  <Car className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Motorista selecionado */}
        {motoristaSelecionado && (
          <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white">Motorista Selecionado</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-zinc-500" />
              </div>
              <div>
                <h4 className="font-bold text-white">{motoristaSelecionado.nome}</h4>
                <p className="text-sm text-zinc-400">{motoristaSelecionado.veiculo} • {motoristaSelecionado.placa}</p>
                <p className="text-emerald-400 font-bold mt-1">PIX: {motoristaSelecionado.pix}</p>
              </div>
            </div>
            
            {!comprovanteEnviado ? (
              <button
                onClick={enviarComprovante}
                className="w-full py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all"
              >
                Enviar Comprovante de Pagamento
              </button>
            ) : (
              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-4 text-center">
                <p className="text-emerald-400 font-bold">Comprovante enviado!</p>
                <p className="text-sm text-zinc-400 mt-1">Aguardando confirmação do motorista</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
