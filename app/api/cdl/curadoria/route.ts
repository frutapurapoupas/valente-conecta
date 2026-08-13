// Caminho: C:\valente_conecta\app\api\cdl\curadoria\route.ts
//
// Representante do CDL marca/desmarca "recomendado pelo CDL" em itens do
// catalogo de comercios da propria cidade (ver 034_cdl.sql,
// cdl_curadoria_ativa). Cidade do item vem de usuarios.cidade_base do dono
// (catalogo_itens nao guarda cidade direto).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function validarRepresentante(supabase: any, representanteId: string) {
  const { data: rep } = await supabase.from('cdl_representantes').select('cidade, ativo').eq('id', representanteId).maybeSingle();
  if (!rep || !rep.ativo) return null;
  const { data: config } = await supabase.from('cidades_moeda_config').select('cdl_curadoria_ativa').eq('cidade', rep.cidade).maybeSingle();
  if (!config?.cdl_curadoria_ativa) return null;
  return rep;
}

export async function GET(request: NextRequest) {
  const representanteId = request.nextUrl.searchParams.get('representanteId');
  if (!representanteId) return NextResponse.json({ success: false, error: 'representanteId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const rep = await validarRepresentante(supabase, representanteId);
  if (!rep) return NextResponse.json({ success: false, error: 'Curadoria não está liberada pra essa cidade' }, { status: 403 });

  const { data: usuariosCidade } = await supabase.from('usuarios').select('id').ilike('cidade_base', rep.cidade);
  const donoIds = (usuariosCidade || []).map((u: any) => u.id);
  if (donoIds.length === 0) return NextResponse.json({ success: true, data: [] });

  const { data: itens, error } = await supabase
    .from('catalogo_itens')
    .select('id, dono_id, modulo, categoria, titulo, midia, recomendado_cdl')
    .in('dono_id', donoIds)
    .eq('status', 'ativo')
    .order('titulo');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: itens || [] });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const representanteId = String(body.representanteId || '').trim();
    const itemId = String(body.itemId || '').trim();
    if (!representanteId || !itemId) return NextResponse.json({ success: false, error: 'representanteId e itemId são obrigatórios' }, { status: 400 });

    const supabase = createClient();
    const rep = await validarRepresentante(supabase, representanteId);
    if (!rep) return NextResponse.json({ success: false, error: 'Curadoria não está liberada pra essa cidade' }, { status: 403 });

    const { data: item } = await supabase.from('catalogo_itens').select('dono_id').eq('id', itemId).maybeSingle();
    if (!item) return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    const { data: dono } = await supabase.from('usuarios').select('cidade_base').eq('id', item.dono_id).maybeSingle();
    if (String(dono?.cidade_base || '').toUpperCase() !== rep.cidade) {
      return NextResponse.json({ success: false, error: 'Esse item não é dessa cidade' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('catalogo_itens')
      .update({ recomendado_cdl: !!body.recomendado })
      .eq('id', itemId)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 400 });
  }
}
