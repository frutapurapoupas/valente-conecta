"use client"

import { useState } from 'react'
import { Download, Calendar, FileText } from 'lucide-react'
// TODO: importar hook real de movimentação/agenda

export default function ExtratoProfissionalPage() {
  // Filtros de período
  const [periodo, setPeriodo] = useState<'dia' | 'semana'>('dia')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))

  // TODO: buscar movimentação real
  const movimentacao = [] // mock
  const total = 0 // mock

  function gerarPDF() {
    // TODO: implementar geração de PDF
    alert('PDF gerado (mock)')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 p-4 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <FileText className="w-7 h-7 text-indigo-400" />
        <h1 className="text-2xl font-black">Extrato de Movimentação</h1>
      </header>
      <div className="flex gap-2 mb-4">
        <select value={periodo} onChange={e => setPeriodo(e.target.value as any)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white">
          <option value="dia">Por Dia</option>
          <option value="semana">Por Semana</option>
        </select>
        <input type="date" value={data} onChange={e => setData(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
        <button onClick={gerarPDF} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold">
          <Download className="w-4 h-4" /> Gerar PDF
        </button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
        <h2 className="text-lg font-bold mb-2">Movimentação</h2>
        {/* TODO: listar movimentação real */}
        <div className="text-zinc-500">Nenhum dado para o período selecionado.</div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="text-lg font-bold mb-2">Fechamento</h2>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Total de serviços</span>
          <span className="font-black text-emerald-300">R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
