// Caminho: C:\valente_conecta\app\api\admin-master\referrals\config-cidades\route.ts
//
// Admin master configura o bonus por indicacao de cada cidade
// (referral_config_cidades) — GET sem "cidade" lista as cidades com
// usuarios (pro seletor da tela); GET com "cidade" devolve as 3 regras
// (com sugestao padrao pra quem ainda nao tem nada salvo); PUT grava.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CATEGORIAS_PADRAO = [
  { categoria: 'usuarios_gerais', nome: 'Usuários Gerais', bonus: 10, meta: 30, ativo: false, descricao: 'Moeda Conecta por lote de usuários novos validados' },
  { categoria: 'empresas_lojas', nome: 'Empresas / Lojas', bonus: 5, meta: 3, ativo: false, descricao: 'Moeda Conecta por lote de empresas ou lojas validadas' },
  { categoria: 'profissionais_liberais', nome: 'Profissionais Liberais', bonus: 4, meta: 5, ativo: false, descricao: 'Moeda Conecta por lote de profissionais liberais validados' },
];

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const cidade = request.nextUrl.searchParams.get('cidade');

  if (cidade) {
    const cidadeNorm = cidade.trim().toUpperCase();
    const { data, error } = await supabase.from('referral_config_cidades').select('*').eq('cidade', cidadeNorm);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const existentes = new Map((data || []).map((r: any) => [r.categoria, r]));
    const rules = CATEGORIAS_PADRAO.map((padrao) => existentes.get(padrao.categoria) || { ...padrao, cidade: cidadeNorm });
    return NextResponse.json({ success: true, data: { cidade: cidadeNorm, rules } });
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
    const rules = Array.isArray(body.rules) ? body.rules : [];
    if (!cidade || rules.length === 0) {
      return NextResponse.json({ success: false, error: 'cidade e rules são obrigatórios' }, { status: 400 });
    }

    const linhas = rules.map((r: any) => ({
      cidade,
      categoria: r.categoria,
      nome: r.nome,
      bonus: Number(r.bonus) || 0,
      meta: Math.max(1, parseInt(r.meta, 10) || 1),
      ativo: !!r.ativo,
      descricao: r.descricao || null,
      updated_at: new Date().toISOString(),
    }));

    const supabase = createClient();
    const { data, error } = await supabase
      .from('referral_config_cidades')
      .upsert(linhas, { onConflict: 'cidade,categoria' })
      .select('*');
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
