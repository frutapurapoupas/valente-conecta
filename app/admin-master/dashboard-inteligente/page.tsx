"use client";

import { AlertTriangle, Award, Bell, Building, CreditCard, Download, Eye, MapPin, PieChart, Search, ShoppingBag, Target, TrendingUp, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================
// COMPONENTE MetricCard
// ============================================
function MetricCard({ titulo, valor, icone, cor, tendencia, labelTendencia }: any) {
  const cores: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600"
  };
  const isTendenciaPositiva = typeof tendencia === "number" ? tendencia >= 0 : true;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{titulo}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{valor}</p>
          {tendencia !== undefined && (
            <p className={`text-xs mt-2 ${isTendenciaPositiva ? "text-green-600" : "text-red-600"}`}>
              {isTendenciaPositiva ? "↑" : "↓"} {tendencia} {labelTendencia && `• ${labelTendencia}`}
            </p>
          )}
        </div>
        <div className={`${cores[cor]} p-3 rounded-full`}>{icone}</div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE HeatMap
// ============================================
function HeatMap({ cidades }: any) {
  if (!cidades || cidades.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-indigo-600" />
          Mapa de Calor por Cidade
        </h3>
        <p className="text-center text-gray-400 py-8">Nenhuma cidade com dados ainda</p>
      </div>
    );
  }

  const maxUsuarios = Math.max(...cidades.map((c: any) => c.usuarios), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <MapPin size={18} className="text-indigo-600" />
          Mapa de Calor por Cidade
        </h3>
        <span className="text-xs text-gray-400">Mais ativas primeiro</span>
      </div>
      <div className="space-y-3">
        {cidades.map((cidade: any) => {
          const intensidade = Math.min(100, Math.round((cidade.usuarios / maxUsuarios) * 100));
          const cor = intensidade > 70 ? "bg-red-500" : intensidade > 40 ? "bg-orange-500" : "bg-yellow-500";
          return (
            <div key={cidade.nome}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{cidade.nome}</span>
                <span className="text-gray-500 flex items-center gap-2">
                  <Users size={12} /> {cidade.usuarios}
                  <Building size={12} className="ml-1" /> {cidade.empresas}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${cor} h-2 rounded-full transition-all`} style={{ width: `${intensidade}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE ConversionFunnel
// ============================================
function ConversionFunnel() {
  const etapas = [
    { nome: "Visitantes", valor: 1250, icone: Eye, cor: "bg-blue-500" },
    { nome: "Cadastros", valor: 320, icone: UserCheck, cor: "bg-green-500" },
    { nome: "Assinaturas", valor: 89, icone: CreditCard, cor: "bg-purple-500" },
    { nome: "Indicações", valor: 45, icone: Award, cor: "bg-orange-500" }
  ];

  const maxValor = Math.max(...etapas.map(e => e.valor));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">📈 Funil de Conversão</h3>
      <div className="space-y-4">
        {etapas.map((etapa, idx) => {
          const Icon = etapa.icone;
          const percentual = (etapa.valor / maxValor) * 100;
          return (
            <div key={etapa.nome}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <div className={`${etapa.cor} p-1 rounded-full text-white`}><Icon size={12} /></div>
                  <span className="font-medium">{etapa.nome}</span>
                </div>
                <span className="font-semibold">{etapa.valor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${etapa.cor} h-2 rounded-full`} style={{ width: `${percentual}%` }}></div>
              </div>
              {idx < etapas.length - 1 && (
                <div className="text-center text-[10px] text-gray-400 mt-1">
                  ↓ taxa de conversão: {idx === 0 ? "25.6%" : idx === 1 ? "27.8%" : "50.6%"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE ChartsSection
// ============================================
function ChartsSection({ categorias }: any) {
  const total = categorias.reduce((acc: number, cat: any) => acc + cat.count, 0);
  const cores = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-indigo-600" />
          Demanda por Categoria
        </h3>
        <p className="text-center text-gray-400 py-8">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <PieChart size={18} className="text-indigo-600" />
        Demanda por Categoria
      </h3>
      <div className="space-y-3">
        {categorias.map((cat: any, index: number) => {
          const percentual = (cat.count / total) * 100;
          const cor = cores[index % cores.length];
          return (
            <div key={cat.nome}>
              <div className="flex justify-between text-sm mb-1">
                <span>{cat.nome}</span>
                <span className="text-gray-500">{percentual.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${cor} h-2 rounded-full transition-all`} style={{ width: `${percentual}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE AlertsPanel
// ============================================
function AlertsPanel() {
  const alerts = [
    { id: 1, message: "3 usuários com pagamento pendente", icon: AlertTriangle, cor: "text-yellow-600 bg-yellow-50" },
    { id: 2, message: "Nova cidade detectada: Rafael Jambeiro", icon: Bell, cor: "text-blue-600 bg-blue-50" },
    { id: 3, message: "12 novos cadastros esta semana", icon: TrendingUp, cor: "text-green-600 bg-green-50" },
    { id: 4, message: "Indicações aumentaram 23% este mês", icon: Users, cor: "text-purple-600 bg-purple-50" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bell size={18} className="text-yellow-600" />
          Alertas e Insights
        </h3>
        <span className="text-[10px] text-gray-400">Atualizado agora</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className={`${alert.cor} rounded-lg p-3 flex items-start gap-3`}>
              <Icon size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{alert.message}</p>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-4 text-center text-xs text-indigo-600 hover:text-indigo-700">
        Ver todos os alertas →
      </button>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DashboardInteligente() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30d");
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    const carregarDados = () => {
      const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
      const empresas = JSON.parse(localStorage.getItem("empresas") || "[]");
      const buscas = JSON.parse(localStorage.getItem("buscas_recentes") || "[]");
      const indicacoes = JSON.parse(localStorage.getItem("indicacoes_recebidas") || "[]");
      const pendencias = JSON.parse(localStorage.getItem("pendencias") || "[]");

      const totalUsuarios = usuarios.length + empresas.length;
      const usuariosAtivos = usuarios.filter((u: any) => u.status === "ativo").length;
      const empresasAtivas = empresas.filter((e: any) => e.status === "ativo").length;
      const totalIndicacoes = indicacoes.length;
      const taxaConversao = totalUsuarios > 0 ? ((totalIndicacoes / totalUsuarios) * 100).toFixed(1) : 0;

      const hoje = new Date();
      const ultimos30Dias = usuarios.filter((u: any) => {
        const data = new Date(u.dataCadastro);
        const diff = (hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }).length;

      const cidadesUnicas: string[] = [];
      usuarios.forEach((u: any) => {
        const cidade = u.cidade || "Valente";
        if (!cidadesUnicas.includes(cidade)) cidadesUnicas.push(cidade);
      });

      const cidadesMaisAtivas = cidadesUnicas.map((cidade: string) => ({
        nome: cidade,
        usuarios: usuarios.filter((u: any) => (u.cidade || "Valente") === cidade).length,
        empresas: empresas.filter((e: any) => (e.cidade || "Valente") === cidade).length
      })).sort((a, b) => b.usuarios - a.usuarios).slice(0, 5);

      const categoriasPopulares = [
        { nome: "Academia", count: 12 },
        { nome: "Profissionais", count: 8 },
        { nome: "Serviços", count: 15 },
        { nome: "Ambulantes", count: 5 },
        { nome: "PDV", count: empresas.length + 3 }
      ];

      setDados({
        totalUsuarios, usuariosAtivos, empresasAtivas, totalIndicacoes, taxaConversao,
        novosUltimos30Dias: ultimos30Dias, cidadesMaisAtivas, categoriasPopulares,
        totalBuscas: buscas.length, totalPendencias: pendencias.length
      });
      setLoading(false);
    };

    carregarDados();
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Inteligente</h1>
          <p className="text-sm text-gray-500">Métricas em tempo real e insights de negócio</p>
        </div>
        <div className="flex gap-2">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <button className="px-3 py-2 border rounded-lg text-sm bg-white flex items-center gap-2"><Download size={16} /> Exportar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard titulo="Usuários Totais" valor={dados.totalUsuarios} icone={<Users size={20} />} cor="blue" tendencia={dados.novosUltimos30Dias} labelTendencia="novos (30d)" />
        <MetricCard titulo="Taxa de Conversão" valor={`${dados.taxaConversao}%`} icone={<Target size={20} />} cor="green" tendencia={2.5} labelTendencia="vs mês anterior" />
        <MetricCard titulo="Empresas Ativas" valor={dados.empresasAtivas} icone={<ShoppingBag size={20} />} cor="purple" />
        <MetricCard titulo="Indicações" valor={dados.totalIndicacoes} icone={<Award size={20} />} cor="orange" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Usuários Ativos</p><p className="text-2xl font-bold text-gray-800">{dados.usuariosAtivos}</p></div>
            <div className="bg-green-100 p-2 rounded-full"><TrendingUp size={20} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Buscas Realizadas</p><p className="text-2xl font-bold text-gray-800">{dados.totalBuscas}</p></div>
            <div className="bg-blue-100 p-2 rounded-full"><Search size={20} className="text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Pendências</p><p className="text-2xl font-bold text-yellow-600">{dados.totalPendencias}</p></div>
            <div className="bg-yellow-100 p-2 rounded-full"><Bell size={20} className="text-yellow-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeatMap cidades={dados.cidadesMaisAtivas} />
        <ConversionFunnel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartsSection categorias={dados.categoriasPopulares} />
        <AlertsPanel />
      </div>
    </div>
  );
}