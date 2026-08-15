// Caminho: C:\valente_conecta\app\api\pdv\notas-fiscais\route.ts
//
// Livro de controle MANUAL de notas fiscais (ver migration
// 045_base_fiscal_pdv.sql) — nao emite nada de verdade, so' deixa o
// comerciante registrar o que ja emitiu (por fora, ex: portal do MEI) ou
// o que ainda precisa emitir, enquanto a automacao real nao existe.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_notas_fiscais')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.valor) {
      return NextResponse.json({ success: false, error: 'usuarioId e valor são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('pdv_notas_fiscais')
      .insert({
        usuario_id: body.usuarioId,
        lancamento_id: body.lancamentoId || null,
        tipo: body.tipo || 'nfce',
        numero: body.numero || null,
        serie: body.serie || null,
        valor: Number(body.valor),
        status: body.status || 'pendente',
        emitida_em: body.status === 'emitida' ? new Date().toISOString() : null,
        observacoes: body.observacoes || null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar nota' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) {
      patch.status = body.status;
      patch.emitida_em = body.status === 'emitida' ? new Date().toISOString() : null;
    }
    if (body.numero !== undefined) patch.numero = body.numero;
    if (body.serie !== undefined) patch.serie = body.serie;
    if (body.observacoes !== undefined) patch.observacoes = body.observacoes;

    const supabase = createClient();
    const { data, error } = await supabase.from('pdv_notas_fiscais').update(patch).eq('id', id).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar nota' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('pdv_notas_fiscais').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
