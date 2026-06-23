// app/extrato/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Wallet, CreditCard, History, TrendingUp, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletService } from '@/services/walletService';

interface Transacao {
  id: string;
  tipo: 'credito' | 'debito';
  valor: number;
  descricao: string;
  servico: string;
  saldo_antes: number;
  saldo_depois: number;
  created_at: string;
  status: string;
}

interface CambioConfig {
  taxa: number;
  cidade: string;
}

export default function ExtratoPage() {
  const router = useRouter();
  const { user } = useApp();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [cambio, setCambio] = useState<CambioConfig>({ taxa: 1, cidade: 'Valente' });
  const [usandoMoedaConecta, setUsandoMoedaConecta] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    carregarCambio();
    carregarTransacoes();
  }, [user]);

  const carregarCambio = async () => {
    try {
      const cidadeBase = localStorage.getItem('usuario_cidade_base') || 'Valente';
      const response = await fetch(`/api/cambio?cidade=${encodeURIComponent(cidadeBase)}`);
      if (response.ok) {
        const data = await response.json();
        setCambio({ taxa: data.taxa || 1, cidade: cidadeBase });
      }
    } catch (error) {
      console.error('Erro ao carregar câmbio:', error);
    }
  };

  const carregarTransacoes = async () => {
    setLoading(true);
    
    // Usar walletService para buscar transações
    walletService.setUsuarioId(user?.id);
    const saldo = await walletService.getSaldo();
    setSaldoAtual(saldo.disponivel);
    
    const transacoesWallet = await walletService.getTransacoes(100);
    
    // Converter transações do walletService para o formato esperado
    const transacoesFormatadas: Transacao[] = transacoesWallet.map(t => ({
      id: t.id,
      tipo: t.tipo === 'recebimento' || t.tipo === 'recarga' || t.tipo === 'cashback' || t.tipo === 'indicacao' ? 'credito' : 'debito',
      valor: t.valor,
      descricao: t.descricao,
      servico: t.tipo,
      saldo_antes: 0,
      saldo_depois: 0,
      created_at: t.data,
      status: t.status
    }));
    
    setTransacoes(transacoesFormatadas);
    
    setLoading(false);
  };

  const converterParaReais = (valorMC: number): number => {
    return valorMC * cambio.taxa;
  };

  const formatarValor = (valorMC: number): string => {
    const valorReal = converterParaReais(valorMC);
    if (usandoMoedaConecta) {
      return `${valorMC.toFixed(2)} MC`;
    }
    return `R$ ${valorReal.toFixed(2)}`;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalCreditos = transacoes
    .filter(t => t.tipo === 'credito')
    .reduce((sum, t) => sum + converterParaReais(t.valor), 0);
  
  const totalDebitos = transacoes
    .filter(t => t.tipo === 'debito')
    .reduce((sum, t) => sum + converterParaReais(t.valor), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white font-bold text-lg">💰 Meu Extrato</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUsandoMoedaConecta(!usandoMoedaConecta)}
              className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              {usandoMoedaConecta ? 'MC' : 'R$'}
            </button>
            <button
              onClick={carregarTransacoes}
              className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Saldo Atual */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-center">
          <Wallet className="w-12 h-12 text-white mx-auto mb-3" />
          <p className="text-white/80 text-sm">Saldo disponível</p>
          <p className="text-4xl font-bold text-white">
            {usandoMoedaConecta 
              ? `${saldoAtual.toFixed(2)} MC`
              : `R$ ${(saldoAtual * cambio.taxa).toFixed(2)}`
            }
          </p>
          <p className="text-white/50 text-xs mt-1">
            {usandoMoedaConecta 
              ? `≈ R$ ${(saldoAtual * cambio.taxa).toFixed(2)}`
              : `≈ ${saldoAtual.toFixed(2)} MC`
            }
          </p>
          <p className="text-white/60 text-[10px] mt-1">
            Câmbio da cidade: 1 MC = R$ {cambio.taxa.toFixed(4)}
          </p>
          <button 
            onClick={() => router.push('/recarga')}
            className="mt-3 bg-yellow-500 text-black px-6 py-2 rounded-xl font-bold text-sm"
          >
            + Adicionar Saldo
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total de Entradas</p>
            <p className="text-2xl font-bold text-green-400">
              {usandoMoedaConecta 
                ? `${(totalCreditos / cambio.taxa).toFixed(2)} MC`
                : `R$ ${totalCreditos.toFixed(2)}`
              }
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total de Saídas</p>
            <p className="text-2xl font-bold text-red-400">
              {usandoMoedaConecta 
                ? `${(totalDebitos / cambio.taxa).toFixed(2)} MC`
                : `R$ ${totalDebitos.toFixed(2)}`
              }
            </p>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-gray-800/50 rounded-2xl overflow-hidden">
          <div className="bg-gray-800 px-5 py-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-400" />
              Histórico de Transações
            </h2>
            <span className="text-xs text-gray-400">
              1 MC = R$ {cambio.taxa.toFixed(4)}
            </span>
          </div>
          
          <div className="divide-y divide-gray-700">
            {transacoes.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma transação encontrada</p>
                <p className="text-gray-500 text-sm mt-1">Suas movimentações aparecerão aqui</p>
              </div>
            ) : (
              transacoes.map((transacao) => (
                <div key={transacao.id} className="p-4 hover:bg-white/5 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${
                        transacao.tipo === 'credito' 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        {transacao.tipo === 'credito' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transacao.descricao}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatarData(transacao.created_at)}
                        </p>
                        {transacao.servico && (
                          <p className="text-gray-500 text-xs mt-1">Tipo: {transacao.servico}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transacao.tipo === 'credito' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {transacao.tipo === 'credito' ? '+' : '-'} {formatarValor(transacao.valor)}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {usandoMoedaConecta 
                          ? `≈ R$ ${(transacao.valor * cambio.taxa).toFixed(2)}`
                          : `≈ ${transacao.valor.toFixed(2)} MC`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Informação do câmbio */}
        <div className="bg-gray-800/30 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">
            💱 Câmbio baseado na cidade <strong>{cambio.cidade}</strong><br />
            1 Moeda Conecta (MC) = R$ {cambio.taxa.toFixed(4)}
          </p>
        </div>
      </main>
    </div>
  );
}