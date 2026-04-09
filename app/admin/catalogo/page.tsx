'use client'

import React, { useState } from 'react'
import { Database, Filter, CheckCircle, AlertCircle, TrendingUp, Box, Calendar } from 'lucide-react'

export default function CatalogoLogisticaMaster() {
  const [filtroLoja, setFiltroLoja] = useState('Todas')
  
  // MENTALIZAÇÃO DO RELATÓRIO DIÁRIO: Vendas de Hoje + Saldo Atual
  const DATA_HOJE = "08/04/2026"

  const ITENS_PLANILHA = [
    { 
      id: 1, nome: "Feijão Preto Dona Tica 500g", preco: 3.09, status: "Sincronizado", 
      loja: "Valente Cereais", ean: "7891234567890", ncm: "0713.33.19",
      vendidoHoje: 45, estoqueSaldo: 120 
    },
    { 
      id: 2, nome: "Óleo de Soja 900ml", preco: 5.99, status: "Sincronizado", 
      loja: "Mercadinho Bom Preço", ean: "7890001112223", ncm: "1507.90.11",
      vendidoHoje: 82, estoqueSaldo: 14 
    },
    { 
      id: 3, nome: "Arroz Integral 1kg", preco: 4.80, status: "Pendente", 
      loja: "Valente Cereais", ean: "7894445556661", ncm: "1006.20.10",
      vendidoHoje: 12, estoqueSaldo: 200 
    }
  ]

  const lojas = ["Todas", "Valente Cereais", "Mercadinho Bom Preço", "São Domingos"]

  return (
    <div className="p-12 bg-black min-h-screen text-white">
      {/* HEADER COM STATUS DIÁRIO */}
      <header className="mb-16 border-b-4 border-zinc-900 pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-6 text-indigo-500 mb-4">
            <Database size={64} />
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">Inventário & Vendas</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Calendar className="text-zinc-500" size={24} />
            <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Relatório Diário: <span className="text-white">{DATA_HOJE}</span></p>
          </div>
        </div>
        
        <div className="flex gap-6 bg-zinc-900 p-6 rounded-[30px] border-2 border-zinc-800 shadow-2xl">
          <Filter className="text-indigo-500" size={40} />
          <select 
            onChange={(e) => setFiltroLoja(e.target.value)}
            className="bg-transparent text-3xl font-black uppercase outline-none cursor-pointer text-white"
          >
            {lojas.map(l => <option key={l} value={l} className="bg-black">{l}</option>)}
          </select>
        </div>
      </header>

      {/* TABELA COM DADOS DE MOVIMENTAÇÃO */}
      <div className="bg-zinc-950 rounded-[60px] border-4 border-zinc-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-900 text-zinc-500 font-black uppercase text-xl tracking-widest">
            <tr>
              <th className="p-10">Produto / Especificações</th>
              <th className="p-10 text-center">Vendas (Hoje)</th>
              <th className="p-10 text-center">Saldo Estoque</th>
              <th className="p-10 text-right">Preço</th>
              <th className="p-10 text-center">Sincronismo</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-900">
            {ITENS_PLANILHA.filter(i => filtroLoja === 'Todas' || i.loja === filtroLoja).map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/60 transition-all group">
                {/* IDENTIFICAÇÃO TÉCNICA */}
                <td className="p-10">
                  <p className="text-4xl font-black uppercase italic mb-4 group-hover:text-indigo-400">{item.nome}</p>
                  <div className="flex gap-4">
                    <span className="bg-black border border-zinc-800 px-4 py-2 rounded-lg text-zinc-500 font-mono text-xl uppercase">EAN {item.ean}</span>
                    <span className="bg-black border border-zinc-800 px-4 py-2 rounded-lg text-indigo-500 font-mono text-xl uppercase">NCM {item.ncm}</span>
                  </div>
                </td>

                {/* VENDAS HOJE - DESTAQUE EM VERDE */}
                <td className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <TrendingUp size={32} />
                      <p className="text-6xl font-black font-mono">{item.vendidoHoje}</p>
                    </div>
                    <span className="text-xs font-black uppercase text-zinc-600 italic">Unidades Saídas</span>
                  </div>
                </td>

                {/* SALDO ESTOQUE - ALERTA SE BAIXO */}
                <td className="p-10 text-center">
                  <div className={`flex flex-col items-center gap-2 ${item.estoqueSaldo < 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    <div className="flex items-center gap-3">
                      <Box size={32} />
                      <p className="text-6xl font-black font-mono">{item.estoqueSaldo}</p>
                    </div>
                    <span className="text-xs font-black uppercase text-zinc-600 italic">Disponível em Loja</span>
                  </div>
                </td>

                <td className="p-10 text-right">
                  <p className="text-6xl font-black text-white font-mono italic">R$ {item.preco.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500 font-black uppercase">{item.loja}</p>
                </td>

                <td className="p-10 text-center">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-sm ${
                    item.status === 'Sincronizado' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black animate-pulse'
                  }`}>
                    {item.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}