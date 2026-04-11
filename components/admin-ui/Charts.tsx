'use client'

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const lineData = [
  { name: 'Jan', usuarios: 1200, pdvs: 45, transacoes: 8900 },
  { name: 'Fev', usuarios: 1800, pdvs: 67, transacoes: 12400 },
  { name: 'Mar', usuarios: 2400, pdvs: 89, transacoes: 15600 },
  { name: 'Abr', usuarios: 2900, pdvs: 112, transacoes: 18900 },
  { name: 'Mai', usuarios: 3100, pdvs: 134, transacoes: 22100 },
  { name: 'Jun', usuarios: 3800, pdvs: 156, transacoes: 25600 },
]

const barData = [
  { name: 'Coité', pdvs: 45, usuarios: 1200 },
  { name: 'Tupanatinga', pdvs: 34, usuarios: 890 },
  { name: 'Salgueiro', pdvs: 28, usuarios: 756 },
  { name: 'Santa Maria', pdvs: 22, usuarios: 634 },
  { name: 'Exu', pdvs: 18, usuarios: 523 },
  { name: 'Moreilândia', pdvs: 9, usuarios: 234 },
]

const pieData = [
  { name: 'PDV Completo', value: 68 },
  { name: 'Modo Espião', value: 22 },
  { name: 'Academia', value: 10 },
]

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B']

export default function Charts() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 h-[420px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Crescimento</p>
              <h3 className="text-xl font-semibold text-slate-950">Usuários e PDVs Ativos</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={lineData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="usuarios" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Usuários" />
              <Line type="monotone" dataKey="pdvs" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} name="PDVs" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 h-[420px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Distribuição</p>
              <h3 className="text-xl font-semibold text-slate-950">PDVs por Cidade</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barData} barCategoryGap="20%">
              <XAxis dataKey="name" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="pdvs" fill="#22C55E" radius={[12, 12, 0, 0]} barSize={18} name="PDVs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="mb-6 text-xl font-semibold text-slate-950">Tipos de PDV</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 xl:col-span-2">
          <h3 className="mb-6 text-xl font-semibold text-slate-950">Indicadores do Ecossistema</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-400">Transações Conecta</p>
              <p className="mt-4 text-3xl font-bold">R$ 45,6k</p>
              <p className="text-xs text-slate-300 mt-1">Hoje</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-400">Produtos Aprovados</p>
              <p className="mt-4 text-3xl font-bold">1.247</p>
              <p className="text-xs text-slate-300 mt-1">Este mês</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-400">Cidades Ativas</p>
              <p className="mt-4 text-3xl font-bold">8</p>
              <p className="text-xs text-slate-300 mt-1">Em operação</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-400">Taxa de Aprovação</p>
              <p className="mt-4 text-3xl font-bold">94%</p>
              <p className="text-xs text-slate-300 mt-1">Produtos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
