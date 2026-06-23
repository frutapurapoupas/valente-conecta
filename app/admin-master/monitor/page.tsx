// app/admin-master/monitor/page.tsx
// 🆕 PÁGINA DO MONITOR DE QUALIDADE

"use client";
import { useEffect, useState } from 'react';
import { 
  obterMetricasMonitor, 
  listarItensParaAtencao,
  aprovarTodosPendentes,
  suspenderLojistasComDenuncia
} from '@/components/admin/automacao/services/monitorService';
import { MonitorMetrics, Lojista } from '@/components/admin/menu/types';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Flag, 
  ThumbsDown,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

export default function MonitorQualidade() {
  const [metrics, setMetrics] = useState<MonitorMetrics | null>(null);
  const [pendentes, setPendentes] = useState<Lojista[]>([]);
  const [comDenuncia, setComDenuncia] = useState<Lojista[]>([]);
  const [baixaQualidade, setBaixaQualidade] = useState<Lojista[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [metricas, itens] = await Promise.all([
        obterMetricasMonitor(),
        listarItensParaAtencao()
      ]);
      
      setMetrics(metricas);
      setPendentes(itens.pendentes);
      setComDenuncia(itens.comDenuncia);
      setBaixaQualidade(itens.baixaQualidade);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // ============================================================
  // AÇÕES EM MASSA
  // ============================================================

  const handleAprovarTodos = async () => {
    setActionLoading(true);
    try {
      const aprovados = await aprovarTodosPendentes();
      alert(`✅ ${aprovados} lojistas aprovados automaticamente!`);
      await carregarDados();
    } catch (error) {
      alert('❌ Erro ao aprovar lojistas');
    }
    setActionLoading(false);
  };

  const handleSuspenderComDenuncia = async () => {
    setActionLoading(true);
    try {
      const suspensos = await suspenderLojistasComDenuncia(3);
      alert(`⚠️ ${suspensos} lojistas suspensos por denúncias!`);
      await carregarDados();
    } catch (error) {
      alert('❌ Erro ao suspender lojistas');
    }
    setActionLoading(false);
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-500 mx-auto" />
          <p className="mt-4 text-gray-400">Carregando monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🔍 Monitor de Qualidade</h1>
          <p className="text-gray-400 mt-1">
            Supervisão por Exceção - Apenas o que precisa da sua atenção
          </p>
        </div>
        <button
          onClick={carregarDados}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Users}
          label="Total de Lojistas"
          value={metrics?.totalLojistas || 0}
          color="blue"
        />
        <MetricCard
          icon={Clock}
          label="Pendentes de Aprovação"
          value={metrics?.pendentes || 0}
          color="yellow"
        />
        <MetricCard
          icon={CheckCircle}
          label="Aprovados Automaticamente"
          value={metrics?.autoAprovados || 0}
          color="green"
        />
        <MetricCard
          icon={Flag}
          label="Com Denúncias"
          value={metrics?.comDenuncia || 0}
          color="red"
        />
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pendentes de Aprovação */}
        <SectionCard
          title="📋 Aprovações Pendentes"
          count={pendentes.length}
          icon={Clock}
          color="yellow"
          actions={
            pendentes.length > 0 && (
              <button
                onClick={handleAprovarTodos}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Check size={16} />
                Aprovar Todos
              </button>
            )
          }
        >
          {pendentes.length === 0 ? (
            <p className="text-gray-400 text-sm">✅ Nenhum pendente</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendentes.map((lojista) => (
                <LojistaCard
                  key={lojista.id}
                  lojista={lojista}
                  tipo="pendente"
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Com Denúncias */}
        <SectionCard
          title="⚠️ Denúncias/Reclamações"
          count={comDenuncia.length}
          icon={Flag}
          color="red"
          actions={
            comDenuncia.length > 0 && (
              <button
                onClick={handleSuspenderComDenuncia}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <X size={16} />
                Suspender com Denúncias
              </button>
            )
          }
        >
          {comDenuncia.length === 0 ? (
            <p className="text-gray-400 text-sm">✅ Nenhuma denúncia</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comDenuncia.map((lojista) => (
                <LojistaCard
                  key={lojista.id}
                  lojista={lojista}
                  tipo="denuncia"
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Baixa Qualidade */}
        <SectionCard
          title="📸 Baixa Qualidade de Conteúdo"
          count={baixaQualidade.length}
          icon={ThumbsDown}
          color="orange"
          className="col-span-2"
        >
          {baixaQualidade.length === 0 ? (
            <p className="text-gray-400 text-sm">✅ Todos os lojistas têm conteúdo de qualidade</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {baixaQualidade.map((lojista) => (
                <LojistaCard
                  key={lojista.id}
                  lojista={lojista}
                  tipo="qualidade"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Legenda de Status */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-bold mb-2">📌 Legenda de Status</h3>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Pendente (aguardando aprovação)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">Aprovado (ativo)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-400">Suspenso (precisa de ação)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-400">Auto-Aprovado (sistema)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  color: 'blue' | 'yellow' | 'green' | 'red' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    orange: 'bg-orange-500/20 text-orange-400'
  };

  return (
    <div className={`p-4 rounded-xl border border-gray-700 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs opacity-80">{label}</p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ 
  title, 
  count, 
  icon: Icon, 
  color,
  children,
  actions,
  className = ''
}: {
  title: string;
  count: number;
  icon: any;
  color: 'yellow' | 'red' | 'orange' | 'green' | 'blue';
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const colors = {
    yellow: 'border-yellow-500/30',
    red: 'border-red-500/30',
    orange: 'border-orange-500/30',
    green: 'border-green-500/30',
    blue: 'border-blue-500/30'
  };

  return (
    <div className={`border rounded-xl p-4 ${colors[color]} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <h2 className="font-bold">{title}</h2>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function LojistaCard({ 
  lojista, 
  tipo 
}: { 
  lojista: Lojista; 
  tipo: 'pendente' | 'denuncia' | 'qualidade';
}) {
  const cores = {
    pendente: 'bg-yellow-500/10 border-yellow-500/20',
    denuncia: 'bg-red-500/10 border-red-500/20',
    qualidade: 'bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className={`p-3 rounded-lg border ${cores[tipo]} text-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{lojista.nome}</p>
          <p className="text-xs text-gray-400">{lojista.categoria}</p>
        </div>
        <div className="text-right">
          <span className="text-xs">
            Score: {lojista.scoreConfianca}%
          </span>
          {tipo === 'denuncia' && (
            <span className="block text-xs text-red-400">
              🚨 {lojista.denuncias} denúncias
            </span>
          )}
          {tipo === 'qualidade' && (
            <span className="block text-xs text-orange-400">
              {!lojista.possuiFoto && '📸 Sem foto '}
              {!lojista.descricaoCompleta && '📝 Descrição curta'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}