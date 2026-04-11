'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Award, Zap, ShieldCheck, EyeOff, TrendingDown, TrendingUp, Download, Loader2 } from 'lucide-react'
import { useAdminControle } from '@/hooks/useAdminControle'

const PLANO_COR: Record<string, string> = {
  Gold:   'text-amber-400 bg-amber-500/10 border border-amber-500/20',
  Black:  'text-zinc-100 bg-zinc-700/20 border border-zinc-600/30',
  Silver: 'text-zinc-400 bg-zinc-700/20 border border-zinc-700/30',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DetalheFinanceiro() {
  const params = useParams()
  const { taxas, faturas } = useAdminControle()
  const id = params?.id as string
  const fatura = faturas.find(f => f.id === id)

  if (!fatura) return (
    <div className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4'>
      <Loader2 className='w-6 h-6 text-zinc-600 animate-spin' />
      <p className='text-zinc-600 text-sm font-bold uppercase tracking-widest'>Fatura nao encontrada</p>
      <Link href='/admin/financeiro/controle' className='text-indigo-400 text-xs hover:underline'>voltar</Link>
    </div>
  )

  const taxaAtual = taxas[fatura.plano as keyof typeof taxas] ?? 0
  const comissao = (fatura.valor * taxaAtual) / 100
  const liquido = fatura.valor - comissao

  return (
    <div className='min-h-screen bg-zinc-950 text-white font-sans'>
      <header className='sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3'>
        <Link href='/admin/financeiro/controle' className='p-2 rounded-xl hover:bg-zinc-800 transition-all text-zinc-500 hover:text-white'>
          <ArrowLeft className='w-5 h-5' />
        </Link>
        <div>
          <h1 className='text-base font-black uppercase italic text-white leading-none'>Detalhe Financeiro</h1>
          <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest'>Repasse #{fatura.id}</p>
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${PLANO_COR[fatura.plano] ?? 'text-zinc-400 bg-zinc-700/20'}`}>Plano {fatura.plano}</span>
          {fatura.verificado
            ? <span className='text-[10px] font-black uppercase px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1'><ShieldCheck className='w-3 h-3' /> Verificado</span>
            : <span className='text-[10px] font-black uppercase px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1'><EyeOff className='w-3 h-3' /> Pendente</span>
          }
        </div>
      </header>
      <main className='max-w-2xl mx-auto p-4 space-y-4 pb-20'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center'>
          <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1'>Venda Bruta</p>
          <p className='text-5xl font-black text-white tracking-tighter'>{fmt(fatura.valor)}</p>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4'>
          <div className='w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0'>
            <Building2 className='w-6 h-6 text-indigo-400' />
          </div>
          <div>
            <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest'>Parceiro</p>
            <p className='font-black text-lg text-white'>{fatura.loja}</p>
          </div>
          <div className='ml-auto text-right'>
            <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest'>Modalidade</p>
            <p className='font-black text-sm text-white flex items-center gap-1 justify-end'><Award className='w-4 h-4 text-amber-400' /> Plano {fatura.plano}</p>
          </div>
        </div>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
          <div className='px-5 py-4 border-b border-zinc-800 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm font-bold text-zinc-300'><TrendingUp className='w-4 h-4 text-emerald-400' /> Venda Bruta</div>
            <span className='font-black text-white'>{fmt(fatura.valor)}</span>
          </div>
          <div className='px-5 py-4 border-b border-zinc-800 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm font-bold text-red-400'><TrendingDown className='w-4 h-4' /> Comissao App <span className='text-[10px] text-zinc-600'>({taxaAtual}%)</span></div>
            <span className='font-black text-red-400'>- {fmt(comissao)}</span>
          </div>
          <div className='px-5 py-5 flex items-center justify-between bg-emerald-500/5'>
            <span className='font-black text-sm text-emerald-400 uppercase'>Liquido para Lojista</span>
            <span className='font-black text-2xl text-emerald-400'>{fmt(liquido)}</span>
          </div>
        </div>
        {!fatura.verificado && (
          <div className='bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3'>
            <EyeOff className='w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5' />
            <p className='text-xs text-amber-300'>Lojista nao verificado. Informacoes de contato borradas ate validacao.</p>
          </div>
        )}
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0'>
            <Zap className='w-5 h-5 text-amber-400' />
          </div>
          <div>
            <p className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest'>Beneficio do Plano</p>
            <p className='font-bold text-sm text-zinc-300'>Taxa preferencial de <strong className='text-white'>{taxaAtual}%</strong></p>
          </div>
        </div>
        <button className='w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-black py-3.5 rounded-2xl text-sm uppercase flex items-center justify-center gap-2 transition-all'>
          <Download className='w-4 h-4' /> Gerar Relatorio de Repasse
        </button>
      </main>
    </div>
  )
}
