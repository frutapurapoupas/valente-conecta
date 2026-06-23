// components/cozinha/ModalPagamento.tsx
// 🎨 UI - Modal de Pagamento Fluido

"use client";

import { useState } from 'react';
import { X, Check, AlertCircle, Loader2, QrCode, CreditCard, Landmark } from 'lucide-react';

interface ModalPagamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dados: { metodo: string; valor: number; descricao: string }) => void;
  valor: number;
  descricao: string;
  titulo?: string;
}

export function ModalPagamento({ 
  isOpen, 
  onClose, 
  onConfirm, 
  valor, 
  descricao,
  titulo = '💳 Pagamento'
}: ModalPagamentoProps) {
  const [etapa, setEtapa] = useState<'confirmacao' | 'processando' | 'sucesso' | 'erro'>('confirmacao');
  const [metodo, setMetodo] = useState<'pix' | 'credito' | 'debito'>('pix');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = async () => {
    setEtapa('processando');
    setErrorMessage('');
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular sucesso (95% de chance)
      if (Math.random() > 0.05) {
        setEtapa('sucesso');
        setTimeout(() => {
          onConfirm({ metodo, valor, descricao });
          setTimeout(() => {
            onClose();
            setEtapa('confirmacao');
          }, 500);
        }, 1500);
      } else {
        throw new Error('Erro na transação');
      }
    } catch {
      setEtapa('erro');
      setErrorMessage('Ocorreu um erro ao processar o pagamento. Tente novamente.');
    }
  };

  const handleRetry = () => {
    setEtapa('confirmacao');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {etapa === 'confirmacao' && (
          <>
            <div className="mb-6 p-4 bg-gray-700/30 rounded-xl">
              <p className="text-gray-400 text-sm">Valor a pagar</p>
              <p className="text-3xl font-bold text-green-400">R$ {valor.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{descricao}</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setMetodo('pix')}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition ${
                  metodo === 'pix' ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <QrCode size={20} className="text-green-400" />
                </div>
                <span className="flex-1 text-left font-medium">PIX - Instantâneo</span>
                {metodo === 'pix' && <Check size={20} className="text-green-400" />}
              </button>

              <button
                onClick={() => setMetodo('credito')}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition ${
                  metodo === 'credito' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <CreditCard size={20} className="text-blue-400" />
                </div>
                <span className="flex-1 text-left font-medium">Cartão de Crédito</span>
                {metodo === 'credito' && <Check size={20} className="text-blue-400" />}
              </button>

              <button
                onClick={() => setMetodo('debito')}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition ${
                  metodo === 'debito' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Landmark size={20} className="text-purple-400" />
                </div>
                <span className="flex-1 text-left font-medium">Débito em Conta</span>
                {metodo === 'debito' && <Check size={20} className="text-purple-400" />}
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm} 
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition font-bold"
              >
                Confirmar Pagamento
              </button>
            </div>
          </>
        )}

        {etapa === 'processando' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Processando pagamento...</p>
            <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
          </div>
        )}

        {etapa === 'sucesso' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={48} className="text-green-400" />
            </div>
            <p className="text-xl font-bold text-green-400">✅ Pagamento Confirmado!</p>
            <p className="text-gray-400 mt-2">Transação realizada com sucesso</p>
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300">Valor: <span className="text-green-400 font-bold">R$ {valor.toFixed(2)}</span></p>
              <p className="text-sm text-gray-300">Método: <span className="text-white">{metodo.toUpperCase()}</span></p>
            </div>
          </div>
        )}

        {etapa === 'erro' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={48} className="text-red-400" />
            </div>
            <p className="text-xl font-bold text-red-400">❌ Erro no Pagamento</p>
            <p className="text-gray-400 mt-2">{errorMessage || 'Tente novamente ou use outro método'}</p>
            <button
              onClick={handleRetry}
              className="mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}