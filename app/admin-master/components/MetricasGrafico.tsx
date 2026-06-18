'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Componente de Tooltip customizado
const MetricasTooltip = (props: any) => {
  const { active, payload, label } = props
  if (!active || !payload) return null

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

// Dados simulados com movimento diário representado
const gerarDadosPeriodo = (tipo: string) => {
  const dados = []
  let data = new Date(2026, 4, 1) // Maio 2026

  if (tipo === 'semana') {
    for (let i = 0; i < 7; i++) {
      dados.push({
        dia: data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        usuarios: Math.floor(Math.random() * 200) + 150,
        vendas: Math.floor(Math.random() * 500) + 300,
        engajamento: Math.floor(Math.random() * 80) + 40,
      })
      data.setDate(data.getDate() + 1)
    }
  } else if (tipo === 'mes') {
    for (let i = 0; i < 30; i++) {
      dados.push({
        dia: `${i + 1}`,
        usuarios: Math.floor(Math.random() * 300) + 200,
        vendas: Math.floor(Math.random() * 800) + 500,
        engajamento: Math.floor(Math.random() * 85) + 35,
      })
    }
  } else if (tipo === 'ano') {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    for (let i = 0; i < 12; i++) {
      // Cada mês contém simulação de movimento diário agregado
      dados.push({
        dia: meses[i],
        usuarios: Math.floor(Math.random() * 5000) + 4000,
        vendas: Math.floor(Math.random() * 15000) + 10000,
        engajamento: Math.floor(Math.random() * 85) + 40,
      })
    }
  }

  return dados
}

export default function MetricasGrafico() {
  const [periodo, setPeriodo] = useState('mes')
  const [dados, setDados] = useState(gerarDadosPeriodo('mes'))

  const periodos = [
    { id: 'semana', label: 'Última Semana' },
    { id: 'mes', label: 'Este Mês' },
    { id: 'ano', label: 'Este Ano' },
  ]

  const handlePeriodoChange = (tipo: string) => {
    setPeriodo(tipo)
    setDados(gerarDadosPeriodo(tipo))
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Métricas do Sistema</h2>
          <p className="text-sm text-gray-500 mt-1">
            {periodo === 'semana' && 'Últimos 7 dias com movimento diário'}
            {periodo === 'mes' && 'Últimos 30 dias com movimento diário'}
            {periodo === 'ano' && 'Últimos 12 meses com agregação de movimento diário'}
          </p>
        </div>

        {/* Dropdown de Períodos */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">
            {periodos.find(p => p.id === periodo)?.label}
            <ChevronDown size={16} />
          </button>

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
            {periodos.map(p => (
              <button
                key={p.id}
                onClick={() => handlePeriodoChange(p.id)}
                className={`w-full text-left px-4 py-2 text-sm ${periodo === p.id
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico com Recharts */}
      <div className="w-full h-96 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dados}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dia"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'Valores', angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip content={<MetricasTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              className="mt-4"
            />
            {/* Linhas suavizadas */}
            <Line
              type="monotone"
              dataKey="usuarios"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              name="Usuários"
              tooltipType="dot"
            />
            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              name="Vendas"
              tooltipType="dot"
            />
            <Line
              type="monotone"
              dataKey="engajamento"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              name="Engajamento"
              tooltipType="dot"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Informações de Referência */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Usuários</p>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {dados[dados.length - 1]?.usuarios || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Vendas</p>
            <p className="text-lg font-bold text-green-600 mt-1">
              R$ {(dados[dados.length - 1]?.vendas || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Engajamento</p>
            <p className="text-lg font-bold text-amber-600 mt-1">
              {dados[dados.length - 1]?.engajamento || 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
