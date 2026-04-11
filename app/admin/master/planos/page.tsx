'use client'

import Link from 'next/link'
import { ArrowLeft, Check, Edit3, Save, X, CheckCircle, Building2, User, Dumbbell, Crown, Search } from 'lucide-react'
import { useAdminPrecos, PlanoItem } from '@/hooks/useAdminPrecos'

function CardPlano({
  plano,
  editandoId,
  novoPreco,
  setNovoPreco,
  iniciarEdicao,
  cancelarEdicao,
  salvarPreco,
}: {
  plano: PlanoItem
  editandoId: string | null
  novoPreco: string
  setNovoPreco: (v: string) => void
  iniciarEdicao: (id: string, preco: number) => void
  cancelarEdicao: () => void
  salvarPreco: (id: string) => void
}) {
  const editando = editandoId === plano.id

  return (
    <div className={`bg-zinc-900 rounded-[30px] p-8 border-2 flex flex-col gap-5 ${plano.destaque ? 'border-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-zinc-800'}`}>
      <div className="flex justify-between items-start">
        <div>
          {plano.destaque && (
            <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2">
              <Crown size={10} /> Mais Popular
            </span>
          )}
          <h3 className="text-2xl font-black uppercase italic text-white">{plano.nome}</h3>
          {plano.boasVindas && (
            <span className="text-xs text-emerald-400 font-bold">🎁 {plano.boasVindas}</span>
          )}
        </div>
        <button
          onClick={() => iniciarEdicao(plano.id, plano.preco)}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-indigo-600 text-zinc-400 hover:text-white transition-all"
        >
          <Edit3 size={16} />
        </button>
      </div>

      {/* Preço editável */}
      {editando ? (
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-black text-xl">R$</span>
          <input
            type="number"
            value={novoPreco}
            onChange={(e) => setNovoPreco(e.target.value)}
            className="bg-black border-2 border-indigo-500 rounded-xl px-4 py-2 text-white font-black text-2xl w-32 outline-none font-mono"
            step="0.01"
            min="0"
            autoFocus
          />
          <span className="text-zinc-500 font-bold text-sm">/mês</span>
          <button onClick={() => salvarPreco(plano.id)} className="p-2 bg-emerald-600 rounded-xl hover:bg-emerald-500 text-white">
            <Save size={16} />
          </button>
          <button onClick={cancelarEdicao} className="p-2 bg-zinc-700 rounded-xl hover:bg-zinc-600 text-white">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-2">
          {plano.preco === 0 ? (
            <span className="text-4xl font-black text-emerald-400 italic">Grátis</span>
          ) : (
            <>
              <span className="text-zinc-500 font-bold">R$</span>
              <span className="text-4xl font-black text-white font-mono">{plano.preco.toFixed(2).replace('.', ',')}</span>
              <span className="text-zinc-500 text-sm font-bold">/mês</span>
            </>
          )}
        </div>
      )}

      {/* Funcionalidades */}
      <ul className="space-y-2 flex-1">
        {plano.descricao.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AdminPrecosPage() {
  const {
    empresas, profissionais, academia, busca,
    editandoId, novoPreco, setNovoPreco,
    iniciarEdicao, cancelarEdicao, salvarPreco, salvo,
  } = useAdminPrecos()

  const cardProps = { editandoId, novoPreco, setNovoPreco, iniciarEdicao, cancelarEdicao, salvarPreco }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/admin/master" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">Grade de Planos</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-1">Editar preços e funcionalidades — Valente Conecta</p>
          </div>
          {salvo && (
            <div className="ml-auto flex items-center gap-2 bg-emerald-600 text-black px-5 py-2 rounded-full font-black text-sm">
              <CheckCircle size={16} /> Salvo!
            </div>
          )}
        </div>

        {/* EMPRESAS */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={28} className="text-indigo-400" />
            <h2 className="text-3xl font-black uppercase italic text-indigo-400">Planos para Empresas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {empresas.map(p => <CardPlano key={p.id} plano={p} {...cardProps} />)}
          </div>
        </section>

        {/* PROFISSIONAIS */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <User size={28} className="text-blue-400" />
            <h2 className="text-3xl font-black uppercase italic text-blue-400">Planos para Profissionais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profissionais.map(p => <CardPlano key={p.id} plano={p} {...cardProps} />)}
          </div>
        </section>

        {/* ACADEMIA */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell size={28} className="text-pink-400" />
            <h2 className="text-3xl font-black uppercase italic text-pink-400">Plano Academia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {academia.map(p => <CardPlano key={p.id} plano={p} {...cardProps} />)}
          </div>
        </section>

        {/* PESQUISA INTELIGENTE */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Search size={28} className="text-sky-400" />
            <h2 className="text-3xl font-black uppercase italic text-sky-400">Pesquisa Inteligente — Usuário Geral</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {busca.map(p => <CardPlano key={p.id} plano={p} {...cardProps} />)}
          </div>
        </section>

        {/* Nota sobre inteligência comercial Premium */}
        <div className="bg-zinc-900 border-2 border-indigo-500/30 rounded-[30px] p-8">
          <h3 className="text-xl font-black uppercase text-indigo-400 mb-3">Inteligência Comercial — Plano Premium Empresa</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            O Admin Master controla quais informações estratégicas (tendências de busca, horários de pico, produtos mais procurados, comparativos de mercado) 
            ficam visíveis para as empresas no plano Premium. Use a tela <strong className="text-white">Configurações → Inteligência Comercial</strong> para 
            ligar ou desligar cada item individualmente.
          </p>
        </div>

      </div>
    </div>
  )
}
