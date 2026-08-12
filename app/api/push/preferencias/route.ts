// Caminho: C:\valente_conecta\app\api\push\preferencias\route.ts
//
// Cidade + grupos de interesse do usuario, usados pelo admin master pra
// segmentar o aviso geral por push. A inscricao (push_subscriptions) ja
// precisa existir (criada em /api/push/subscribe) — aqui so' atualiza.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  // NOTA: a tabela real usa user_id (nao usuario_id) — ver nota de rodape em lib/push.ts
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('cidade, grupos_interesse')
    .eq('user_id', usuarioId)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || { cidade: null, grupos_interesse: [] } });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, cidade, gruposInteresse } = body;
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        cidade: cidade?.trim() || null,
        grupos_interesse: Array.isArray(gruposInteresse) ? gruposInteresse : [],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', usuarioId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar preferências' }, { status: 500 });
  }
}
