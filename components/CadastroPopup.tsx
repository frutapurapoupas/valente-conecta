// components/CadastroPopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { cadastroSimples, isSessaoTempValida, isUserLoggedIn } from '@/lib/auth';
import toast from 'react-hot-toast';

interface CadastroPopupProps {
  onSuccess?: () => void;
  codigoIndicacao?: string;
  /** Pula o timer/checagem de "já mostrou antes" e abre na hora — usado na
   * página de convite, onde o visitante já veio com intenção de cadastro. */
  forceShow?: boolean;
}

export function CadastroPopup({ onSuccess, codigoIndicacao, forceShow }: CadastroPopupProps) {
  const [show, setShow] = useState(false);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forceShow) {
      if (!isUserLoggedIn()) setShow(true);
      return;
    }

    // Não mostrar se já logado
    if (isUserLoggedIn()) return;

    // Verificar sessão temporária
    if (isSessaoTempValida()) return;

    // Verificar se já mostrou antes
    const alreadyShown = localStorage.getItem('cadastro_popup_shown');
    if (alreadyShown) return;

    // Mostrar popup após 2 segundos
    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem('cadastro_popup_shown', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, [forceShow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error('Digite seu nome');
      return;
    }
    
    if (!whatsapp.trim() || whatsapp.length < 10) {
      toast.error('Digite um WhatsApp válido (com DDD)');
      return;
    }

    if (!cidade.trim()) {
      toast.error('Digite sua cidade');
      return;
    }

    setLoading(true);

    const result = await cadastroSimples(nome, whatsapp, codigoIndicacao, cidade);
    
    if (result.success) {
      toast.success('✅ Cadastro realizado! Agora você tem acesso completo.');
      setShow(false);
      localStorage.setItem('onboarding_pos_cadastro', '1');
      onSuccess?.();

      // Recarregar para atualizar estado
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error(result.error || 'Erro ao cadastrar. Tente novamente.');
    }
    
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-green-500/30 animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Cadastro Rápido</h2>
          </div>
          <button onClick={() => setShow(false)} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 text-sm mb-4 text-center">
            Complete seu cadastro para ter acesso completo a todas as funcionalidades!
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Seu nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-gray-700 rounded-xl p-3 text-white border border-gray-600 focus:border-green-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">WhatsApp (com DDD)</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 75999999999"
                className="w-full bg-gray-700 rounded-xl p-3 text-white border border-gray-600 focus:border-green-500 outline-none"
                required
              />
              <p className="text-gray-500 text-xs mt-1">✅ Número real para notificações</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Sua cidade</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Valente"
                  className="w-full bg-gray-700 rounded-xl p-3 pl-9 text-white border border-gray-600 focus:border-green-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : (
                <>
                  Continuar <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

