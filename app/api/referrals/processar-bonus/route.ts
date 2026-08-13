// Caminho: C:\valente_conecta\app\api\referrals\processar-bonus\route.ts
//
// Chamado pela tela de indicacoes (/qr-code) a cada carregamento — roda a
// RPC referral_processar_bonus_v1, que credita em Moeda Conecta qualquer
// lote de indicacao completado e ainda nao pago. Idempotente: se nao tem
// lote novo, devolve lista vazia sem duplicar credito nenhum.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase.rpc('referral_processar_bonus_v2', { p_usuario_id: usuarioId });
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar bônus' }, { status: 500 });
  }
}
