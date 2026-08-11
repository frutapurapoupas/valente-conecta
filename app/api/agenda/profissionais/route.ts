// Caminho: C:\valente_conecta\app\api\agenda\profissionais\route.ts
//
// Lista/cadastra profissionais (equipe) de uma loja no modulo Agenda+Fila.
// Leitura usa a view sem pin_hash; criacao passa pela RPC que hasheia o PIN.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('agenda_profissionais_publico').select('*').eq('dono_id', donoId).order('nome');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.nome?.trim() || !body.pin?.trim()) {
      return NextResponse.json({ success: false, error: 'donoId, nome e pin são obrigatórios' }, { status: 400 });
    }
    if (!/^\d{4,6}$/.test(body.pin.trim())) {
      return NextResponse.json({ success: false, error: 'PIN deve ter de 4 a 6 números' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase.rpc('criar_funcionario_agenda', {
      p_dono_id: body.donoId,
      p_nome: body.nome.trim(),
      p_especialidade: body.especialidade || null,
      p_pin: body.pin.trim(),
    });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar funcionário' }, { status: 500 });
  }
}
