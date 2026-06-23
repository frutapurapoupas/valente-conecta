// app/admin-master/financeiro-pessoal/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Plus, RefreshCw } from 'lucide-react';
import { useFinanceiroPessoal } from '@/hooks/cozinha/useFinanceiroPessoal';
import { formatarMoeda, filtrarTransacoes, calcularResumo } from '@/utils/financeiroUtils';
import GraficosFinanceiros from '@/components/financeiro-pessoal/GraficosFinanceiros';
import AlertasVencimento from '@/components/financeiro-pessoal/AlertasVencimento';
import FiltrosFinanceiro from '@/components/financeiro/FiltrosFinanceiro';

export default function FinanceiroPessoalPage() {
  const { transacoes, loading, carregar, totais, porCategoria, porMes } = useFinanceiroPessoal();
  
  // ✅ ESTADO DOS FILTROS
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // ✅ APLICAR FILTROS
  const transacoesFiltradas = filtrarTransacoes(transacoes, filtroPeriodo, filtroTipo);
  const resumo = calcularResumo(transacoesFiltradas);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Wallet className="text-green-400" />
              Financeiro Pessoal
            </h1>
            <p className="text-sm text-gray-400">Dashboard de controle financeiro pessoal</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin-master/financeiro-pessoal/transacoes"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Plus size={16} /> Ver Transações
            </Link>
            <button
              onClick={carregar}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {/* ✅ FILTROS */}
        <FiltrosFinanceiro
          filtroPeriodo={filtroPeriodo}
          filtroTipo={filtroTipo}
          totalRegistros={transacoesFiltradas.length}
          onPeriodoChange={setFiltroPeriodo}
          onTipoChange={setFiltroTipo}
        />

        {/* Cards de Resumo - COM DADOS FILTRADOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <p className="text-sm text-gray-400">Saldo Total</p>
            <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatarMoeda(resumo.saldo)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <p className="text-sm text-gray-400">Total Receitas</p>
            <p className="text-2xl font-bold text-green-400">{formatarMoeda(resumo.totalReceitas)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <p className="text-sm text-gray-400">Total Despesas</p>
            <p className="text-2xl font-bold text-red-400">{formatarMoeda(resumo.totalDespesas)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
            <p className="text-sm text-gray-400">Transações</p>
            <p className="text-2xl font-bold text-blue-400">{transacoesFiltradas.length}</p>
          </div>
        </div>

        {/* Alertas de Vencimento */}
        <div className="mb-6">
          <AlertasVencimento transacoes={transacoesFiltradas} />
        </div>

        {/* Gráficos - COM DADOS FILTRADOS */}
        <div className="mb-6">
          <GraficosFinanceiros 
            porCategoria={porCategoria} 
            porMes={porMes} 
            totais={resumo} 
          />
        </div>

        {/* Últimas Transações - COM DADOS FILTRADOS */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Últimas Transações
            </h2>
            <Link
              href="/admin-master/financeiro-pessoal/transacoes"
              className="text-sm text-green-400 hover:text-green-300 transition"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {transacoesFiltradas.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div>
                  <p className="font-medium text-sm">{t.descricao}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.data).toLocaleDateString('pt-BR')} • {t.categoria || 'Sem categoria'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} {formatarMoeda(t.valor)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.tipo === 'receita' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
              </div>
            ))}
            {transacoesFiltradas.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhuma transação encontrada para este filtro</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}