// Caminho: C:\valente_conecta\app\api\moeda-conecta\transactions\route.ts
//
// Historico de transacoes da Moeda Conecta — le da tabela real
// (moeda_conecta_transacoes), nao mais do arquivo JSON (que nao sobrevive
// ao runtime serverless da Vercel). Pra criar uma transacao nova, ver
// /api/moeda-conecta/transferir (essa rota so' le).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const cidadeBase = String(searchParams.get('cidadeBase') || '').trim().toUpperCase();
    const status = searchParams.get('status');
    const limit = Math.max(1, Math.min(Number(searchParams.get('limit') || 200), 1000));

    const supabase = createClient();
    let query = supabase
      .from('moeda_conecta_transacoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cidadeBase) query = query.or(`cidade.eq.${cidadeBase},cidade_destino.eq.${cidadeBase}`);
    if (userId) query = query.or(`remetente_id.eq.${userId},destinatario_id.eq.${userId}`);
    if (status) query = query.eq('status', status);

    const { data: transacoes, error } = await query;
    if (error) throw error;

    const ids = Array.from(new Set((transacoes || []).flatMap((t) => [t.remetente_id, t.destinatario_id])));
    const { data: usuarios } = ids.length ? await supabase.from('usuarios').select('id, nome').in('id', ids) : { data: [] as any[] };
    const nomePorId = new Map((usuarios || []).map((u: any) => [u.id, u.nome]));

    const data = (transacoes || []).map((t: any) => ({
      ...t,
      remetente_nome: nomePorId.get(t.remetente_id) || 'Usuário',
      destinatario_nome: nomePorId.get(t.destinatario_id) || 'Usuário',
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao carregar transações' }, { status: 500 });
  }
}
