'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Target, Trophy, Calendar, Clock, AlertCircle, CheckCircle, TrendingUp, Flame, Award, Zap, Bell } from 'lucide-react'

interface Meta {
  id: string
  titulo: string
  descricao: string
  tipo: 'semanal' | 'mensal' | 'especifica'
  meta: number
  atual: number
  unidade: string
  prazo: string
  conquistada: boolean
}

interface Conquista {
  id: string
  titulo: string
  descricao: string
  data: string
  icone: string
}

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [conquistas, setConquistas] = useState<Conquista[]>([])
  const [frequenciaSemanal, setFrequenciaSemanal] = useState({
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: false
  })
  const [alertas, setAlertas] = useState<string[]>([])

  useEffect(() => {
    // Carregar metas do localStorage
    const savedMetas = localStorage.getItem('academia_metas')
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas))
    } else {
      // Metas padrão
      const metasPadrao: Meta[] = [
        {
          id: '1',
          titulo: 'Treinar 3x por semana',
          descricao: 'Manter consistência nos treinos',
          tipo: 'semanal',
          meta: 3,
          atual: 1,
          unidade: 'treinos',
          prazo: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
          conquistada: false
        },
        {
          id: '2',
          titulo: 'Perder 5kg',
          descricao: 'Meta de peso',
          tipo: 'especifica',
          meta: 5,
          atual: 1.2,
          unidade: 'kg',
          prazo: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0],
          conquistada: false
        }
      ]
      setMetas(metasPadrao)
      localStorage.setItem('academia_metas', JSON.stringify(metasPadrao))
    }

    // Carregar conquistas
    const savedConquistas = localStorage.getItem('academia_conquistas')
    if (savedConquistas) {
      setConquistas(JSON.parse(savedConquistas))
    } else {
      const conquistasPadrao: Conquista[] = [
        {
          id: '1',
          titulo: 'Primeiro Check-in!',
          descricao: 'Você realizou seu primeiro treino',
          data: new Date().toLocaleDateString('pt-BR'),
          icone: '🏆'
        }
      ]
      setConquistas(conquistasPadrao)
      localStorage.setItem('academia_conquistas', JSON.stringify(conquistasPadrao))
    }

    // Carregar frequência
    const savedFrequencia = localStorage.getItem('academia_frequencia')
    if (savedFrequencia) {
      setFrequenciaSemanal(JSON.parse(savedFrequencia))
    }

    // Gerar alertas automáticos
    gerarAlertas()
  }, [])

  const gerarAlertas = () => {
    const novosAlertas = []
    
    // Verificar metas semanais
    const metaSemanal = metas.find(m => m.tipo === 'semanal')
    if (metaSemanal && !metaSemanal.conquistada) {
      const faltam = metaSemanal.meta - metaSemanal.atual
      if (faltam > 0) {
        const diasRestantes = 7 - new Date().getDay()
        if (diasRestantes <= 3) {
          novosAlertas.push(`⚠️ Atenção! Faltam ${faltam} treino(s) para bater sua meta semanal. Você tem ${diasRestantes} dia(s)!`)
        }
      }
    }
    
    // Verificar ausências
    const treinosSemana = Object.values(frequenciaSemanal).filter(v => v === true).length
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const hoje = new Date().getDay()
    
    if (treinosSemana === 0 && hoje >= 3) {
      novosAlertas.push(`📢 Você ainda não treinou esta semana! Ainda dá tempo de começar hoje.`)
    }
    
    setAlertas(novosAlertas)
  }

  const atualizarMeta = (id: string, novoValor: number) => {
    const novasMetas = metas.map(meta => {
      if (meta.id === id) {
        const atualizado = { ...meta, atual: Math.min(meta.meta, meta.atual + novoValor) }
        if (atualizado.atual >= atualizado.meta && !atualizado.conquistada) {
          // Nova conquista!
          const novaConquista: Conquista = {
            id: Date.now().toString(),
            titulo: `🎉 Meta alcançada: ${atualizado.titulo}`,
            descricao: `Parabéns! Você alcançou sua meta de ${atualizado.titulo}!`,
            data: new Date().toLocaleDateString('pt-BR'),
            icone: '🏅'
          }
          setConquistas([novaConquista, ...conquistas])
          localStorage.setItem('academia_conquistas', JSON.stringify([novaConquista, ...conquistas]))
          alert(`🎉 Parabéns! Você alcançou a meta: ${atualizado.titulo}`)
        }
        return { ...atualizado, conquistada: atualizado.atual >= atualizado.meta }
      }
      return meta
    })
    setMetas(novasMetas)
    localStorage.setItem('academia_metas', JSON.stringify(novasMetas))
    gerarAlertas()
  }

  const registrarFrequencia = (dia: string) => {
    const novaFrequencia = { ...frequenciaSemanal, [dia]: true }
    setFrequenciaSemanal(novaFrequencia)
    localStorage.setItem('academia_frequencia', JSON.stringify(novaFrequencia))
    
    // Atualizar meta semanal
    const metaSemanal = metas.find(m => m.tipo === 'semanal')
    if (metaSemanal && !novaFrequencia[dia as keyof typeof novaFrequencia]) {
      atualizarMeta(metaSemanal.id, 1)
    }
    gerarAlertas()
  }

  const calcularProgressoGeral = () => {
    if (metas.length === 0) return 0
    const total = metas.reduce((sum, meta) => sum + (meta.atual / meta.meta), 0)
    return (total / metas.length) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/academia" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Metas e Conquistas</span>
          </div>
          <Link href="/academia/estatisticas">
            <button className="bg-white/20 px-3 py-1 rounded-full text-sm">
              📊 Estatísticas
            </button>
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="bg-yellow-50 rounded-2xl p-4 mb-6 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas para você
            </h3>
            {alertas.map((alerta, idx) => (
              <p key={idx} className="text-sm text-yellow-700 mb-1">• {alerta}</p>
            ))}
          </div>
        )}

        {/* Progresso Geral */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl mb-6">
          <p className="text-sm opacity-90 mb-1">Progresso Geral</p>
          <p className="text-3xl font-bold">{Math.round(calcularProgressoGeral())}%</p>
          <div className="w-full bg-white/30 rounded-full h-2 mt-3">
            <div 
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${calcularProgressoGeral()}%` }}
            />
          </div>
          <p className="text-xs opacity-80 mt-2">Continue assim! Você está no caminho certo</p>
        </div>

        {/* Metas Ativas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Minhas Metas
          </h2>
          <div className="space-y-4">
            {metas.map(meta => (
              <div key={meta.id} className={`p-4 rounded-xl ${meta.conquistada ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{meta.titulo}</p>
                    <p className="text-xs text-gray-500">{meta.descricao}</p>
                  </div>
                  {meta.conquistada && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso</span>
                    <span>{meta.atual}/{meta.meta} {meta.unidade}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`rounded-full h-2 transition-all ${meta.conquistada ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${(meta.atual / meta.meta) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Prazo: {meta.prazo}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Frequência Semanal */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Frequência da Semana
          </h2>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Object.entries(frequenciaSemanal).map(([dia, ativo]) => (
              <button
                key={dia}
                onClick={() => !ativo && registrarFrequencia(dia)}
                className={`p-3 rounded-xl text-center transition ${
                  ativo 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <p className="text-xs font-semibold">
                  {dia.substring(0, 3).toUpperCase()}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Toque no dia para marcar seu treino realizado
          </p>
        </div>

        {/* Recomendações Baseadas no Desempenho */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Recomendações para você
          </h2>
          <div className="space-y-2">
            {metas.filter(m => !m.conquistada && m.tipo === 'semanal').map(meta => {
              const faltam = meta.meta - meta.atual
              if (faltam > 0) {
                return (
                  <div key={meta.id} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-600">💡</span>
                    <p className="text-blue-800">
                      Faltam <strong>{faltam}</strong> treino(s) esta semana. Tente treinar {faltam === 1 ? 'amanhã' : 'nos próximos dias'}!
                    </p>
                  </div>
                )
              }
              return null
            })}
            
            {metas.filter(m => !m.conquistada && m.tipo === 'especifica').slice(0, 2).map(meta => {
              const faltam = meta.meta - meta.atual
              if (faltam > 0) {
                return (
                  <div key={meta.id} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-600">🎯</span>
                    <p className="text-blue-800">
                      Faltam <strong>{faltam}{meta.unidade}</strong> para sua meta: {meta.titulo}
                    </p>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Conquistas */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Minhas Conquistas
          </h2>
          {conquistas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma conquista ainda</p>
              <p className="text-sm">Continue treinando para desbloquear!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conquistas.map(conquista => (
                <div key={conquista.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                  <div className="text-3xl">{conquista.icone}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{conquista.titulo}</p>
                    <p className="text-xs text-gray-500">{conquista.descricao}</p>
                    <p className="text-xs text-gray-400 mt-1">{conquista.data}</p>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}