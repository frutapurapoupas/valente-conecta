// Caminho: C:\valente_conecta\app\api\admin-master\campanha-viral\route.ts
//
// Admin master configura a meta de população (numero de usuarios) que
// encerra a campanha de lancamento de cada cidade — GET sem "cidade" lista
// as cidades com usuarios + meta/populacao atual de cada uma (pro seletor
// da tela); GET com "cidade" devolve o status de uma cidade; PUT grava a
// meta. Ver 089_campanha_viral_populacao.sql e cadastroSimples em lib/auth.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function contarPopulacao(supabase: ReturnType<typeof createClient>, cidade: string) {
  const { count } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true })
    .ilike('cidade_base', cidade);
  return count || 0;
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const cidade = request.nextUrl.searchParams.get('cidade');

  if (cidade) {
    const cidadeNorm = cidade.trim().toUpperCase();
    const [{ data: campanha }, populacaoAtual] = await Promise.all([
      supabase.from('campanha_viral_cidades').select('*').eq('cidade', cidadeNorm).maybeSingle(),
      contarPopulacao(supabase, cidadeNorm),
    ]);
    const metaPopulacao = campanha?.meta_populacao ?? null;
    const ativa = metaPopulacao != null && populacaoAtual < metaPopulacao;
    return NextResponse.json({ success: true, data: { cidade: cidadeNorm, metaPopulacao, populacaoAtual, ativa } });
  }

  const [{ data: usuarios, error }, { data: campanhas }] = await Promise.all([
    supabase.from('usuarios').select('cidade_base').not('cidade_base', 'is', null),
    supabase.from('campanha_viral_cidades').select('*'),
  ]);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const cidades = Array.from(new Set((usuarios || []).map((u: any) => String(u.cidade_base).trim().toUpperCase()).filter(Boolean))).sort();
  const metasPorCidade = new Map((campanhas || []).map((c: any) => [c.cidade, c.meta_populacao]));

  const populacoes = await Promise.all(cidades.map((c) => contarPopulacao(supabase, c)));

  const data = cidades.map((cidade, i) => {
    const metaPopulacao = metasPorCidade.get(cidade) ?? null;
    const populacaoAtual = populacoes[i];
    return { cidade, metaPopulacao, populacaoAtual, ativa: metaPopulacao != null && populacaoAtual < metaPopulacao };
  });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cidade = String(body.cidade || '').trim().toUpperCase();
    const metaPopulacao = parseInt(body.metaPopulacao, 10);
    if (!cidade || !metaPopulacao || metaPopulacao <= 0) {
      return NextResponse.json({ success: false, error: 'cidade e metaPopulacao (> 0) são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('campanha_viral_cidades')
      .upsert({ cidade, meta_populacao: metaPopulacao, updated_at: new Date().toISOString() }, { onConflict: 'cidade' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
