'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { notificacaoService, NotificacaoAdmin } from '@/services/notificacaoService';

export function NotificationToast() {
  useEffect(() => {
    // Subscrever para notificações em tempo real
    const subscription = notificacaoService.subscribeToNotificacoes((notificacao) => {
      // Exibir toast customizado
      toast.custom((t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            if (notificacao.link_url) {
              window.location.href = notificacao.link_url;
            }
          }}
          className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-4 shadow-2xl max-w-sm mx-4"
        >
          <strong className="block text-sm">?? {notificacao.titulo}</strong>
          <p className="text-xs opacity-90 mt-1">{notificacao.mensagem}</p>
        </div>
      ), { duration: 8000 });
    });

    return () => {
      subscription?.();
    };
  }, []);

  return null;
}

