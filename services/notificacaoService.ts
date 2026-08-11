// services/notificacaoService.ts
export const notificacaoService = {
  enviar: async (data: any) => {
    console.log('Enviando notificação:', data);
    return { success: true };
  },

  /**
   * Salva a inscrição de push notification do navegador para um usuário.
   * Usada por components/PushSubscriptionManager.tsx. Fecha a lacuna
   * apontada no VALENTE_CONECTA_MASTER_SPEC.md, seção 6.
   */
  salvarPushSubscription: async (subscription: PushSubscription, usuarioId: string): Promise<boolean> => {
    if (!usuarioId) return false;
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, subscription: subscription.toJSON() }),
      });
      const data = await response.json();
      return !!data.success;
    } catch (error) {
      console.error('Erro ao salvar inscrição de push:', error);
      return false;
    }
  },
};
