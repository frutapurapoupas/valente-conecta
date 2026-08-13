// Caminho: C:\valente_conecta\app\api\admin-master\moeda-conecta\compensacoes\route.ts
//
// Admin master ve as solicitacoes de compensacao em real pro fornecedor
// (todas ou filtradas por status/cidade) e confirma o pagamento (depois de
// ja ter repassado o PIX pro fornecedor fora do sistema) ou recusa
// (devolve o saldo em Moeda Conecta pro portador do credito).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');
  const cidade = request.nextUrl.searchParams.get('cidade');

  const supabase = createClient();
  let query = supabase
    .from('compensacoes_fornecedor')
    .select('*, portador:usuarios!compensacoes_fornecedor_portador_id_fkey(nome, whatsapp)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  if (cidade) query = query.eq('cidade', cidade.trim().toUpperCase());

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const compensacaoId = String(body.compensacaoId || '').trim();
    const adminId = String(body.adminId || '').trim();
    const acao = String(body.acao || '').trim();

    if (!compensacaoId || !adminId) return NextResponse.json({ success: false, error: 'compensacaoId e adminId são obrigatórios' }, { status: 400 });
    if (!['confirmar', 'recusar'].includes(acao)) return NextResponse.json({ success: false, error: 'acao inválida' }, { status: 400 });

    const supabase = createClient();
    const rpc = acao === 'confirmar' ? 'moeda_conecta_confirmar_compensacao_v1' : 'moeda_conecta_recusar_compensacao_v1';
    const params: Record<string, any> = { p_compensacao_id: compensacaoId, p_admin_id: adminId };
    if (acao === 'recusar') params.p_motivo = String(body.motivo || '').trim() || null;

    const { data, error } = await supabase.rpc(rpc, params);
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar compensação' }, { status: 400 });
  }
}
