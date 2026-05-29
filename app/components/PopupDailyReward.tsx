// components/PopupDailyReward.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PopupDailyRewardProps {
  userId: number;
  onClose: () => void;
}

export function PopupDailyReward({ userId, onClose }: PopupDailyRewardProps) {
  const [show, setShow] = useState(false);
  const [tipo, setTipo] = useState<'estabelecimento' | 'servico'>('estabelecimento');

  useEffect(() => {
    verificarPopup();
  }, []);

  async function verificarPopup() {
    const { data: user } = await supabase
      .from('usuarios')
      .select('last_popup_shown, is_viral_active, viral_end_at')
      .eq('id', userId)
      .single();

    // Só mostrar durante período viral
    if (!user?.is_viral_active) return;

    const now = new Date();
    const lastShown = user.last_popup_shown ? new Date(user.last_popup_shown) : null;
    const hoje = now.toDateString();

    // Verificar se já mostrou hoje
    if (lastShown && lastShown.toDateString() === hoje) {
      const populado = localStorage.getItem(`popup_${hoje}`);
      const frequencia = await getFrequenciaPopup();
      
      if (populado && parseInt(populado) >= frequencia) {
        return; // Já mostrou as 2 vezes hoje
      }
      
      const novaContagem = (parseInt(populado || '0') + 1);
      localStorage.setItem(`popup_${hoje}`, novaContagem.toString());
    } else {
      localStorage.setItem(`popup_${hoje}`, '1');
    }

    // Alternar entre tipos
    const ultimoTipo = localStorage.getItem('ultimo_tipo_popup');
    setTipo(ultimoTipo === 'estabelecimento' ? 'servico' : 'estabelecimento');
    localStorage.setItem('ultimo_tipo_popup', tipo);
    
    setShow(true);
    
    // Atualizar timestamp
    await supabase
      .from('usuarios')
      .update({ last_popup_shown: now.toISOString() })
      .eq('id', userId);
  }

  async function getFrequenciaPopup(): Promise<number> {
    const { data } = await supabase
      .from('admin_configuracoes')
      .select('valor')
      .eq('chave', 'popup_diario_frequencia')
      .single();
    return data ? parseInt(data.valor) : 2;
  }

  if (!show) return null;

  const valorRecompensa = tipo === 'estabelecimento' ? 10 : 10;
  const metaItens = tipo === 'estabelecimento' ? '10 itens' : '5 itens';
  const texto = tipo === 'estabelecimento'
    ? `💰 GANHE R$${valorRecompensa} POR ESTABELECIMENTO!
       
       Indique um estabelecimento (mercado, loja, restaurante) que ainda não usa o app.
       Quando eles cadastrarem ${metaItens} com preço, estoque e foto, você recebe R$${valorRecompensa} no PIX!`
    : `💰 GANHE R$${valorRecompensa} POR SERVIÇO!
       
       Indique um prestador de serviço (mecânico, salão, mototáxi) que ainda não usa o app.
       Quando eles cadastrarem ${metaItens} serviços com preço e foto, você recebe R$${valorRecompensa} no PIX!`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl max-w-md w-full p-6 border border-green-500 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">GANHE DINHEIRO!</h2>
          <div className="text-white whitespace-pre-line text-left mb-6 bg-black/30 rounded-xl p-4">
            {texto}
          </div>
          
          <div className="bg-yellow-500/20 rounded-xl p-3 mb-4">
            <p className="text-yellow-400 text-sm">🎯 Como funciona:</p>
            <p className="text-gray-300 text-xs mt-1">
              1. Indique {tipo === 'estabelecimento' ? '2 estabelecimentos' : '4 serviços'}<br />
              2. Eles cadastrarem os produtos/serviços<br />
              3. Você recebe R${valorRecompensa * (tipo === 'estabelecimento' ? 2 : 4)} no PIX!
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShow(false);
                onClose();
              }}
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-bold"
            >
              Lembrar Depois
            </button>
            <button
              onClick={() => {
                setShow(false);
                window.location.href = '/indicar-estabelecimento';
                onClose();
              }}
              className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-bold"
            >
              Quero Indicar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}