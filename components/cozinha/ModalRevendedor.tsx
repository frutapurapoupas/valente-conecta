// components/cozinha/ModalRevendedor.tsx
// 🎨 DESIGN - Modal de Revendedor (Glassmorphism)

"use client";

import { X, Phone, Mail, MessageCircle } from 'lucide-react';

interface ModalRevendedorProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  user: { nome?: string; email?: string; telefone?: string } | null;
}

export default function ModalRevendedor({ isOpen, onConfirm, onCancel, user }: ModalRevendedorProps) {
  if (!isOpen) return null;

  const isLoggedIn = user && user.nome;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl max-w-md w-full border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-400">🤝 Parceiro Revendedor</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
            <p className="font-semibold text-purple-400">📋 Condições do Revendedor</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li>✅ Desconto de <span className="text-purple-400 font-bold">19%</span></li>
              <li>✅ Pedido mínimo: <span className="text-purple-400 font-bold">10 porções</span></li>
              <li>✅ Pagamento antecipado via PIX</li>
              <li>✅ Entrega diferenciada</li>
            </ul>
          </div>
          
          {!isLoggedIn ? (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-400 font-medium">
                ⚠️ Você não está logado como revendedor
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Para acessar o catálogo com desconto, entre em contato:
              </p>
              <div className="mt-3 space-y-2">
                <a
                  href="https://wa.me/5575999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition"
                >
                  <MessageCircle size={18} /> WhatsApp (75) 99999-9999
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400">
                ✅ Você está logado como <span className="text-white font-medium">{user.nome}</span>
              </p>
              <p className="text-sm text-green-400 mt-1">
                🎯 Seu perfil de revendedor está ativo!
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition font-medium border border-white/10"
          >
            Voltar
          </button>
          {isLoggedIn ? (
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition font-bold"
            >
              Ver Catálogo
            </button>
          ) : (
            <a
              href="https://wa.me/5575999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition font-bold text-center"
            >
              Falar com a Cozinha
            </a>
          )}
        </div>
      </div>
    </div>
  );
}