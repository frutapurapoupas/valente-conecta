// Caminho: C:\valente_conecta\app\api\pdv\localizacao\route.ts
//
// Salva a localização (lat/long) da loja em perfis_fornecedor — mesma
// tabela já usada pelos outros módulos do marketplace (003_marketplace_interesse.sql,
// 045_base_fiscal_pdv.sql) — em vez de criar uma coluna paralela só pro PDV.
// Chamado uma vez, no primeiro acesso ao PDV (lib/pdv/solicitarLocalizacao.ts).
// Preserva qualquer perfil de fornecedor já existente (outro módulo pode já
// ter cadastrado nome/telefone/horário) — só sobrescreve latitude/longitude.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ success: false, error: 'latitude/longitude inválidas' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: perfisExistentes } = await supabase.rpc('meu_perfil_fornecedor', { p_usuario_id: usuarioId });
    const perfil = perfisExistentes?.[0] || null;

    let nomeExibicao = perfil?.nome_exibicao;
    let telefone = perfil?.telefone;
    if (!nomeExibicao || !telefone) {
      const { data: usuario } = await supabase.from('usuarios').select('nome, whatsapp').eq('id', usuarioId).maybeSingle();
      nomeExibicao = nomeExibicao || usuario?.nome || 'Loja';
      telefone = telefone || usuario?.whatsapp || '';
    }

    const { data, error } = await supabase.rpc('salvar_perfil_fornecedor_v3', {
      p_usuario_id: usuarioId,
      p_nome_exibicao: nomeExibicao,
      p_telefone: telefone,
      p_whatsapp: perfil?.whatsapp ?? telefone,
      p_endereco: perfil?.endereco ?? null,
      p_latitude: latitude,
      p_longitude: longitude,
      p_plano: perfil?.plano ?? 'gratis',
      p_horarios: perfil?.horarios ?? null,
      p_cnpj_cpf: perfil?.cnpj_cpf ?? null,
      p_inscricao_estadual: perfil?.inscricao_estadual ?? null,
      p_regime_tributario: perfil?.regime_tributario ?? null,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar localização' }, { status: 500 });
  }
}
