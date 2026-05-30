// components/PopupPagamento.tsx
'use client';

import { useState } from 'react';
import { X, Wallet, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface PopupPagamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  servico: string;
  valor: number;
  saldoAtual: number;
  descricao: string;
}

export function PopupPagamento({
  isOpen,
  onClose,
  onConfirm,
  servico,
  valor,
  saldoAtual,
  descricao
}: PopupPagamentoProps) {
  const [loading, setLoading] = useState(false);
  const saldoSuficiente = saldoAtual >= valor;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!saldoSuficiente) {
      toast.error(`Saldo insuficiente. Recarregue R$ ${(valor - saldoAtual).toFixed(2)}`);
      return;
    }
    
    setLoading(true);
    const success = await onConfirm();
    setLoading(false);
    
    if (success) {
      toast.success(`✅ ${descricao} concluído!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-green-500/30 animate-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Confirmar Pagamento</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">{servico}</h3>
            <p className="text-gray-400 text-sm mt-1">{descricao}</p>
          </div>
          
          <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Valor do serviço:</span>
              <span className="text-yellow-400 font-bold">R$ {valor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Seu saldo atual:</span>
              <span className={saldoSuficiente ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                R$ {saldoAtual.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-600">
              <span className="text-gray-400">Saldo após:</span>
              <span className="text-white font-bold">
                R$ {(saldoAtual - valor).toFixed(2)}
              </span>
            </div>
          </div>
          
          {!saldoSuficiente && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-3">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Saldo insuficiente! Recarregue sua carteira.
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !saldoSuficiente}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
          
          <p className="text-gray-500 text-xs text-center">
            O valor será debitado automaticamente da sua carteira
          </p>
        </div>
      </div>
    </div>
  );
}