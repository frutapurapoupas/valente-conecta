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
 * Envia uma push notification pra TODO MUNDO com inscricao salva em
 * push_subscriptions — usado pelo aviso geral do admin master (ver
 * app/admin-master/configuracoes/aviso-geral/page.tsx). Roda em paralelo e
 * poda inscricoes mortas (410/404) do mesmo jeito que as funcoes de
 * usuario unico, mas nunca deixa uma falha individual derrubar o disparo
 * inteiro.
 */
export async function enviarPushParaTodos(
  payload: { titulo: string; corpo: string; url?: string },
  filtros?: { cidades?: string[]; grupos?: string[] }
): Promise<{ enviados: number; total: number }> {
  if (!vapidPublicKey || !vapidPrivateKey) return { enviados: 0, total: 0 };

  const supabase = createClient();
  // NOTA: a tabela real usa user_id (nao usuario_id) — descoberto em 2026-08-12,
  // ver nota de rodape no fim do arquivo.
  let query = supabase.from('push_subscriptions').select('user_id, subscription');
  if (filtros?.cidades?.length) query = query.in('cidade', filtros.cidades);
  if (filtros?.grupos?.length) query = query.overlaps('grupos_interesse', filtros.grupos);
  const { data: inscricoes, error: erroConsulta } = await query;
  if (erroConsulta) return { enviados: 0, total: 0 };
  const lista = inscricoes || [];

  const resultados = await Promise.allSettled(
    lista.map(async (registro: any) => {
      try {
        await webpush.sendNotification(
          registro.subscription,
          JSON.stringify({
            title: payload.titulo,
            body: payload.corpo,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: { url: payload.url || '/' },
          })
        );
        return true;
      } catch (error: any) {
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          try {
            await supabase.from('push_subscriptions').delete().eq('user_id', registro.user_id);
          } catch {
            // segue sem quebrar o loop
          }
        }
        return false;
      }
    })
  );

  const enviados = resultados.filter((r) => r.status === 'fulfilled' && r.value === true).length;
  return { enviados, total: lista.length };
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
      .eq('user_id', usuarioId)
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
        await supabase.from('push_subscriptions').delete().eq('user_id', usuarioId);
      } catch {
        // segue sem quebrar o fluxo principal
      }
    } else {
      console.error('Erro ao enviar push para usuário', usuarioId, error);
    }
  }
}

// NOTA (2026-08-12): a tabela push_subscriptions em producao usa as colunas
// user_id/user_email/active (nao usuario_id/ativo, como a migracao
// 009_push_subscriptions.sql e o resto do codigo antigo assumiam). Ate essa
// data, TODO envio de push falhava silenciosamente por erro de coluna
// inexistente — nunca chegou a sair um push de verdade. Corrigido aqui e em
// app/api/push/subscribe/route.ts e app/api/push/preferencias/route.ts pra
// usar user_id, que e' o nome real. services/notificationWorkers.ts
// (sistema de fila separado, usado por app/api/notificacoes/enqueue) tem o
// mesmo problema com a coluna 'ativo' e ainda NAO foi corrigido.
