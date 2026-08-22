// Caminho: C:\valente_conecta\app\api\admin-master\moeda-conecta\cidades-config\route.ts
//
// Admin master ve todas as cidades que ja tem gente cadastrada (usuarios.cidade_base
// distintas) cruzadas com a configuracao de nome/prefixo da moeda —
// cidades sem configuracao aparecem com a sugestao automatica, prontas pra
// aprovar. PUT cria/edita/aprova.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sugerirMoedaCidade } from '@/lib/moedaCidade';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const [{ data: usuarios }, { data: configs }] = await Promise.all([
    supabase.from('usuarios').select('cidade_base').not('cidade_base', 'is', null),
    supabase.from('cidades_moeda_config').select('*'),
  ]);

  const cidadesUsuarios = new Set((usuarios || []).map((u: any) => String(u.cidade_base).trim().toUpperCase()).filter(Boolean));
  const configPorCidade = new Map((configs || []).map((c: any) => [c.cidade, c]));

  for (const c of configPorCidade.keys()) cidadesUsuarios.add(c);

  const data = Array.from(cidadesUsuarios)
    .sort()
    .map((cidade) => {
      const existente = configPorCidade.get(cidade);
      if (existente) return existente;
      const sugestao = sugerirMoedaCidade(cidade);
      return { cidade, moeda_nome: sugestao.moedaNome, moeda_prefixo: sugestao.moedaPrefixo, aprovado: false, sugestao: true };
    });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const cidade = String(body.cidade || '').trim().toUpperCase();
    const moedaNome = String(body.moedaNome || '').trim();
    const moedaPrefixo = String(body.moedaPrefixo || '').trim().toUpperCase();
    const adminId = String(body.adminId || '').trim();

    if (!cidade || !moedaNome || !moedaPrefixo) {
      return NextResponse.json({ success: false, error: 'cidade, moedaNome e moedaPrefixo são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const patch: Record<string, any> = {
      cidade,
      moeda_nome: moedaNome,
      moeda_prefixo: moedaPrefixo,
      aprovado: true,
      aprovado_por: adminId || null,
      aprovado_em: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (body.cdlSeloAtivo !== undefined) patch.cdl_selo_ativo = !!body.cdlSeloAtivo;
    if (body.cdlCuradoriaAtiva !== undefined) patch.cdl_curadoria_ativa = !!body.cdlCuradoriaAtiva;
    if (body.cdlRelatoriosAtivo !== undefined) patch.cdl_relatorios_ativo = !!body.cdlRelatoriosAtivo;

    const { data, error } = await supabase
      .from('cidades_moeda_config')
      .upsert(patch, { onConflict: 'cidade' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
