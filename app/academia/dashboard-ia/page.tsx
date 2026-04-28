'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Brain, Heart, Activity, TrendingUp, Calendar, 
  Clock, Target, Zap, AlertCircle, CheckCircle, 
  ChevronRight, BarChart3, Droplet, Moon, Sun,
  Dumbbell, Timer, MapPin, Bell, Award
} from 'lucide-react'
import { useAcademiaIA } from '@/hooks/useAcademiaIA'

export default function DashboardIA() {
  const {
    perfil,
    metricasHoje,
    planoHoje,
    recomendacoes,
    scoreRecuperacao,
    loading,
    error,
    gerarPlanoTreino,
    marcarRecomendacaoVisualizada
  } = useAcademiaIA()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">Carregando sua inteligência fitness...</h2>
          <p className="text-zinc-500">Analisando seus dados</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro ao carregar dados</h2>
          <p className="text-zinc-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Complete seu perfil</h2>
          <p className="text-zinc-500 mb-4">Precisamos dos seus dados para gerar sua inteligência fitness</p>
          <Link 
            href="/academia/cadastro-inicial"
            className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            Fazer Cadastro
          </Link>
        </div>
      </div>
    )
  }

  // Componentes auxiliares
  const ScoreCard = ({ score, classificacao, recomendacao }: any) => {
    const getCorScore = (valor: number) => {
      if (valor >= 80) return 'from-green-500 to-emerald-500'
      if (valor >= 60) return 'from-blue-500 to-cyan-500'
      if (valor >= 40) return 'from-yellow-500 to-orange-500'
      return 'from-red-500 to-pink-500'
    }

    const getIconeClassificacao = () => {
      if (score >= 80) return <CheckCircle className="w-8 h-8 text-green-400" />
      if (score >= 60) return <Activity className="w-8 h-8 text-blue-400" />
      if (score >= 40) return <AlertCircle className="w-8 h-8 text-yellow-400" />
      return <AlertCircle className="w-8 h-8 text-red-400" />
    }

    return (
      <div className={`bg-gradient-to-br ${getCorScore(score)} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Recuperação</h3>
            <p className="text-sm opacity-90">{classificacao}</p>
          </div>
          {getIconeClassificacao()}
        </div>
        
        <div className="mb-4">
          <div className="text-4xl font-black mb-2">{score}%</div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm opacity-90">{recomendacao}</p>
      </div>
    )
  }

  const MetricaCard = ({ 
    icone: Icone, 
    titulo, 
    valor, 
    unidade, 
    meta, 
    cor 
  }: { 
    icone: any, 
    titulo: string, 
    valor: number, 
    unidade: string, 
    meta?: number, 
    cor: string 
  }) => {
    const percentual = meta ? Math.min(100, (valor / meta) * 100) : 100
    const getCorPercentual = () => {
      if (percentual >= 80) return 'text-green-400'
      if (percentual >= 60) return 'text-yellow-400'
      return 'text-zinc-400'
    }

    return (
      <div className="bg-zinc-900 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Icone className={`w-5 h-5 ${cor}`} />
          <span className="text-xs text-zinc-500">{titulo}</span>
        </div>
        <div className="mb-2">
          <span className={`text-2xl font-black ${getCorPercentual()}`}>
            {valor.toLocaleString('pt-BR')}
          </span>
          <span className="text-sm text-zinc-400 ml-1">{unidade}</span>
        </div>
        {meta && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Meta: {meta}</span>
              <span className={getCorPercentual()}>{Math.round(percentual)}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  percentual >= 80 ? 'bg-green-400' : 
                  percentual >= 60 ? 'bg-yellow-400' : 'bg-zinc-400'
                }`}
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const RecomendacaoCard = ({ recomendacao }: { recomendacao: any }) => {
    const getCorPrioridade = () => {
      switch (recomendacao.prioridade) {
        case 'urgente': return 'border-red-500 bg-red-500/10'
        case 'alta': return 'border-orange-500 bg-orange-500/10'
        case 'media': return 'border-yellow-500 bg-yellow-500/10'
        default: return 'border-zinc-500 bg-zinc-500/10'
      }
    }

    const getIconeTipo = () => {
      switch (recomendacao.tipo) {
        case 'treino': return <Dumbbell className="w-5 h-5" />
        case 'descanso': return <Moon className="w-5 h-5" />
        case 'hidratacao': return <Droplet className="w-5 h-5" />
        case 'nutricao': return <Heart className="w-5 h-5" />
        default: return <Bell className="w-5 h-5" />
      }
    }

    return (
      <div className={`border rounded-2xl p-4 ${getCorPrioridade()}`}>
        <div className="flex items-start gap-3">
          <div className="mt-1">{getIconeTipo()}</div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1">{recomendacao.titulo}</h4>
            <p className="text-sm text-zinc-300">{recomendacao.mensagem}</p>
          </div>
          <button
            onClick={() => marcarRecomendacaoVisualizada(recomendacao.id)}
            className="text-zinc-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/academia" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
          </Link>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-yellow-400" />
            Inteligência Fitness
          </h1>
          <Link href="/academia/cadastro-inicial" className="p-2 bg-zinc-800 rounded-xl">
            <Target className="w-5 h-5 text-zinc-400" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Score de Recuperação */}
        {scoreRecuperacao && (
          <ScoreCard 
            score={scoreRecuperacao.valor}
            classificacao={scoreRecuperacao.classificacao}
            recomendacao={scoreRecuperacao.recomendacao}
          />
        )}

        {/* Status de Hoje */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            Status de Hoje
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MetricaCard
              icone={Activity}
              titulo="Passos"
              valor={metricasHoje?.passos || 0}
              unidade=""
              meta={10000}
              cor="text-green-400"
            />
            <MetricaCard
              icone={Heart}
              titulo="Batimentos"
              valor={metricasHoje?.freq_cardiaca_media || 0}
              unidade="bpm"
              cor="text-red-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MetricaCard
              icone={Droplet}
              titulo="Água"
              valor={2.5}
              unidade="L"
              meta={3}
              cor="text-blue-400"
            />
            <MetricaCard
              icone={Moon}
              titulo="Sono"
              valor={metricasHoje?.sono_horas || 0}
              unidade="h"
              meta={8}
              cor="text-purple-400"
            />
            <MetricaCard
              icone={Zap}
              titulo="Ativo"
              valor={metricasHoje?.tempo_ativo_minutos || 0}
              unidade="min"
              meta={60}
              cor="text-yellow-400"
            />
          </div>
        </div>

        {/* Plano de Treino */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-yellow-400" />
              Plano de Treino
            </h3>
            {planoHoje ? (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                planoHoje.intensidade === 'intenso' ? 'bg-red-500 text-white' :
                planoHoje.intensidade === 'moderado' ? 'bg-yellow-500 text-black' :
                'bg-green-500 text-white'
              }`}>
                {planoHoje.intensidade.toUpperCase()}
              </span>
            ) : (
              <button
                onClick={gerarPlanoTreino}
                className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold hover:bg-yellow-400 transition"
              >
                GERAR
              </button>
            )}
          </div>

          {planoHoje ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Duração</span>
                <span className="text-white font-bold">{planoHoje.duracao_minutos} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Calorias</span>
                <span className="text-white font-bold">{planoHoje.calorias_estimadas} kcal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Foco</span>
                <span className="text-white font-bold">{planoHoje.foco_muscular?.join(', ')}</span>
              </div>
              
              <div className="pt-3 border-t border-zinc-800">
                <p className="text-sm text-zinc-300 mb-2">{planoHoje.sugestao_principal}</p>
                <p className="text-xs text-zinc-500">{planoHoje.sugestao_secundaria}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 mb-4">Nenhum plano gerado para hoje</p>
              <button
                onClick={gerarPlanoTreino}
                className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition"
              >
                Gerar Plano IA
              </button>
            </div>
          )}
        </div>

        {/* Recomendações */}
        {recomendacoes.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Recomendações
            </h3>
            
            <div className="space-y-3">
              {recomendacoes.slice(0, 3).map((recomendacao) => (
                <RecomendacaoCard key={recomendacao.id} recomendacao={recomendacao} />
              ))}
            </div>
          </div>
        )}

        {/* Progresso Semanal */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            Progresso Semanal
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">3</div>
              <p className="text-sm text-zinc-500">Treinos esta semana</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">85%</div>
              <p className="text-sm text-zinc-500">Meta batida</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
