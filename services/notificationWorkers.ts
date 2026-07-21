// ============================================================================
// ARQUIVO 9: services/notificationWorkers.ts
// Funcionalidade: Workers para envio de Telegram e Push
// ============================================================================

interface JobData {
  id: string;
  titulo: string;
  mensagem: string;
  enviar_telegram: boolean;
  enviar_push: boolean;
  para_grupo?: string;
  para_usuario_id?: string;
  link_url?: string;
  modo_teste: boolean;
}

// ============================================================================
// WORKER: Envio via Telegram
// ============================================================================
export async function enviarTelegramJob(data: JobData): Promise<boolean> {
  try {
    let chatId = '@valenteconecta';
    
    if (data.modo_teste) {
      chatId = '@valenteconecta_teste';
    } else if (data.para_grupo && data.para_grupo !== 'todos') {
      const grupoMap: Record<string, string> = {
        'premium': '@valenteconecta_premium',
        'academia': '@valenteconecta_academia',
        'mototaxi': '@valenteconecta_mototaxi',
        'comercio': '@valenteconecta_comercio',
        'profissionais': '@valenteconecta_profissionais'
      };
      chatId = grupoMap[data.para_grupo] || '@valenteconecta';
    }
    
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7596732182:AAH_oZ3cQ_v8lRKWCLU2_5MOM2j_7hxvPKA';
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const mensagem = data.modo_teste
      ? `🧪 *MODO TESTE* - Esta notificação não foi enviada para todos\n\n📢 *${data.titulo}*\n\n${data.mensagem}\n\n🔗 Acesse o app: valenteconecta.clic.com.br`
      : `📢 *${data.titulo}*\n\n${data.mensagem}\n\n🔗 Acesse o app: valenteconecta.clic.com.br`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensagem,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Erro no worker Telegram para ${data.id}:`, error);
    return false;
  }
}

// ============================================================================
// WORKER: Envio via Push Notification (VAPID)
// ============================================================================
export async function enviarPushJob(data: JobData): Promise<boolean> {
  try {
    // Para 100k+ usuários, você precisaria buscar as subscriptions do banco
    // e enviar em lotes. Este é um exemplo simplificado.
    
    // Buscar subscriptions ativas do Supabase
    const { supabase } = await import('@/lib/supabase');
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('ativo', true);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('Nenhuma subscription de push encontrada');
      return false;
    }
    
    // Processar em lotes para não sobrecarregar
    const BATCH_SIZE = 100;
    const batches = [];
    
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      batches.push(subscriptions.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Enviando push para ${subscriptions.length} usuários em ${batches.length} lotes`);
    
    // Usar web-push para enviar
    const webpush = require('web-push');
    
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
    
    webpush.setVapidDetails(
      'mailto:suporte@valenteconecta.com.br',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    
    let successCount = 0;
    let failCount = 0;
    
    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (sub: any) => {
          try {
            await webpush.sendNotification(
              sub.subscription,
              JSON.stringify({
                title: data.titulo,
                body: data.mensagem,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                data: { url: data.link_url || '/' }
              })
            );
            successCount++;
          } catch (error: any) {
            failCount++;
            // Se subscription expirou (410), marcar como inativa
            if (error.statusCode === 410) {
              await supabase
                .from('push_subscriptions')
                .update({ ativo: false })
                .eq('subscription', sub.subscription);
            }
          }
        })
      );
    }
    
    console.log(`Push completado: ${successCount} sucessos, ${failCount} falhas`);
    return successCount > 0;
    
  } catch (error) {
    console.error(`Erro no worker Push para ${data.id}:`, error);
    return false;
  }
}


