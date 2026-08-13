// Caminho: C:\valente_conecta\app\api\admin-master\cdl\representantes\route.ts
//
// Admin master cadastra/lista representantes do CDL por cidade. Login do
// representante fica em /api/cdl/login (PIN, mesmo padrao do funcionario
// da Agenda).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cidade = request.nextUrl.searchParams.get('cidade');
  const supabase = createClient();
  let query = supabase.from('cdl_representantes').select('id, cidade, nome, whatsapp, ativo, created_at').order('created_at', { ascending: false });
  if (cidade) query = query.eq('cidade', cidade.toUpperCase());
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cidade = String(body.cidade || '').trim();
    const nome = String(body.nome || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const pin = String(body.pin || '').trim();

    if (!cidade || !nome || !pin) return NextResponse.json({ success: false, error: 'cidade, nome e pin são obrigatórios' }, { status: 400 });
    if (pin.length < 4) return NextResponse.json({ success: false, error: 'PIN precisa ter pelo menos 4 dígitos' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase.rpc('criar_representante_cdl', {
      p_cidade: cidade,
      p_nome: nome,
      p_whatsapp: whatsapp || null,
      p_pin: pin,
    });
    if (error) throw error;

    return NextResponse.json({ success: true, data: data?.[0] || data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar representante' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.id || '').trim();
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('cdl_representantes')
      .update({ ativo: !!body.ativo })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 400 });
  }
}
