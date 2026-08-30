// Caminho: C:\valente_conecta\app\api\admin-master\catalogo-colaborativo\bonus-config\route.ts
//
// Admin master configura o bonus (em Moeda Conecta) por produto novo
// aprovado no catalogo colaborativo do PDV, por cidade
// (catalogo_colaborativo_bonus_config_cidades,
// 086_catalogo_colaborativo_bonus_moderacao.sql) — mesmo padrao de
// referrals/config-cidades, mas sem quebra por categoria (aqui e' 1 valor
// unico por cidade). GET sem "cidade" lista cidades com usuarios; GET com
// "cidade" devolve a config (zerada/inativa se ainda nao existir — nao
// inventamos valor); PUT grava.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const cidade = request.nextUrl.searchParams.get('cidade');

  if (cidade) {
    const cidadeNorm = cidade.trim().toUpperCase();
    const { data, error } = await supabase.from('catalogo_colaborativo_bonus_config_cidades').select('*').eq('cidade', cidadeNorm).maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const config = data || {
      cidade: cidadeNorm,
      bonus: 0,
      meta: 1,
      ativo: false,
      descricao: 'Moeda Conecta por lote de produtos novos aprovados no catálogo colaborativo do PDV',
    };
    return NextResponse.json({ success: true, data: config });
  }

  const { data: usuarios, error } = await supabase.from('usuarios').select('cidade_base').not('cidade_base', 'is', null);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const cidades = Array.from(new Set((usuarios || []).map((u: any) => String(u.cidade_base).trim().toUpperCase()).filter(Boolean))).sort();
  return NextResponse.json({ success: true, data: cidades });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cidade = String(body.cidade || '').trim().toUpperCase();
    if (!cidade) return NextResponse.json({ success: false, error: 'cidade é obrigatória' }, { status: 400 });

    const linha = {
      cidade,
      bonus: Number(body.bonus) || 0,
      meta: Math.max(1, parseInt(body.meta, 10) || 1),
      ativo: !!body.ativo,
      descricao: body.descricao || null,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_colaborativo_bonus_config_cidades')
      .upsert(linha, { onConflict: 'cidade' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
