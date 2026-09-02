// Caminho: C:\valente_conecta\app\api\admin-master\validacao-motorista\route.ts
//
// Admin master revisa motoristas de Moto-Táxi e Carona Solidária (ver
// 097_validacao_motorista.sql) -- aprovar libera o selo "Validado pelo
// Valente Conecta" no catálogo público. Diferente do fluxo de lojista
// (validacao-proprietario), as fotos aqui já são URL pública (bucket
// "catalogo" via MidiaUploader no cadastro do motorista) -- sem precisar
// de signed URL. Uma rota só, parametrizada por `tipo`, pros dois módulos
// (mesma estrutura de colunas nas duas tabelas).

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const TABELA_POR_TIPO: Record<string, string> = {
  mototaxi: 'mototaxi_motoristas',
  carona: 'carona_motoristas',
};

export async function GET(request: NextRequest) {
  const tipo = request.nextUrl.searchParams.get('tipo') || '';
  const status = request.nextUrl.searchParams.get('status') || 'pendente';
  const tabela = TABELA_POR_TIPO[tipo];
  if (!tabela) return NextResponse.json({ success: false, error: 'tipo deve ser "mototaxi" ou "carona"' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(tabela)
    .select('*')
    .eq('validacao_status', status)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function PUT(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo') || '';
    const id = request.nextUrl.searchParams.get('id');
    const tabela = TABELA_POR_TIPO[tipo];
    if (!tabela) return NextResponse.json({ success: false, error: 'tipo deve ser "mototaxi" ou "carona"' }, { status: 400 });
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

    const body = await request.json();
    const acao = body?.acao; // 'aprovar' | 'recusar'
    const adminId = body?.adminId;
    if (!adminId) return NextResponse.json({ success: false, error: 'adminId é obrigatório' }, { status: 400 });

    const supabase = createAdminClient();

    if (acao === 'aprovar') {
      const { data, error } = await supabase
        .from(tabela)
        .update({ validacao_status: 'aprovado', validado_por: adminId, validado_em: new Date().toISOString(), validacao_motivo_recusa: null })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (acao === 'recusar') {
      const { data, error } = await supabase
        .from(tabela)
        .update({ validacao_status: 'recusado', validado_por: adminId, validado_em: new Date().toISOString(), validacao_motivo_recusa: body.motivo || null })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar validação' }, { status: 500 });
  }
}
