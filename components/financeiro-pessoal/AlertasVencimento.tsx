// components/financeiro-pessoal/AlertasVencimento.tsx
// 🎨 Alertas de vencimento de despesas

"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock, Bell, CheckCircle } from 'lucide-react';

interface DespesaVencimento {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  diasRestantes: number;
  status: 'pendente' | 'proximo' | 'hoje' | 'vencido' | 'pago';
  categoria: string;
}

interface AlertasVencimentoProps {
  transacoes: any[];
}

export default function AlertasVencimento({ transacoes }: AlertasVencimentoProps) {
  const [alertas, setAlertas] = useState<DespesaVencimento[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'hoje' | 'proximos' | 'vencidos'>('todos');

  useEffect(() => {
    // Simular despesas com vencimento
    // Na prática, viriam do banco com campo 'data_vencimento'
    const hoje = new Date();
    const despesasMock: DespesaVencimento[] = [
      { 
        id: '1', 
        descricao: 'Aluguel', 
        valor: 1200, 
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 10).toISOString(),
        diasRestantes: 2,
        status: 'proximo',
        categoria: 'Moradia'
      },
      { 
        id: '2', 
        descricao: 'Internet', 
        valor: 89.90, 
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 5).toISOString(),
        diasRestantes: -3,
        status: 'vencido',
        categoria: 'Contas'
      },
      { 
        id: '3', 
        descricao: 'Luz', 
        valor: 150, 
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 15).toISOString(),
        diasRestantes: 7,
        status: 'proximo',
        categoria: 'Contas'
      },
      { 
        id: '4', 
        descricao: 'Água', 
        valor: 80, 
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString(),
        diasRestantes: 0,
        status: 'hoje',
        categoria: 'Contas'
      },
      { 
        id: '5', 
        descricao: 'Cartão de Crédito', 
        valor: 450, 
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 20).toISOString(),
        diasRestantes: 12,
        status: 'proximo',
        categoria: 'Financeiro'
      },
    ];
    setAlertas(despesasMock);
  }, []);

  const alertasFiltrados = alertas.filter(a => {
    if (filtro === 'todos') return true;
    if (filtro === 'hoje') return a.status === 'hoje';
    if (filtro === 'proximos') return a.status === 'proximo';
    if (filtro === 'vencidos') return a.status === 'vencido';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vencido': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'hoje': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'proximo': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'pago': return 'border-green-500 bg-green-500/10 text-green-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vencido': return <AlertCircle size={16} className="text-red-400" />;
      case 'hoje': return <Clock size={16} className="text-yellow-400" />;
      case 'proximo': return <Calendar size={16} className="text-orange-400" />;
      case 'pago': return <CheckCircle size={16} className="text-green-400" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string, dias: number) => {
    switch (status) {
      case 'vencido': return `⚠️ Vencido há ${Math.abs(dias)} dias`;
      case 'hoje': return '🔴 Vence hoje!';
      case 'proximo': return `📅 Vence em ${dias} dias`;
      case 'pago': return '✅ Pago';
      default: return status;
    }
  };

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="text-yellow-400" />
            Alertas de Vencimento
          </h2>
          <p className="text-sm text-gray-400">Despesas com vencimento próximo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filtro === 'todos' ? 'bg-gray-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('hoje')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filtro === 'hoje' ? 'bg-yellow-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFiltro('proximos')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filtro === 'proximos' ? 'bg-orange-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFiltro('vencidos')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filtro === 'vencidos' ? 'bg-red-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-yellow-400">{alertas.filter(a => a.status === 'hoje').length}</p>
          <p className="text-xs text-gray-400">Vence hoje</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-orange-400">{alertas.filter(a => a.status === 'proximo').length}</p>
          <p className="text-xs text-gray-400">Próximos</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-400">{alertas.filter(a => a.status === 'vencido').length}</p>
          <p className="text-xs text-gray-400">Vencidos</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-400">{alertas.filter(a => a.status === 'pago').length}</p>
          <p className="text-xs text-gray-400">Pagos</p>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {alertasFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle size={32} className="mx-auto opacity-30 mb-2" />
            <p>Nenhum alerta para o filtro selecionado</p>
          </div>
        ) : (
          alertasFiltrados.map((alerta) => (
            <div
              key={alerta.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(alerta.status)}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(alerta.status)}
                <div>
                  <p className="font-medium text-sm">{alerta.descricao}</p>
                  <p className="text-xs opacity-75">{alerta.categoria}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">R$ {alerta.valor.toFixed(2)}</p>
                <p className={`text-xs ${alerta.status === 'vencido' ? 'text-red-400' : ''}`}>
                  {getStatusLabel(alerta.status, alerta.diasRestantes)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

