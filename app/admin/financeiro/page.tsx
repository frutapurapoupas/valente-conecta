'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wallet, ArrowDownLeft, ArrowUpRight, Zap, History, Loader2, TrendingUp } from 'lucide-react'

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  // MENTALIZANDO O FLUXO REAL: Buscando os dados com os Planos e Taxas
  useEffect(() => {
    const carregarSistema = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // DADOS QUE VOCÊ PEDIU: Inserindo a inteligência de Planos e Faturas
      const bancoDeDadosFicticio = [
        { 
          id: "1", loja: "Valente Cereais", valor: 1250.00, 
          plano: "Premium Gold", taxa: "10%", tipo: "Entrada", status: "Concluído" 
        },
        { 
          id: "2", loja: "Mercadinho Bom Preço", valor: 450.20, 
          plano: "Basic Silver", taxa: "15%", tipo: "Entrada", status: "Processando" 
        },
        { 
          id: "3", loja: "Supermercado São Domingos", valor: 3800.00, 
          plano: "Master Black", taxa: "8%", tipo: "Repasse", status: "Agendado" 
        }
      ]
      setTransacoes(bancoDeDadosFicticio)
      setCarregando(false)
    }
    carregarSistema()
  }, [])

  if (carregando) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-6" size={90} />
          <h2 className="text-3xl font-black text-white uppercase italic animate-pulse">Sincronizando Faturas...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-12">
      
      {/* CABEÇALHO COM RESUMO REAL */}
      <header className="mb-16 flex justify-between items-end border-b-4 border-zinc-900 pb-12">
        <div>
          <div className="flex items-center gap-6 text-emerald-500 mb-4">
            <Wallet size={80} strokeWidth={2.5} />
            <h1 className="text-8xl font-black uppercase tracking-tighter italic text-white">Financeiro</h1>
          </div>
          <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Resumo de Faturamentos e Planos</p>
        </div>
        
        {/* BOTÃO QUE NÃO É MAIS ESTÁTICO: Resposta visual ao passar o mouse */}
        <button className="bg-emerald-600 hover:bg-white hover:text-black text-white font-black px-12 py-8 rounded-[30px] text-3xl transition-all transform active:scale-90 flex items-center gap-4 shadow-2xl shadow-emerald-500/20">
          <TrendingUp size={40} /> EXPORTAR HOJE
        </button>
      </header>

      {/* LISTAGEM COM AS REGRAS QUE COMBINAMOS */}
      <div className="space-y-8">
        {transacoes.map((item) => (
          <Link key={item.id} href={`/admin/financeiro/${item.id}`} className="block group">
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-[45px] p-12 flex items-center justify-between group-hover:border-indigo-500 transition-all shadow-2xl">
              
              <div className="flex items-center gap-10">
                {/* ÍCONE DE MOVIMENTAÇÃO */}
                <div className={`p-8 rounded-[30px] ${item.tipo === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {item.tipo === 'Entrada' ? <ArrowDownLeft size={60} strokeWidth={3} /> : <ArrowUpRight size={60} strokeWidth={3} />}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <h3 className="text-6xl font-black uppercase italic tracking-tighter leading-none">{item.loja}</h3>
                    {/* PLANO ATIVO (DETALHE IMPORTANTE) */}
                    <div className="flex items-center gap-2 bg-indigo-600 px-5 py-2 rounded-xl">
                      <Zap size={20} fill="white" />
                      <span className="text-lg font-black uppercase tracking-widest">{item.plano}</span>
                    </div>
                  </div>
                  <p className="text-2xl text-zinc-500 font-bold uppercase tracking-widest leading-none">
                    Taxa do Contrato: <span className="text-white">{item.taxa}</span> • Tipo: {item.tipo}
                  </p>
                </div>
              </div>

              {/* VALOR GIGANTE E STATUS COM PULSO SE FOR PENDENTE */}
              <div className="text-right space-y-4">
                <p className="text-7xl font-black text-white font-mono tracking-tighter leading-none">
                  {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className={`inline-block px-10 py-5 rounded-2xl text-2xl font-black uppercase ${
                  item.status === 'Concluído' ? 'bg-emerald-500 text-black shadow-xl' : 
                  'bg-amber-500 text-black animate-pulse shadow-xl shadow-amber-500/20'
                }`}>
                  {item.status}
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}