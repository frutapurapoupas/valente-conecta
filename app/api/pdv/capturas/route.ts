// Caminho: C:\valente_conecta\app\api\pdv\capturas\route.ts
//
// Fila de capturas do "modo espião" (foto da tela do PDV de terceiro +
// dado preenchido pelo comerciante). GET lista as capturas do
// comerciante; POST cria uma nova (status 'pendente'); PUT muda o status
// (aplicada — depois que o cliente já criou o produto/lançamento real
// via /api/pdv/catalogo, /api/pdv/estoque ou /api/pdv/caixa — ou
// descartada); DELETE remove.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_capturas_externas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.tipo || !body.fotoUrl) {
      return NextResponse.json({ success: false, error: 'usuarioId, tipo e fotoUrl são obrigatórios' }, { status: 400 });
    }
    if (!['produto', 'venda'].includes(body.tipo)) {
      return NextResponse.json({ success: false, error: 'tipo inválido' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('pdv_capturas_externas')
      .insert({ usuario_id: body.usuarioId, tipo: body.tipo, foto_url: body.fotoUrl, dados: body.dados || {} })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar captura' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = {};
    if (body.dados !== undefined) patch.dados = body.dados;
    if (body.status !== undefined) {
      if (!['pendente', 'aplicado', 'descartado'].includes(body.status)) {
        return NextResponse.json({ success: false, error: 'status inválido' }, { status: 400 });
      }
      patch.status = body.status;
      patch.aplicado_em = body.status === 'aplicado' ? new Date().toISOString() : null;
      if (body.referenciaId !== undefined) patch.referencia_id = body.referenciaId;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('pdv_capturas_externas').update(patch).eq('id', id).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar captura' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('pdv_capturas_externas').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
