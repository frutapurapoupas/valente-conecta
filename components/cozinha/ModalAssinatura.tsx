// components/cozinha/ModalAssinatura.tsx
// 🎨 DESIGN - Modal de Assinatura (Glassmorphism)

"use client";

import { X } from 'lucide-react';

interface ModalAssinaturaProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalAssinatura({ isOpen, onConfirm, onCancel }: ModalAssinaturaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl max-w-md w-full border border-yellow-500/30 p-6 shadow-2xl shadow-yellow-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">⭐ Cliente Assinatura</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4">
            <p className="font-semibold text-yellow-400">📋 Condições da Assinatura</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li>✅ Desconto de <span className="text-yellow-400 font-bold">15%</span> em todos os pratos</li>
              <li>✅ Pedido mínimo de <span className="text-yellow-400 font-bold">5 porções</span></li>
              <li>✅ Pagamento antecipado via PIX</li>
              <li>✅ Entrega prioritária</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-gray-400">
              💡 Ao confirmar, o desconto será aplicado automaticamente.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition font-medium border border-white/10"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl transition font-bold"
          >
            Confirmar Assinatura
          </button>
        </div>
      </div>
    </div>
  );
}