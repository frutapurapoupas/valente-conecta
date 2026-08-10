'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Calendar, 
  Download, Printer, Plus, Eye, PieChart,
  ArrowUpCircle, ArrowDownCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pendente' | 'pago' | 'cancelado';
  recorrente: boolean;
  recorrencia?: 'mensal' | 'semanal' | 'anual';
}

export default function FinanceiroPessoalDashboard() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const stored = localStorage.getItem('financeiro_pessoal');
    if (stored) {
      const dados = JSON.parse(stored);
      setTransacoes(dados.transacoes || []);
      
      const receitas = dados.transacoes?.filter((t: Transacao) => t.tipo === 'receita' && t.status === 'pago').reduce((acc: number, t: Transacao) => acc + t.valor, 0) || 0;
      const despesas = dados.transacoes?.filter((t: Transacao) => t.tipo === 'despesa' && t.status === 'pago').reduce((acc: number, t: Transacao) => acc + t.valor, 0) || 0;
      
      setTotalReceitas(receitas);
      setTotalDespesas(despesas);
      setSaldoTotal(receitas - despesas);
    } else {
      const mockTransacoes: Transacao[] = [
        { id: '1', tipo: 'receita', categoria: 'Salário', descricao: 'Salário Mensal', valor: 5000, data: new Date().toISOString().split('T')[0], status: 'pago', recorrente: true, recorrencia: 'mensal' },
        { id: '2', tipo: 'despesa', categoria: 'Alimentação', descricao: 'Supermercado', valor: 350, data: new Date().toISOString().split('T')[0], status: 'pago', recorrente: false },
        { id: '3', tipo: 'despesa', categoria: 'Contas', descricao: 'Energia Elétrica', valor: 180, data: new Date().toISOString().split('T')[0], status: 'pendente', recorrente: true, recorrencia: 'mensal' }
      ];
      setTransacoes(mockTransacoes);
      setTotalReceitas(5000);
      setTotalDespesas(530);
      setSaldoTotal(4470);
      localStorage.setItem('financeiro_pessoal', JSON.stringify({ transacoes: mockTransacoes }));
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const transacoesRecentes = [...transacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

  if (loading) return <div className="text-center py-8 text-gray-900 dark:text-gray-100">🔄 Carregando dados financeiros...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💰 Financeiro Pessoal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Controle total das suas finanças pessoais</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-sm">Saldo Total</p>
          <p className="text-3xl font-bold">{formatCurrency(saldoTotal)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-sm">Total Receitas</p>
          <p className="text-3xl font-bold">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-sm">Total Despesas</p>
          <p className="text-3xl font-bold">{formatCurrency(totalDespesas)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Contas a Pagar</p>
          <p className="text-xl font-bold text-red-600">{transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pendente').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Contas a Receber</p>
          <p className="text-xl font-bold text-green-600">{transacoes.filter(t => t.tipo === 'receita' && t.status === 'pendente').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Contas Recorrentes</p>
          <p className="text-xl font-bold text-blue-600">{transacoes.filter(t => t.recorrente).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow">
          <p className="text-gray-500 dark:text-gray-400 text-xs">Mês Atual</p>
          <p className="text-xl font-bold text-purple-600">{new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Últimas Transações</h2>
            <Link href="/admin/financeiro-pessoal/transacoes" className="text-blue-600 text-sm hover:underline">Ver todas →</Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transacoesRecentes.map((transacao) => (
              <div key={transacao.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {transacao.tipo === 'receita' ? <ArrowUpCircle className="w-8 h-8 text-green-500" /> : <ArrowDownCircle className="w-8 h-8 text-red-500" />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transacao.descricao}</p>
                    <p className="text-xs text-gray-500">{transacao.categoria} • {formatDate(transacao.data)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${transacao.status === 'pago' ? 'bg-green-100 text-green-800' : transacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {transacao.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚡ Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/financeiro-pessoal/transacoes" className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 text-center">➕ Nova Receita</Link>
              <Link href="/admin/financeiro-pessoal/transacoes" className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 text-center">➖ Nova Despesa</Link>
              <Link href="/admin/financeiro-pessoal/extrato" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 text-center">📄 Ver Extrato</Link>
              <Link href="/admin/financeiro-pessoal/relatorios" className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 text-center">📊 Relatórios</Link>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">âš ï¸ Contas a Vencer</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  Você tem {transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pendente').length} contas pendentes este mês.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            💡 Dica: Configure contas recorrentes para automatizar suas despesas mensais!
          </p>
        </div>
      </div>
    </div>
  );
}

