// Caminho: C:\valente_conecta\app\api\admin-master\indicacao-estabelecimento\route.ts
//
// Admin master revisa indicações de estabelecimento/fornecedor feitas por
// usuários comuns (ver 100_indicacao_estabelecimento_fornecedor.sql).
// Aprovar/recusar é feito num passo só via RPC (status + bônus em Moeda
// Conecta processado atomicamente), mesmo padrão de
// /api/admin-master/pdv-catalogo-moderacao.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'pendente';
  const supabase = createClient();

  const { data, error } = await supabase
    .from('indicacoes_estabelecimento')
    .select('*, usuarios!indicacoes_estabelecimento_usuario_id_fkey(nome, whatsapp)')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const acao = body?.acao; // 'aprovar' | 'recusar'
    const adminId = body?.adminId;
    if (!adminId) return NextResponse.json({ success: false, error: 'adminId é obrigatório' }, { status: 400 });

    const supabase = createClient();

    if (acao === 'aprovar') {
      const { data, error } = await supabase.rpc('indicacao_estabelecimento_aprovar_v1', { p_id: id, p_admin_id: adminId });
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    if (acao === 'recusar') {
      const { data, error } = await supabase.rpc('indicacao_estabelecimento_recusar_v1', {
        p_id: id,
        p_admin_id: adminId,
        p_motivo: body.motivo || null,
      });
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar indicação' }, { status: 500 });
  }
}
