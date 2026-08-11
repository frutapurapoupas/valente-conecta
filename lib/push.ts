import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:suporte@valenteconecta.com.br', vapidPublicKey, vapidPrivateKey);
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Envia uma push notification para um aluno, se ele tiver uma inscricao salva
 * (academia_alunos.push_subscription) e as chaves VAPID estiverem configuradas.
 * Falha silenciosamente (apenas loga) — notificacao e um extra, nunca deve
 * quebrar o fluxo principal (ex: registrar uma cobranca) por causa disso.
 */
export async function enviarPushParaAluno(alunoId: number | string, payload: PushPayload): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) return;

  try {
    const supabase = createClient();
    const { data: aluno } = await supabase
      .from('academia_alunos')
      .select('push_subscription')
      .eq('id', alunoId)
      .maybeSingle();

    const subscription = aluno?.push_subscription;
    if (!subscription) return;

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: { url: payload.url || '/academia/aluno' },
      })
    );
  } catch (error: any) {
    if (error?.statusCode === 410 || error?.statusCode === 404) {
      // Inscricao expirada/invalida — limpa para nao tentar de novo.
      try {
        const supabase = createClient();
        await supabase.from('academia_alunos').update({ push_subscription: null }).eq('id', alunoId);
      } catch {
        // segue sem quebrar o fluxo principal
      }
    } else {
      console.error('Erro ao enviar push para aluno', alunoId, error);
    }
  }
}

/**
 * Envia uma push notification para qualquer usuario com inscricao salva em
 * push_subscriptions (tabela generica, ver 009_push_subscriptions.sql).
 * Usada pelo fluxo de interesse do marketplace para avisar o fornecedor.
 * Mesma politica de falha silenciosa da versao especifica de aluno acima.
 */
export async function enviarPushParaUsuario(usuarioId: string, payload: { titulo: string; corpo: string; url?: string }): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) return;

  try {
    const supabase = createClient();
    const { data: registro } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    const subscription = registro?.subscription;
    if (!subscription) return;

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.titulo,
        body: payload.corpo,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: { url: payload.url || '/' },
      })
    );
  } catch (error: any) {
    if (error?.statusCode === 410 || error?.statusCode === 404) {
      try {
        const supabase = createClient();
        await supabase.from('push_subscriptions').delete().eq('usuario_id', usuarioId);
      } catch {
        // segue sem quebrar o fluxo principal
      }
    } else {
      console.error('Erro ao enviar push para usuário', usuarioId, error);
    }
  }
}
