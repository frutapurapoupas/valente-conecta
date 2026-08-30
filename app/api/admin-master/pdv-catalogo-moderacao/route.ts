// Caminho: C:\valente_conecta\app\api\admin-master\pdv-catalogo-moderacao\route.ts
//
// Admin master revisa comprovantes (foto do codigo de barras) de produtos
// novos do catalogo colaborativo do PDV
// (086_catalogo_colaborativo_bonus_moderacao.sql) — aprovar libera o bonus
// em Moeda Conecta (via RPC, que ja cuida do lote/idempotencia), recusar so'
// marca o motivo. A foto fica num bucket PRIVADO (catalogo-comprovantes),
// entao GET gera uma signed URL por item (5 min) com createAdminClient() —
// primeiro uso de signed URL no projeto.

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'pendente';
  const supabase = createClient();

  const { data: itens, error } = await supabase
    .from('pdv_catalogo_colaborativo_moderacao')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const admin = createAdminClient();
  const comSignedUrl = await Promise.all(
    (itens || []).map(async (item: any) => {
      const { data } = await admin.storage.from('catalogo-comprovantes').createSignedUrl(item.foto_codigo_barras_path, 300);
      return { ...item, foto_codigo_barras_signed_url: data?.signedUrl || null };
    })
  );

  return NextResponse.json({ success: true, data: comSignedUrl });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const acao = body?.acao; // 'aprovar' | 'recusar'
    const adminId = body?.adminId;
    if (!adminId) return NextResponse.json({ success: false, error: 'adminId é obrigatório' }, { status: 400 });

    const supabase = createClient();

    if (acao === 'aprovar') {
      const { data, error } = await supabase.rpc('catalogo_colaborativo_aprovar_moderacao_v1', { p_moderacao_id: id, p_admin_id: adminId });
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    if (acao === 'recusar') {
      const { data, error } = await supabase.rpc('catalogo_colaborativo_recusar_moderacao_v1', {
        p_moderacao_id: id,
        p_admin_id: adminId,
        p_motivo: body.motivo || null,
      });
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar item' }, { status: 500 });
  }
}
