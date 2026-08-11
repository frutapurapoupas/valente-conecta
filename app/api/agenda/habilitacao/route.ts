// Caminho: C:\valente_conecta\app\api\agenda\habilitacao\route.ts
// Modulo Agenda+Fila e' opt-in por loja, liberado pelo admin master.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('agenda_habilitacoes').select('*').eq('dono_id', donoId).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data: existente } = await supabase.from('agenda_habilitacoes').select('id').eq('dono_id', body.donoId).maybeSingle();
    if (existente) return NextResponse.json({ success: false, error: 'Solicitação já existe para esta loja' }, { status: 409 });

    const { data, error } = await supabase.from('agenda_habilitacoes').insert({ dono_id: body.donoId, ativo: false }).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar módulo' }, { status: 500 });
  }
}
