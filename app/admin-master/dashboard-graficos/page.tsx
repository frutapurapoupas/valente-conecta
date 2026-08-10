"use client";

import {
  Award,
  BarChart3,
  Download,
  LineChart,
  PieChart
} from "lucide-react";
import { useEffect, useState } from "react";

// Componente de Gráfico de Barras (simulado)
function BarChart({ data, title }: { data: any[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.valor), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-indigo-600" />
        {title}
      </h3>
      <div className="flex items-end justify-around h-64 gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
              style={{ height: `${(item.valor / maxValue) * 200}px` }}
            ></div>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Gráfico de Pizza (simulado)
function PieChartComponent({ data, title }: { data: any[]; title: string }) {
  const cores = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const total = data.reduce((acc, d) => acc + d.valor, 0);

  let acumulado = 0;
  const segments = data.map((item, idx) => {
    const percentual = (item.valor / total) * 100;
    const start = acumulado;
    acumulado += percentual;
    const end = acumulado;
    return { ...item, percentual, start, end, cor: cores[idx % cores.length] };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <PieChart size={18} className="text-pink-600" />
        {title}
      </h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Gráfico de Pizza Simulado */}
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((segment, idx) => {
              const startAngle = (segment.start / 100) * 360;
              const endAngle = (segment.end / 100) * 360;
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;

              return (
                <path
                  key={idx}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segment.cor}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-800">{total}</span>
          </div>
        </div>
        {/* Legenda */}
        <div className="flex-1 space-y-2">
          {segments.map((segment, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.cor }}></div>
                <span className="text-sm text-gray-700">{segment.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{segment.percentual.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de Gráfico de Linha (simulado)
function LineChartComponent({ data, title }: { data: any[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.valor), 1);
  const points = data.map((d, idx) => `${(idx / (data.length - 1)) * 100},${100 - (d.valor / maxValue) * 80}`).join(" ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <LineChart size={18} className="text-green-600" />
        {title}
      </h3>
      <svg viewBox="0 0 100 50" className="w-full h-32">
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          className="animate-draw"
        />
        {data.map((d, idx) => (
          <circle key={idx} cx={(idx / (data.length - 1)) * 100} cy={100 - (d.valor / maxValue) * 80} r="2" fill="#10b981" />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, idx) => (
          <span key={idx} className="text-[10px] text-gray-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardGraficos() {
  const [periodo, setPeriodo] = useState("30d");
  const [loading, setLoading] = useState(true);

  // Dados simulados para os gráficos
  const dadosBarras = [
    { label: "Jan", valor: 120 },
    { label: "Fev", valor: 150 },
    { label: "Mar", valor: 180 },
    { label: "Abr", valor: 210 },
    { label: "Mai", valor: 250 },
    { label: "Jun", valor: 300 }
  ];

  const dadosPizza = [
    { label: "Usuários Comuns", valor: 450, cor: "#6366f1" },
    { label: "Empresas", valor: 120, cor: "#10b981" },
    { label: "Profissionais", valor: 80, cor: "#f59e0b" },
    { label: "Ambulantes", valor: 45, cor: "#ef4444" }
  ];

  const dadosLinha = [
    { label: "Sem 1", valor: 45 },
    { label: "Sem 2", valor: 52 },
    { label: "Sem 3", valor: 48 },
    { label: "Sem 4", valor: 67 },
    { label: "Sem 5", valor: 73 },
    { label: "Sem 6", valor: 89 }
  ];

  const dadosTopCidades = [
    { nome: "Valente", usuarios: 320, crescimento: 15 },
    { nome: "Rafael Jambeiro", usuarios: 180, crescimento: 22 },
    { nome: "Santa Bárbara", usuarios: 95, crescimento: 8 },
    { nome: "Santaluz", usuarios: 120, crescimento: 12 }
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard de Gráficos</h1>
          <p className="text-sm text-gray-500">Visualização avançada de métricas e indicadores</p>
        </div>
        <div className="flex gap-2">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700">
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
          </select>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Usuários Totais</p>
          <p className="text-3xl font-bold">1,280</p>
          <p className="text-xs opacity-80 mt-1">? 12% este mês</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Receita Mensal</p>
          <p className="text-3xl font-bold">R$ 47,9K</p>
          <p className="text-xs opacity-80 mt-1">? 8% este mês</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Taxa Conversão</p>
          <p className="text-3xl font-bold">24.8%</p>
          <p className="text-xs opacity-80 mt-1">? 3.2%</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Indicações</p>
          <p className="text-3xl font-bold">342</p>
          <p className="text-xs opacity-80 mt-1">? 18%</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Novos Hoje</p>
          <p className="text-3xl font-bold">18</p>
          <p className="text-xs opacity-80 mt-1">? 4 ontem</p>
        </div>
      </div>

      {/* Gráfico de Barras e Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={dadosBarras} title="Evolução de Usuários" />
        <PieChartComponent data={dadosPizza} title="Distribuição por Tipo" />
      </div>

      {/* Gráfico de Linha e Ranking de Cidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent data={dadosLinha} title="Novos Cadastros por Semana" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            Top Cidades
          </h3>
          <div className="space-y-4">
            {dadosTopCidades.map((cidade, idx) => (
              <div key={cidade.nome}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400">#{idx + 1}</span>
                    <span className="font-medium text-gray-700">{cidade.nome}</span>
                  </div>
                  <span className="text-green-600 text-sm">+{cidade.crescimento}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(cidade.usuarios / 320) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-12">{cidade.usuarios}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de KPIs adicionais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-2xl font-bold text-gray-800">1,280</p>
          <p className="text-xs text-gray-500">Usuários Ativos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">🏪</div>
          <p className="text-2xl font-bold text-gray-800">156</p>
          <p className="text-xs text-gray-500">Lojas Parceiras</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">⭐</div>
          <p className="text-2xl font-bold text-gray-800">4.8</p>
          <p className="text-xs text-gray-500">Avaliação Média</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">😊</div>
          <p className="text-2xl font-bold text-gray-800">89%</p>
          <p className="text-xs text-gray-500">Satisfação</p>
        </div>
      </div>

      {/* Footer com atualização */}
      <div className="text-center text-xs text-gray-400 pt-4">
        Dashboard atualizado em tempo real • Última atualização: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

