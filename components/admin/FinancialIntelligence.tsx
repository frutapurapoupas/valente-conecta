'use client'

import { BarChart3, PieChart, Map, TrendingUp } from 'lucide-react'

export default function FinancialIntelligence() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-black text-white italic">RELATÓRIO DE <span className="text-secondary">FATURAMENTO</span></h2>
      
      {/* CARDS DE RESUMO RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-2 p-6 rounded-3xl border border-white/10">
          <p className="text-gray-500 text-xs font-bold uppercase">Receita Total (Mês)</p>
          <p className="text-3xl font-black text-white">R$ 12.450,00</p>
          <span className="text-secondary text-xs font-bold">+15% vs mês anterior</span>
        </div>
        <div className="bg-dark-2 p-6 rounded-3xl border border-white/10">
          <p className="text-gray-500 text-xs font-bold uppercase">Desbloqueios (R$ 1,00)</p>
          <p className="text-3xl font-black text-white">R$ 3.120,00</p>
          <span className="text-gray-400 text-xs">3.120 leads gerados</span>
        </div>
        <div className="bg-dark-2 p-6 rounded-3xl border border-white/10">
          <p className="text-gray-500 text-xs font-bold uppercase">Publicidade/Planos</p>
          <p className="text-3xl font-black text-white">R$ 9.330,00</p>
          <span className="text-primary text-xs font-bold">Empresas & Profissionais</span>
        </div>
      </div>

      {/* TABELA SEGMENTADA POR CIDADE E ORIGEM */}
      <div className="bg-dark-2 rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4 text-xs font-black text-gray-400 uppercase">Data</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase">Cidade</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase">Origem</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase">Valor Bruto</th>
              <th className="p-4 text-xs font-black text-gray-400 uppercase">DREX Est.</th>
            </tr>
          </thead>
          <tbody className="text-white text-sm">
            <tr className="border-t border-white/5 hover:bg-white/5">
              <td className="p-4 font-mono">08/04/2026</td>
              <td className="p-4">Valente - BA</td>
              <td className="p-4">
                <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-md text-[10px] font-bold">DESBLOQUEIO</span>
              </td>
              <td className="p-4 font-bold">R$ 142,00</td>
              <td className="p-4 text-gray-400">142,00 VC</td>
            </tr>
            <tr className="border-t border-white/5 hover:bg-white/5">
              <td className="p-4 font-mono">08/04/2026</td>
              <td className="p-4">Santaluz - BA</td>
              <td className="p-4">
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-md text-[10px] font-bold">ADS/CATÁLOGO</span>
              </td>
              <td className="p-4 font-bold">R$ 450,00</td>
              <td className="p-4 text-gray-400">450,00 VC</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}