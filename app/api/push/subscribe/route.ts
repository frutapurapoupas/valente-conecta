// Caminho: C:\valente_conecta\app\api\push\subscribe\route.ts
// Salva a inscricao de push notification de um usuario (push_subscriptions).
// Consumido por services/notificacaoService.ts -> salvarPushSubscription.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, subscription } = body;
    if (!usuario_id || !subscription) {
      return NextResponse.json({ success: false, error: 'usuario_id e subscription são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();
    // NOTA: a tabela real usa user_id (nao usuario_id) — ver nota de rodape em lib/push.ts
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ user_id: usuario_id, subscription, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar inscrição de push:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar inscrição' }, { status: 500 });
  }
}
