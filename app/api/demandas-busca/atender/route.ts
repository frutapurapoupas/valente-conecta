// Caminho: C:\valente_conecta\app\api\demandas-busca\atender\route.ts
//
// O proprio fornecedor chama isso ao publicar um item que atende uma
// demanda (ver components/catalogo/LojaAdminShell.tsx). Varios fornecedores
// podem publicar pro mesmo termo simultaneamente — so o primeiro fecha e
// avisa quem buscou (idempotente); os demais continuam publicando
// normalmente, so' nao repetem o aviso.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.demandaId || !body.itemId) {
      return NextResponse.json({ success: false, error: 'demandaId e itemId são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: demanda, error: erroDemanda } = await supabase
      .from('demandas_busca')
      .select('*')
      .eq('id', body.demandaId)
      .maybeSingle();
    if (erroDemanda) throw erroDemanda;
    if (!demanda) return NextResponse.json({ success: false, error: 'Demanda não encontrada' }, { status: 404 });

    if (demanda.status === 'atendida') {
      return NextResponse.json({ success: true, data: demanda, jaAtendida: true });
    }

    const { data, error } = await supabase
      .from('demandas_busca')
      .update({ status: 'atendida', atendido_item_id: body.itemId, atendido_em: new Date().toISOString() })
      .eq('id', body.demandaId)
      .eq('status', 'aguardando') // evita corrida entre dois fornecedores publicando ao mesmo tempo
      .select('*')
      .maybeSingle();
    if (error) throw error;

    // Se outro fornecedor venceu a corrida entre o select e o update acima,
    // 'data' vem null aqui — nao e' erro, so' nao fomos nos que fechamos.
    if (data?.usuario_id) {
      await enviarPushParaUsuario(data.usuario_id, {
        titulo: 'Encontramos o que você procurava!',
        corpo: `"${data.termo}" já está disponível no Valente Conecta.`,
        url: `/busca?q=${encodeURIComponent(data.termo)}`,
      });
    }

    return NextResponse.json({ success: true, data: data || demanda });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atender demanda' }, { status: 500 });
  }
}
