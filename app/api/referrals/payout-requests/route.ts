// Caminho: C:\valente_conecta\app\api\referrals\payout-requests\route.ts
//
// Reescrita sobre Supabase (indicacao_payout_requests, ver
// 015_referrals_payout.sql) — antes gravava em
// data/referral_payout_requests.json. Mesmo formato de campos (camelCase)
// consumido por app/qr-code/page.tsx.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function paraApi(item: any) {
  return {
    id: item.id,
    userId: item.usuario_id,
    userName: item.usuario_nome || 'Usuário',
    userWhatsapp: item.usuario_whatsapp || '',
    pixKey: item.pix_key,
    amount: Number(item.valor || 0),
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const supabase = createClient();
    let query = supabase.from('indicacao_payout_requests').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('usuario_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []).map(paraApi) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao carregar solicitações PIX' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('indicacao_payout_requests')
      .insert({
        usuario_id: body.userId,
        usuario_nome: body.userName || 'Usuário',
        usuario_whatsapp: body.userWhatsapp || '',
        pix_key: body.pixKey,
        valor: Number(body.amount || 0),
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: paraApi(data) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar solicitação PIX' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
    const body = await request.json();
    const supabase = createClient();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) patch.status = body.status;

    const { data, error } = await supabase.from('indicacao_payout_requests').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: paraApi(data) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar solicitação PIX' }, { status: 500 });
  }
}
