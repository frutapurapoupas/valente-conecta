'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Package } from 'lucide-react';
import { obterUsuarioLocalId } from '@/lib/usuarioLocal';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  created_at: string;
}

// Beep curto sintetizado via Web Audio API — sem depender de arquivo de audio.
function tocarBipNotificacao() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
    oscillator.onended = () => ctx.close();
  } catch {
    // navegador sem suporte a Web Audio — segue sem som
  }
}

export default function NotificacaoSininho() {
  const [usuarioId, setUsuarioId] = useState('');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const naoLidasAnteriorRef = useRef(0);

  useEffect(() => {
    setUsuarioId(obterUsuarioLocalId());
  }, []);

  useEffect(() => {
    if (!usuarioId) return;

    carregarNotificacoes();

    // Verificar notificações a cada 30 segundos
    const interval = setInterval(carregarNotificacoes, 30000);

    return () => clearInterval(interval);
  }, [usuarioId]);

  const carregarNotificacoes = async () => {
    try {
      const response = await fetch(`/api/notificacoes?usuarioId=${usuarioId}`);
      const data = await response.json();

      if (data.success) {
        setNotificacoes(data.notificacoes);
        const naoLidasCount = data.notificacoes.filter((n: Notificacao) => !n.lida).length;
        if (naoLidasCount > naoLidasAnteriorRef.current) {
          tocarBipNotificacao();
        }
        naoLidasAnteriorRef.current = naoLidasCount;
        setNaoLidas(naoLidasCount);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await fetch(`/api/notificacoes?id=${id}`, { method: 'PUT' });
      carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  };

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id);
    setMostrarMenu(false);

    if (notificacao.link) {
      window.location.href = notificacao.link;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMostrarMenu(!mostrarMenu)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {mostrarMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notificações</h3>
              <button onClick={() => setMostrarMenu(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleNotificacaoClick(notificacao)}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notificacao.lida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      <Package className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{notificacao.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">{notificacao.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notificacao.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

