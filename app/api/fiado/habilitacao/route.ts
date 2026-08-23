// Caminho: C:\valente_conecta\app\api\fiado\habilitacao\route.ts
//
// Modulo Fiado e' embarcado por padrao pra todo lojista (nao precisa mais
// de aprovacao do admin master, ver comentario em app/pdv/fiado/page.tsx).
// Essa rota so' garante que existe uma linha de configuracao por loja
// (criada automaticamente na primeira visita) e deixa o lojista ajustar
// juros/multa de atraso.

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
    const { data: existente } = await supabase.from('fiado_habilitacoes').select('*').eq('dono_id', body.donoId).maybeSingle();
    if (existente) {
      return NextResponse.json({ success: true, data: existente });
    }

    const { data, error } = await supabase
      .from('fiado_habilitacoes')
      .insert({ dono_id: body.donoId, ativo: true, liberado_em: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao provisionar módulo' }, { status: 500 });
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
