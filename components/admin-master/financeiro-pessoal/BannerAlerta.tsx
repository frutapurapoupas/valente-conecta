// components/admin-master/financeiro-pessoal/BannerAlerta.tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CreditCard, Calendar, X } from 'lucide-react';

interface Cartao {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
}

interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
  tipo: 'receita' | 'despesa';
  cartaoId?: string;
  parcela?: number;
  parcelasTotais?: number;
}

interface BannerAlertaProps {
  cartoes: Cartao[];
  lancamentos: Lancamento[];
}

interface AlertaCartao {
  cartaoId: string;
  cartaoNome: string;
  tipo: 'fechamento' | 'vencimento';
  data: Date;
  diasRestantes: number;
  valorFatura?: number;
}

export function BannerAlerta({ cartoes, lancamentos }: BannerAlertaProps) {
  const [alertas, setAlertas] = useState<AlertaCartao[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    const calcularAlertas = () => {
      const hoje = new Date();
      const novosAlertas: AlertaCartao[] = [];

      cartoes.forEach(cartao => {
        // Alerta de fechamento
        const dataFechamento = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.diaFechamento);
        if (dataFechamento < hoje) {
          dataFechamento.setMonth(dataFechamento.getMonth() + 1);
        }
        const diasParaFechamento = Math.ceil((dataFechamento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diasParaFechamento <= 7 && diasParaFechamento >= 0) {
          novosAlertas.push({
            cartaoId: cartao.id,
            cartaoNome: cartao.nome,
            tipo: 'fechamento',
            data: dataFechamento,
            diasRestantes: diasParaFechamento,
          });
        }

        // Alerta de vencimento
        const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), cartao.diaVencimento);
        if (dataVencimento < hoje) {
          dataVencimento.setMonth(dataVencimento.getMonth() + 1);
        }
        const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calcular fatura aproximada do mês atual
        const faturaAtual = lancamentos
          .filter(l => l.cartaoId === cartao.id)
          .filter(l => {
            const dataLancamento = new Date(l.data);
            const mesReferencia = hoje.getMonth();
            return dataLancamento.getMonth() === mesReferencia;
          })
          .reduce((sum, l) => sum + l.valor, 0);

        if (diasParaVencimento <= 7 && diasParaVencimento >= 0) {
          novosAlertas.push({
            cartaoId: cartao.id,
            cartaoNome: cartao.nome,
            tipo: 'vencimento',
            data: dataVencimento,
            diasRestantes: diasParaVencimento,
            valorFatura: faturaAtual > 0 ? faturaAtual : undefined,
          });
        }
      });

      setAlertas(novosAlertas);
    };

    calcularAlertas();
  }, [cartoes, lancamentos]);

  const dismissAlert = (key: string) => {
    setDismissedAlerts(prev => [...prev, key]);
  };

  const alertasVisiveis = alertas.filter(a => !dismissedAlerts.includes(`${a.cartaoId}-${a.tipo}`));

  if (alertasVisiveis.length === 0) return null;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };
    
    return (
      <div className="space-y-2 mb-4">
        {alertasVisiveis.map(alerta => (
          <div
            key={`${alerta.cartaoId}-${alerta.tipo}`}
            className={`rounded-lg p-3 flex items-center justify-between shadow-sm ${
              alerta.diasRestantes === 0 
                ? 'bg-red-100 border border-red-300' 
                : alerta.diasRestantes <= 3 
                  ? 'bg-orange-100 border border-orange-300'
                  : 'bg-yellow-100 border border-yellow-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${alerta.diasRestantes === 0 ? 'bg-red-200' : 'bg-yellow-200'}`}>
                {alerta.tipo === 'vencimento' ? <CreditCard size={18} className="text-gray-700" /> : <Calendar size={18} className="text-gray-700" />}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {alerta.tipo === 'vencimento' ? '💳 Fatura do cartão' : '📆 Fechamento da fatura'}
                </p>
                <p className="text-sm text-gray-600">
                  {alerta.tipo === 'vencimento' 
                    ? `Cartão ${alerta.cartaoNome} vence em ${alerta.diasRestantes === 0 ? 'hoje!' : `${alerta.diasRestantes} dias`}`
                    : `Fatura do cartão ${alerta.cartaoNome} fecha em ${alerta.diasRestantes === 0 ? 'hoje!' : `${alerta.diasRestantes} dias`}`
                  }
                  {alerta.valorFatura && alerta.valorFatura > 0 && (
                    <span className="ml-1 font-semibold">Valor estimado: {formatarMoeda(alerta.valorFatura)}</span>
                  )}
                </p>
              </div>
            </div>
            <button onClick={() => dismissAlert(`${alerta.cartaoId}-${alerta.tipo}`)} className="p-1 hover:bg-gray-200 rounded">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    );
}