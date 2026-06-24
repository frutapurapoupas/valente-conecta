// ============================================================================
// ARQUIVO 7: services/notificacaoService.ts
// Funcionalidade: Service completo para gerenciar notificações com Supabase
// Atualizado: Suporte a grupos dinâmicos, modo teste, logs, push, telegram e FILA
// ============================================================================

import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface NotificacaoAdmin {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'aviso' | 'alerta' | 'info' | 'sucesso' | 'promocao';
  importancia: 'alta' | 'media' | 'baixa';
  para_todos: boolean;
  para_grupo?: string;
  para_usuario_id: string | null;
  para_telegram_id: string | null;
  data_criacao: string;
  data_expiracao: string | null;
  ativa: boolean;
  exibida_uma_vez: boolean;
  enviar_telegram: boolean;
  enviar_push: boolean;
  visualizada_por: string[];
  link_url?: string;
  imagem_url?: string;
}

export interface ConfiguracaoSistema {
  modo_teste: boolean;
  telegram_grupo_teste_id: string;
  telegram_grupo_todos_id: string;
  notificacao_timeout: number;
}

export const notificacaoService = {
  // ==========================================================================
  // CONFIGURAÇÕES
  // ==========================================================================

  async getConfiguracao<T>(chave: string, valorPadrao: T): Promise<T> {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', chave)
        .single();

      if (!error && data) {
        return data.valor as T;
      }
    } catch (error) {
      console.error(`Erro ao buscar config ${chave}:`, error);
    }
    
    const local = localStorage.getItem(`config_${chave}`);
    if (local) {
      try {
        return JSON.parse(local) as T;
      } catch {
        return local as T;
      }
    }
    
    return valorPadrao;
  },

  async getModoTeste(): Promise<boolean> {
    return await this.getConfiguracao<boolean>('modo_teste', true);
  },

  async getGrupoTesteId(): Promise<string> {
    return await this.getConfiguracao<string>('telegram_grupo_teste_id', '@valenteconecta_teste');
  },

  async getGrupoTodosId(): Promise<string> {
    return await this.getConfiguracao<string>('telegram_grupo_todos_id', '@valenteconecta');
  },

  async getGrupoTelegramChatId(grupoId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('grupos_dinamicos')
        .select('telegram_chat_id')
        .eq('id', grupoId)
        .single();

      if (!error && data) {
        return data.telegram_chat_id;
      }
    } catch (error) {
      console.error(`Erro ao buscar chat_id do grupo ${grupoId}:`, error);
    }
    return null;
  },

  // ==========================================================================
  // NOTIFICAÇÕES - CRUD
  // ==========================================================================

  async getNotificacoesAtivas(): Promise<NotificacaoAdmin[]> {
    try {
      const { data, error } = await supabase
        .from('notificacoes_admin')
        .select('*')
        .eq('ativa', true)
        .or(`para_todos.eq.true,para_usuario_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
        .is('data_expiracao', null)
        .or(`data_expiracao.gt.${new Date().toISOString()},data_expiracao.is.null`)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      
      const fallback = localStorage.getItem('admin_notificacoes_sistema');
      if (fallback) {
        return JSON.parse(fallback);
      }
      return [];
    }
  },

  async criarNotificacao(notificacao: Partial<NotificacaoAdmin>): Promise<NotificacaoAdmin | null> {
    try {
      const { data, error } = await supabase
        .from('notificacoes_admin')
        .insert({
          ...notificacao,
          data_criacao: new Date().toISOString(),
          visualizada_por: []
        })
        .select()
        .single();

      if (error) throw error;

      const existing = localStorage.getItem('admin_notificacoes_sistema');
      const existingList = existing ? JSON.parse(existing) : [];
      localStorage.setItem('admin_notificacoes_sistema', JSON.stringify([data, ...existingList]));

      if (data) {
        // ✅ NOVO: Usar fila para processamento em background
        await this.enviarNotificacaoEmBackground(data);
      }

      toast.success('✅ Notificação criada e adicionada à fila!');
      return data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast.error('Erro ao criar notificação');
      return null;
    }
  },

  // ==========================================================================
  // 🆕 NOVA FUNÇÃO: ENVIAR PARA FILA (BACKGROUND)
  // ==========================================================================

  async enviarNotificacaoEmBackground(notificacao: NotificacaoAdmin): Promise<boolean> {
    try {
      const modoTeste = await this.getModoTeste();
      
      const response = await fetch('/api/notificacoes/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notificacao.id,
          titulo: notificacao.titulo,
          mensagem: notificacao.mensagem,
          tipo: notificacao.tipo,
          importancia: notificacao.importancia,
          enviar_telegram: notificacao.enviar_telegram,
          enviar_push: notificacao.enviar_push,
          para_grupo: notificacao.para_grupo,
          para_usuario_id: notificacao.para_usuario_id,
          link_url: notificacao.link_url,
          modo_teste: modoTeste,
          created_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log(`📋 Notificação ${notificacao.id} adicionada à fila`);
        return true;
      }
    } catch (error) {
      console.error('Erro ao enviar para fila:', error);
    }
    return false;
  },

  async atualizarNotificacao(id: string, updates: Partial<NotificacaoAdmin>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificacoes_admin')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      const existing = localStorage.getItem('admin_notificacoes_sistema');
      if (existing) {
        const lista = JSON.parse(existing);
        const index = lista.findIndex((n: any) => n.id === id);
        if (index !== -1) {
          lista[index] = { ...lista[index], ...updates };
          localStorage.setItem('admin_notificacoes_sistema', JSON.stringify(lista));
        }
      }
      
      toast.success('✅ Notificação atualizada!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      toast.error('Erro ao atualizar notificação');
      return false;
    }
  },

  async deletarNotificacao(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificacoes_admin')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('✅ Notificação removida!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Erro ao deletar notificação');
      return false;
    }
  },

  // ==========================================================================
  // ENVIO DE NOTIFICAÇÕES (DIRETO - SEM FILA)
  // ==========================================================================

  async enviarTelegram(notificacao: NotificacaoAdmin): Promise<boolean> {
    if (!notificacao.enviar_telegram) return false;

    try {
      const modoTeste = await this.getModoTeste();
      let chatId: string;
      
      if (modoTeste) {
        chatId = await this.getGrupoTesteId();
      } else if (notificacao.para_grupo && notificacao.para_grupo !== 'todos') {
        const grupoChatId = await this.getGrupoTelegramChatId(notificacao.para_grupo);
        chatId = grupoChatId || (await this.getGrupoTodosId());
      } else {
        chatId = await this.getGrupoTodosId();
      }
      
      const grupoNome = notificacao.para_grupo === 'todos' ? 'Todos' : notificacao.para_grupo || 'Todos';
      const mensagem = modoTeste 
        ? `🧪 *MODO TESTE* - Esta notificação não foi enviada para todos\n\n📢 *${notificacao.titulo}*\n\n${notificacao.mensagem}\n\n📌 *Grupo:* ${grupoNome}\n\n🔗 Acesse o app: valenteconecta.clic.com.br`
        : `📢 *${notificacao.titulo}*\n\n${notificacao.mensagem}\n\n📌 *Grupo:* ${grupoNome}\n\n🔗 Acesse o app: valenteconecta.clic.com.br`;
      
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: mensagem,
          parseMode: 'Markdown'
        })
      });

      if (response.ok) {
        toast.success(`📨 Notificação enviada para o Telegram!${modoTeste ? ' (MODO TESTE)' : ''}`);
        await this.registrarLog(notificacao.id, 'telegram', 'enviado');
        return true;
      }
    } catch (error) {
      console.error('Erro ao enviar Telegram:', error);
      await this.registrarLog(notificacao.id, 'telegram', 'falhou', String(error));
      toast.error('Erro ao enviar notificação para o Telegram');
    }
    return false;
  },

  async enviarPushNotification(notificacao: NotificacaoAdmin): Promise<boolean> {
    if (!notificacao.enviar_push) return false;

    try {
      const modoTeste = await this.getModoTeste();
      
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.log('Push não suportado ou sem permissão');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notificacao.titulo, {
        body: `${notificacao.mensagem}${modoTeste ? ' 🧪 MODO TESTE' : ''}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: { url: notificacao.link_url || '/' }
      });

      await this.registrarLog(notificacao.id, 'push', 'enviado');
      return true;
    } catch (error) {
      console.error('Erro ao enviar push:', error);
      await this.registrarLog(notificacao.id, 'push', 'falhou', String(error));
      return false;
    }
  },

  private async dispararEnvioAdicional(notificacao: NotificacaoAdmin): Promise<void> {
    // ⚠️ Este método foi substituído pelo sistema de fila
    // Mantido para compatibilidade, mas não é mais usado
    console.log('dispararEnvioAdicional substituído pela fila');
  },

  // ==========================================================================
  // CONTROLE DE VISUALIZAÇÃO (POPUP ÚNICA VEZ)
  // ==========================================================================

  async marcarComoVisualizada(notificacaoId: string, usuarioId: string): Promise<void> {
    try {
      const { data: notif } = await supabase
        .from('notificacoes_admin')
        .select('visualizada_por')
        .eq('id', notificacaoId)
        .single();

      const visualizadaPor = notif?.visualizada_por || [];
      if (!visualizadaPor.includes(usuarioId)) {
        await supabase
          .from('notificacoes_admin')
          .update({ visualizada_por: [...visualizadaPor, usuarioId] })
          .eq('id', notificacaoId);
        
        await this.registrarLog(notificacaoId, 'popup', 'visualizado');
      }
    } catch (error) {
      console.error('Erro ao marcar como visualizada:', error);
    }
  },

  async jaFoiVisualizada(notificacaoId: string, usuarioId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('notificacoes_admin')
        .select('visualizada_por')
        .eq('id', notificacaoId)
        .single();

      return data?.visualizada_por?.includes(usuarioId) || false;
    } catch (error) {
      return false;
    }
  },

  // ==========================================================================
  // LOGS
  // ==========================================================================

  async registrarLog(notificacaoId: string, tipo: string, status: string, erro?: string): Promise<void> {
    try {
      await supabase
        .from('notificacoes_logs')
        .insert({
          notificacao_id: notificacaoId,
          tipo_envio: tipo,
          status,
          mensagem_erro: erro,
          data_envio: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  },

  async getLogsPorNotificacao(notificacaoId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notificacoes_logs')
        .select('*')
        .eq('notificacao_id', notificacaoId)
        .order('data_envio', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  },

  async getLogsPorUsuario(usuarioId: string, limite: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notificacoes_logs')
        .select('*, notificacoes_admin(titulo, mensagem)')
        .eq('usuario_id', usuarioId)
        .order('data_envio', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs do usuário:', error);
      return [];
    }
  },

  // ==========================================================================
  // REALTIME SUBSCRIPTION
  // ==========================================================================

  subscribeToNotificacoes(callback: (notificacao: NotificacaoAdmin) => void) {
    const subscription = supabase
      .channel('notificacoes_admin_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes_admin'
        },
        (payload) => {
          callback(payload.new as NotificacaoAdmin);
          
          const timeout = 8000;
          toast((t) => (
            <div 
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = payload.new.link_url || '/';
              }}
              className="cursor-pointer"
            >
              <strong>📢 {payload.new.titulo}</strong>
              <p className="text-sm">{payload.new.mensagem}</p>
            </div>
          ), { duration: timeout });
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  },

  // ==========================================================================
  // PUSH SUBSCRIPTIONS (Web Push)
  // ==========================================================================

  async salvarPushSubscription(subscription: PushSubscriptionJSON, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          usuario_id: userId,
          user_id: userId,
          subscription,
          ativo: true,
          ultimo_uso: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar push subscription:', error);
      return false;
    }
  },

  async getPushSubscriptions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('subscription, usuario_id')
        .eq('ativo', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar push subscriptions:', error);
      return [];
    }
  },

  async removerPushSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ ativo: false })
        .eq('usuario_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover push subscription:', error);
      return false;
    }
  },

  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================

  async solicitarPermissaoPush(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Push não suportado');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async isPushPermitido(): Promise<boolean> {
    return 'Notification' in window && Notification.permission === 'granted';
  }
};

interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}