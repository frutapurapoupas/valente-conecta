// Caminho: C:\valente_conecta\app\api\fiado\habilitacao\route.ts
//
// Modulo Fiado e' opt-in por loja, liberado pelo admin master sob
// solicitacao (ver 017_fiado.sql). Esta rota cobre o lado do lojista:
// consultar status e pedir liberacao. A liberacao em si e' feita pelo
// admin master via /api/admin-master/fiado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('fiado_habilitacoes').select('*').eq('dono_id', donoId).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data: existente } = await supabase.from('fiado_habilitacoes').select('id').eq('dono_id', body.donoId).maybeSingle();
    if (existente) {
      return NextResponse.json({ success: false, error: 'Solicitação já existe para esta loja' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('fiado_habilitacoes')
      .insert({ dono_id: body.donoId, ativo: false })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar módulo' }, { status: 500 });
  }
}

// Lojista define os proprios juros/multa de atraso (0 por padrao, sem
// cobranca nenhuma) -- ver 071_fiado_juros_multa.sql.
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donoId = searchParams.get('donoId');
    if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = {};
    if (body.jurosMensalPct !== undefined) patch.juros_mensal_pct = Math.max(0, Number(body.jurosMensalPct) || 0);
    if (body.multaPct !== undefined) patch.multa_pct = Math.max(0, Number(body.multaPct) || 0);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('fiado_habilitacoes')
      .update(patch)
      .eq('dono_id', donoId)
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar configuração' }, { status: 500 });
  }
}
