// Caminho: C:\valente_conecta\app\api\admin-master\moeda-conecta\creditar\route.ts
//
// Admin master emite/credita Moeda Conecta pra um usuario (ex: emissao
// inicial, bonus de campanha) sem debitar ninguem — RPC
// moeda_conecta_creditar_admin_v1, registrada como tipo 'ajuste_admin'
// pra ficar rastreavel no extrato/auditoria.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminId = String(body.adminId || '').trim();
    const destinatarioId = String(body.destinatarioId || '').trim();
    const valor = Number(body.valor);
    const descricao = String(body.descricao || '').trim() || 'Crédito administrativo';

    if (!adminId || !destinatarioId) return NextResponse.json({ success: false, error: 'adminId e destinatarioId são obrigatórios' }, { status: 400 });
    if (!Number.isFinite(valor) || valor <= 0) return NextResponse.json({ success: false, error: 'Valor inválido' }, { status: 400 });

    const supabase = createClient();
    let cidade = String(body.cidade || '').trim().toUpperCase();
    if (!cidade) {
      const { data: destinatario } = await supabase.from('usuarios').select('cidade_base').eq('id', destinatarioId).maybeSingle();
      cidade = String(destinatario?.cidade_base || '').trim().toUpperCase();
    }
    if (!cidade) return NextResponse.json({ success: false, error: 'Não foi possível determinar a cidade do usuário' }, { status: 400 });

    const { data, error } = await supabase.rpc('moeda_conecta_creditar_admin_v2', {
      p_admin_id: adminId,
      p_destinatario_id: destinatarioId,
      p_cidade: cidade,
      p_valor: valor,
      p_descricao: descricao,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao creditar' }, { status: 400 });
  }
}
