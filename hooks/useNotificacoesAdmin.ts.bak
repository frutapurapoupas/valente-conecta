import { useState, useEffect, useCallback } from 'react';
import { notificacaoService, NotificacaoAdmin } from '@/services/notificacaoService';
import { useApp } from '@/app/context/AppContext';
import toast from 'react-hot-toast';

export function useNotificacoesAdmin() {
  const { user } = useApp();
  const [notificacoes, setNotificacoes] = useState<NotificacaoAdmin[]>([]);
  const [notificacaoPopup, setNotificacaoPopup] = useState<NotificacaoAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarNotificacoes = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await notificacaoService.getNotificacoesAtivas();
      setNotificacoes(data);

      // Verificar notificações que precisam de popup (única vez)
      for (const notif of data) {
        if (notif.exibida_uma_vez) {
          const jaVista = await notificacaoService.jaFoiVisualizada(notif.id, user.id);
          if (!jaVista) {
            setNotificacaoPopup(notif);
            
            // Mostrar toast com estilo de popup
            toast.custom((t) => (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-4 shadow-2xl max-w-sm mx-4 animate-in slide-in-from-top duration-300">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {notif.tipo === 'alerta' ? '⚠️' : notif.tipo === 'sucesso' ? '✅' : '📢'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{notif.titulo}</p>
                    <p className="text-xs opacity-90 mt-1">{notif.mensagem}</p>
                    {notif.link_url && (
                      <a 
                        href={notif.link_url}
                        className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full inline-block hover:bg-white/30 transition"
                      >
                        Ver detalhes →
                      </a>
                    )}
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        notificacaoService.marcarComoVisualizada(notif.id, user.id);
                        setNotificacaoPopup(null);
                      }}
                      className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
                    >
                      Entendi
                    </button>
                  </div>
                </div>
              </div>
            ), { duration: 10000, id: `popup-${notif.id}` });
            
            break; // Mostrar apenas um popup por vez
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Carregar notificações iniciais
  useEffect(() => {
    if (user?.id) {
      carregarNotificacoes();
    }
  }, [user?.id, carregarNotificacoes]);

  // Inscrever para notificações em tempo real
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = notificacaoService.subscribeToNotificacoes((novaNotificacao) => {
      // Adicionar à lista
      setNotificacoes(prev => [novaNotificacao, ...prev]);
      
      // Se for para este usuário e tem popup, mostrar
      if (novaNotificacao.exibida_uma_vez && (novaNotificacao.para_todos || novaNotificacao.para_usuario_id === user.id)) {
        setNotificacaoPopup(novaNotificacao);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  return {
    notificacoes,
    notificacaoPopup,
    loading,
    recarregar: carregarNotificacoes,
    marcarComoVisualizada: (id: string) => notificacaoService.marcarComoVisualizada(id, user?.id || '')
  };
}