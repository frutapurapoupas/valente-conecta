'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Bell, BellOff, Clock, Megaphone, AlertCircle, Image } from 'lucide-react'
import { useAdminCarrossel } from '@/hooks/useAdminCarrossel'

export default function AdminCarrosselPage() {
  const {
    leilao,
    anuncios,
    pendentes,
    pendentesAlert,
    modoAutoAprovacao,
    toggleAutoAprovacao,
    aprovarAnuncio,
    rejeitarAnuncio,
  } = useAdminCarrossel()

  // Tempo até encerrar leilão
  const msRestantes = new Date(leilao.encerraEm).getTime() - Date.now()
  const horasRestantes = Math.max(0, Math.floor(msRestantes / (1000 * 60 * 60)))
  const minRestantes = Math.max(0, Math.floor((msRestantes % (1000 * 60 * 60)) / (1000 * 60)))

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <Link href="/admin/master" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
              <Megaphone className="text-amber-400" size={36} /> Carrossel de Publicidade
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Aprovação de anúncios e controle de leilão</p>
          </div>

          {/* Auto-aprovação toggle */}
          <button
            onClick={toggleAutoAprovacao}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-sm transition-all ${
              modoAutoAprovacao ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {modoAutoAprovacao ? <Bell size={18} /> : <BellOff size={18} />}
            {modoAutoAprovacao ? 'Auto-Aprovação ON' : 'Aprovação Manual'}
            {!modoAutoAprovacao && pendentesAlert > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                {pendentesAlert}
              </span>
            )}
          </button>
        </div>

        {/* Status do leilão */}
        <div className="bg-zinc-900 border-2 border-amber-500/30 rounded-[30px] p-8 mb-10">
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div>
              <p className="text-zinc-500 font-black uppercase text-xs tracking-widest mb-1">Leilão Ativo — Semana</p>
              <p className="text-3xl font-black text-amber-400 italic">{leilao.semana}</p>
            </div>
            <div className="flex items-center gap-3 text-amber-400">
              <Clock size={28} />
              <div>
                <p className="text-zinc-500 text-xs font-black uppercase">Encerra em</p>
                <p className="text-2xl font-black font-mono">{horasRestantes}h {minRestantes}m</p>
              </div>
            </div>
          </div>

          {/* Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {leilao.slots.map(s => (
              <div key={s.slot} className="bg-black rounded-2xl p-6 border border-zinc-800">
                <p className="text-zinc-500 font-black uppercase text-xs tracking-widest mb-2">Slot {s.slot}</p>
                <p className="text-3xl font-black font-mono text-white">R$ {s.lanceAtual},00</p>
                <p className="text-sm text-zinc-400 mt-1">{s.vencedor || <span className="text-zinc-600">Sem lance</span>}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas pendentes (modo manual) */}
        {!modoAutoAprovacao && pendentes.length > 0 && (
          <div className="bg-red-950 border-2 border-red-500/40 rounded-[25px] p-6 mb-8 flex items-center gap-4">
            <AlertCircle className="text-red-400 flex-shrink-0" size={28} />
            <p className="text-red-300 font-bold">
              {pendentes.length} anúncio(s) aguardando aprovação manual. Aprove ou rejeite abaixo.
            </p>
          </div>
        )}

        {/* Lista de anúncios */}
        <section>
          <h2 className="text-2xl font-black uppercase italic text-zinc-300 mb-6">Anúncios Enviados</h2>
          <div className="space-y-4">
            {anuncios.map(a => (
              <div key={a.id} className={`bg-zinc-900 rounded-[25px] p-6 border-2 flex items-center gap-6 flex-wrap ${
                a.statusAprovacao === 'pendente' ? 'border-amber-500/40' :
                a.statusAprovacao === 'aprovado' ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}>
                <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  {a.imagemUrl ? <img src={a.imagemUrl} className="w-full h-full object-cover rounded-xl" /> : <Image size={24} className="text-zinc-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white">{a.empresa}</p>
                  <p className="text-sm text-zinc-400">Semana: {a.semana} · Slot {a.slotGanho} · R$ {a.valorPago},00</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                  a.statusAprovacao === 'aprovado' ? 'bg-emerald-600 text-white' :
                  a.statusAprovacao === 'rejeitado' ? 'bg-red-700 text-white' :
                  'bg-amber-500 text-black'
                }`}>
                  {a.statusAprovacao}
                </span>
                {a.statusAprovacao === 'pendente' && !modoAutoAprovacao && (
                  <div className="flex gap-3">
                    <button onClick={() => aprovarAnuncio(a.id)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-sm transition-all">
                      <CheckCircle size={16} /> Aprovar
                    </button>
                    <button onClick={() => rejeitarAnuncio(a.id)} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-black text-sm transition-all">
                      <XCircle size={16} /> Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
