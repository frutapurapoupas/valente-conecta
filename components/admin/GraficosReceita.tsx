'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts'
import { useAdminGraficos, FiltroPeriodo } from '@/hooks/useAdminGraficos'
import { TrendingUp, Gift, PieChart as PieIcon, BarChart2 } from 'lucide-react'

const FILTROS: { label: string; value: FiltroPeriodo }[] = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Esta Semana', value: 'semana' },
  { label: 'Este Mês', value: 'mes' },
]

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export default function GraficosReceita() {
  const {
    dadosSemanais,
    dadosPizza,
    filtroPizza,
    setFiltroPizza,
    totalPizza,
    totalFaturamentoSemana,
    totalBonusSemana,
  } = useAdminGraficos()

  return (
    <div className="space-y-8">

      {/* === GRÁFICO DE BARRAS: Faturamento Semanal vs Bônus === */}
      <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[40px] p-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <BarChart2 size={36} className="text-indigo-400" />
            <div>
              <h3 className="text-2xl font-black uppercase italic text-white">Faturamento vs Bônus — Semana</h3>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Comparativo diário de receita e bônus de indicação</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-zinc-500 text-xs font-black uppercase">Receita Total</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">R$ {totalFaturamentoSemana.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs font-black uppercase">Bônus Concedidos</p>
              <p className="text-2xl font-black text-amber-400 font-mono">R$ {totalBonusSemana.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosSemanais} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fill: '#71717a', fontWeight: 900, fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#52525b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff' }}
              formatter={((value: number, name: string) => [formatBRL(value), name === 'faturamento' ? 'Faturamento' : 'Bônus']) as any}
              labelStyle={{ fontWeight: 900, color: '#a1a1aa' }}
            />
            <Legend
              formatter={((value: string) => value === 'faturamento' ? 'Faturamento Geral' : 'Bônus de Indicação') as any}
              wrapperStyle={{ color: '#a1a1aa', fontWeight: 700, fontSize: 13 }}
            />
            <Bar dataKey="faturamento" fill="#6366f1" radius={[8, 8, 0, 0]} name="faturamento" />
            <Bar dataKey="bonus" fill="#f59e0b" radius={[8, 8, 0, 0]} name="bonus" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* === GRÁFICO PIZZA: Faturamento por Tipo com Filtros === */}
      <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[40px] p-10">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <PieIcon size={36} className="text-emerald-400" />
            <div>
              <h3 className="text-2xl font-black uppercase italic text-white">Composição da Receita</h3>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Faturamento por categoria com filtro de período</p>
            </div>
          </div>
          {/* Filtros */}
          <div className="flex gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroPizza(f.value)}
                className={`px-5 py-2 rounded-xl font-black text-sm uppercase transition-all ${
                  filtroPizza === f.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-80 flex-shrink-0">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff' }}
                  formatter={((value: number) => [formatBRL(value), '']) as any}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda manual com percentuais */}
          <div className="flex-1 space-y-4 w-full">
            {dadosPizza.map((item) => {
              const pct = ((item.value / totalPizza) * 100).toFixed(1)
              return (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-black text-white uppercase">{item.name}</span>
                      <span className="text-sm font-mono text-zinc-400 ml-2">{formatBRL(item.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                    <p className="text-xs text-zinc-600 font-bold mt-0.5">{pct}% do total</p>
                  </div>
                </div>
              )
            })}
            <div className="border-t border-zinc-800 pt-4 flex justify-between">
              <span className="text-zinc-500 font-black uppercase text-sm">Total do Período</span>
              <span className="text-white font-black font-mono text-lg">{formatBRL(totalPizza)}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
