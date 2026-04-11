'use client'

import { Search, MapPin, Zap, Star, ChevronDown, Lock, Unlock, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import ProfessionalCard from '@/components/services/ProfessionalStatus'
import { useExplorarPage } from '@/hooks/useExplorarPage'
import { useDesbloquearCidade } from '@/hooks/useDesbloquearCidade'

export default function ExplorarPage() {
  const { activeFilter, setActiveFilter, categorias } = useExplorarPage()
  const {
    cidadeAtiva,
    cidades,
    modalAberto,
    cidadeSelecionada,
    saldoConectas,
    custo,
    desbloqueando,
    erro,
    abrirSeletor,
    fecharModal,
    selecionarCidade,
    confirmarDesbloqueio,
    diasRestantes,
  } = useDesbloquearCidade()

  return (
    <div className="min-h-screen bg-dark-1 pb-24">
      {/* HEADER DINÂMICO */}
      <header className="p-6 space-y-4 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Você está em</p>
            <button
              onClick={abrirSeletor}
              className="flex items-center gap-1.5 group"
            >
              <MapPin className="text-secondary w-5 h-5" />
              <h2 className="text-2xl font-black text-white uppercase">
                {cidadeAtiva.nome}
              </h2>
              <ChevronDown className="text-gray-500 w-4 h-4 group-hover:text-secondary transition-colors mt-0.5" />
            </button>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
             <Zap className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        {/* BARRA DE BUSCA "CHIQUE" */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-all" />
          <input 
            type="text" 
            placeholder="O que você precisa agora?" 
            className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl text-white outline-none focus:border-secondary/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* FILTROS DE CATEGORIA RÁPIDOS */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categorias.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveFilter(cat.toLowerCase())}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all ${
                activeFilter === cat.toLowerCase() 
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                : 'bg-white/5 text-gray-500 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* SEÇÃO: ABERTOS AGORA (O diferencial para serviços) */}
      <section className="px-6 space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
            ⚡ Disponíveis Agora
          </h3>
          <span className="text-secondary text-xs font-bold">Ver todos</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ProfessionalCard pro={{
            name: 'Borracharia do Baixinho',
            category: 'Borracharia 24h',
            is_online: true,
            daily_rate: 50.00,
            address: 'Rua Principal, Centro',
            avatar: '/borracharia.jpg'
          }} />
        </div>
      </section>

      {/* SEÇÃO: OFERTAS COM PREÇO BORRADO */}
      <section className="px-6 mt-10 space-y-6">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
          <Star className="text-primary w-5 h-5 fill-primary" /> Oportunidades
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-2 rounded-3xl border border-white/5 p-4 space-y-3">
             <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden grayscale-[0.5]">
                <img src="/casa-aluguel.jpg" className="w-full h-full object-cover opacity-50" />
             </div>
             <p className="text-white font-bold leading-tight">Aluguel Casa 3 Quartos</p>
             <div className="flex items-center justify-between">
                <span className="text-secondary font-black blur-[4px]">R$ 800</span>
                <button className="text-[10px] bg-white/10 px-2 py-1 rounded-lg text-gray-400">Ver</button>
             </div>
          </div>
        </div>
      </section>

      {/* ═══ MODAL: SELETOR DE CIDADE ═══════════════════════════════════ */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-5">

            {/* Header modal */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-lg">Escolher cidade</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Saldo: <span className="text-yellow-400 font-black">{saldoConectas} ✦</span>
                </p>
              </div>
              <button onClick={fecharModal} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Lista de cidades */}
            <div className="space-y-2">
              {cidades.map(c => {
                const dias = diasRestantes(c.validadeAte)
                const isAtiva = c.id === cidadeAtiva.id
                const isSelecionada = cidadeSelecionada?.id === c.id

                return (
                  <button
                    key={c.id}
                    onClick={() => selecionarCidade(c)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      isAtiva
                        ? 'border-yellow-400/40 bg-yellow-400/5'
                        : isSelecionada
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${isAtiva ? 'text-yellow-400' : c.desbloqueada ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      <div>
                        <p className={`font-bold text-sm ${isAtiva ? 'text-yellow-400' : 'text-white'}`}>
                          {c.nome}
                          {isAtiva && <span className="ml-2 text-[10px] font-black text-yellow-500/80 uppercase">atual</span>}
                        </p>
                        {c.desbloqueada && dias != null && !isAtiva && (
                          <p className="text-[10px] text-emerald-400/70">Desbloqueada · {dias}d restantes</p>
                        )}
                        {!c.desbloqueada && (
                          <p className="text-[10px] text-zinc-600">{custo} ✦ por 30 dias</p>
                        )}
                      </div>
                    </div>
                    {c.desbloqueada
                      ? <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      : <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    }
                  </button>
                )
              })}
            </div>

            {/* Painel de confirmação de desbloqueio */}
            {cidadeSelecionada && !cidadeSelecionada.desbloqueada && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-bold text-indigo-300">
                  Desbloquear <span className="text-white">{cidadeSelecionada.nome}</span> por 30 dias?
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Custo:</span>
                  <span className="font-black text-yellow-400 text-base">{custo} ✦</span>
                  <span className="text-zinc-600 ml-1">→ restará {saldoConectas - custo} ✦</span>
                </div>
                {erro && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {erro}
                  </div>
                )}
                <button
                  onClick={confirmarDesbloqueio}
                  disabled={desbloqueando || saldoConectas < custo}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 transition-all"
                >
                  {desbloqueando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Desbloqueando...</>
                    : <><Unlock className="w-4 h-4" /> Confirmar desbloqueio</>
                  }
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
