'use client';

import { useState, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, Printer, Download } from 'lucide-react';

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  valor: number;
  data: string;
  status: string;
}

export default function RelatoriosPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());

  useEffect(() => {
    const stored = localStorage.getItem('financeiro_pessoal');
    if (stored) {
      const dados = JSON.parse(stored);
      setTransacoes(dados.transacoes || []);
    }
  }, []);

  const transacoesFiltradas = transacoes.filter(t => {
    const data = new Date(t.data);
    return data.getFullYear() === ano && data.getMonth() === mes && t.status === 'pago';
  });

  const despesasPorCategoria = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
    return acc;
  }, {} as Record<string, number>);

  const receitasPorCategoria = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
    return acc;
  }, {} as Record<string, number>);

  const totalReceitas = Object.values(receitasPorCategoria).reduce((a, b) => a + b, 0);
  const totalDespesas = Object.values(despesasPorCategoria).reduce((a, b) => a + b, 0);
  const saldo = totalReceitas - totalDespesas;

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const meses = ['Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ðŸ“Š RelatÃ³rios Financeiros</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AnÃ¡lise detalhada das suas finanÃ§as</p>
        </div>
        <button onClick={handlePrint} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ðŸ“… Ano</label>
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ðŸ“† MÃªs</label>
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-sm">Total Receitas</p>
          <p className="text-2xl font-bold">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-sm">Total Despesas</p>
          <p className="text-2xl font-bold">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className={`rounded-2xl p-4 text-white ${saldo >= 0 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-orange-600 to-red-600'}`}>
          <p className="text-white/80 text-sm">Saldo do MÃªs</p>
          <p className="text-2xl font-bold">{formatCurrency(saldo)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">ðŸ’¸ Despesas por Categoria</h2>
          </div>
          <div className="p-4">
            {Object.keys(despesasPorCategoria).length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma despesa neste perÃ­odo</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(despesasPorCategoria).map(([cat, valor]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(valor)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(valor / totalDespesas) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">ðŸ’° Receitas por Categoria</h2>
          </div>
          <div className="p-4">
            {Object.keys(receitasPorCategoria).length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma receita neste perÃ­odo</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(receitasPorCategoria).map(([cat, valor]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(valor)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(valor / totalReceitas) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ðŸ“ˆ Resumo do PerÃ­odo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">MÃ©dia Receitas</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(totalReceitas / 1)}</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">MÃ©dia Despesas</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDespesas / 1)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Economia</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(saldo)}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Margem de Economia</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

