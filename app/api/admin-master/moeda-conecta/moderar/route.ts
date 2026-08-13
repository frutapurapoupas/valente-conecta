// Caminho: C:\valente_conecta\app\api\admin-master\moeda-conecta\moderar\route.ts
//
// Admin master aprova (transferencia entre cidades presa em
// 'pendente_moderacao') ou estorna (concluida ou pendente) uma transacao
// da Moeda Conecta.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transacaoId = String(body.transacaoId || '').trim();
    const adminId = String(body.adminId || '').trim();
    const acao = body.acao;

    if (!transacaoId || !adminId) return NextResponse.json({ success: false, error: 'transacaoId e adminId são obrigatórios' }, { status: 400 });
    if (!['aprovar', 'estornar'].includes(acao)) return NextResponse.json({ success: false, error: 'ação inválida' }, { status: 400 });

    const supabase = createClient();
    const rpc = acao === 'aprovar' ? 'moeda_conecta_aprovar_transferencia_v1' : 'moeda_conecta_estornar_v1';
    const params: Record<string, any> =
      acao === 'aprovar'
        ? { p_transacao_id: transacaoId, p_admin_id: adminId }
        : { p_transacao_id: transacaoId, p_admin_id: adminId, p_motivo: body.motivo || null };

    const { data, error } = await supabase.rpc(rpc, params);
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao moderar transação' }, { status: 400 });
  }
}
