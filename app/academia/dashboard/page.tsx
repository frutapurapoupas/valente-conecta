'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, Calendar, Clock, MapPin, Bell, Heart, Activity, Droplet, Flame, ChevronLeft, Edit2, User, TrendingUp, Award, Users } from 'lucide-react'
import LocalizadorAcademia from '@/components/academia/Localizador'

export default function AcademiaDashboard() {
  const [dados, setDados] = useState<any>(null)
  const [notificacoes, setNotificacoes] = useState([
    { id: 1, titulo: 'Hora de treinar!', mensagem: 'Não esqueça do treino hoje às 18h', lida: false },
    { id: 2, titulo: 'Beba água', mensagem: 'Mantenha-se hidratado durante o treino', lida: false },
    { id: 3, titulo: 'Meta da semana', mensagem: 'Você está a 2 treinos de bater sua meta!', lida: false },
  ])

  useEffect(() => {
    const saved = localStorage.getItem('academia_dados')
    if (saved) {
      setDados(JSON.parse(saved))
    }
  }, [])

  if (!dados) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Dumbbell className="w-16 h-16 text-yellow-400 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhum cadastro encontrado</h2>
        <p className="text-zinc-500 mb-6">Faça seu cadastro para começar</p>
        <Link href="/academia/cadastro" className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
          Fazer Cadastro
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/academia" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-yellow-400" />
            Meu Treino
          </h1>
          <Link href="/academia/cadastro" className="p-2 bg-zinc-800 rounded-xl">
            <Edit2 className="w-5 h-5 text-zinc-400" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Perfil */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{dados.nome || 'Usuário'}</h2>
              <p className="text-yellow-400 text-sm">
                {dados.objetivo === 'emagrecer' ? '🎯 Emagrecimento' : 
                 dados.objetivo === 'ganhar_massa' ? '💪 Ganho de Massa' : 
                 dados.objetivo === 'saude' ? '❤️ Saúde' :
                 dados.objetivo === 'resistencia' ? '⚡ Resistência' : '🧘 Mobilidade'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Meta: {dados.frequencia} dias/semana</p>
            </div>
          </div>
        </div>

        {/* Localizador com GPS e Timer */}
        <LocalizadorAcademia />

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">98</p>
            <p className="text-xs text-zinc-500">Batimentos</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">5.2</p>
            <p className="text-xs text-zinc-500">km hoje</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <Droplet className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">2.5</p>
            <p className="text-xs text-zinc-500">Litros água</p>
          </div>
        </div>

        {/* Próximo treino */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            Próximo Treino
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">Treino A - Superior</p>
              <p className="text-sm text-zinc-500">Hoje • 18:00</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-bold">Local</p>
              <p className="text-sm text-zinc-500">{dados.academia || 'Academia'}</p>
            </div>
          </div>
          <button className="w-full mt-4 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
            Iniciar Treino
          </button>
        </div>

        {/* Progresso da semana */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Progresso da Semana
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Treinos realizados</span>
                <span className="text-yellow-400">{dados.frequencia > 0 ? Math.floor(dados.frequencia * 0.7) : 2}/{dados.frequencia || 3}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${dados.frequencia > 0 ? (Math.floor(dados.frequencia * 0.7) / dados.frequencia) * 100 : 66}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            Notificações
          </h3>
          <div className="space-y-3">
            {notificacoes.map(not => (
              <div key={not.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-2 ${not.lida ? 'bg-zinc-600' : 'bg-yellow-400 animate-pulse'}`} />
                <div>
                  <p className="text-white font-bold text-sm">{not.titulo}</p>
                  <p className="text-xs text-zinc-500">{not.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas adicionais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <Users className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">1.2k</p>
            <p className="text-xs text-zinc-500">Alunos ativos</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 text-center">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">4.9</p>
            <p className="text-xs text-zinc-500">Avaliação média</p>
          </div>
        </div>
      </main>
    </div>
  )
}