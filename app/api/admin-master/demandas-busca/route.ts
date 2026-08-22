// Caminho: C:\valente_conecta\app\api\admin-master\demandas-busca\route.ts
// Admin master ve todas as demandas nao atendidas e marca quando alguem
// publicou o item — isso avisa por push quem fez a busca originalmente.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('demandas_busca')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const supabase = createClient();
    const patch: Record<string, any> = {};
    if (body.status) {
      patch.status = body.status;
      if (body.status === 'atendida') patch.atendido_em = new Date().toISOString();
    }
    if (body.atendidoItemId !== undefined) patch.atendido_item_id = body.atendidoItemId;

    const { data, error } = await supabase
      .from('demandas_busca')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    if (body.status === 'atendida' && data?.usuario_id) {
      await enviarPushParaUsuario(data.usuario_id, {
        titulo: 'Encontramos o que você procurava!',
        corpo: `"${data.termo}" já está disponível no Valente Conecta.`,
        url: `/busca?q=${encodeURIComponent(data.termo)}`,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}
