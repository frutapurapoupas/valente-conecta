// Caminho: C:\valente_conecta\app\api\construcao\agenda\dias\route.ts
//
// Dias ocupados na agenda de 60 dias de um prestador de construcao civil
// (ver migration 047_construcao_agenda.sql). GET e publico (o usuario
// precisa ver quais dias estao livres antes de solicitar). POST/DELETE
// so' devem ser chamados pelo proprio dono (checagem de aplicacao, mesmo
// padrao "sem login real" do resto do projeto).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const donoId = request.nextUrl.searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const hoje = new Date().toISOString().slice(0, 10);
  const supabase = createClient();
  const { data, error } = await supabase
    .from('construcao_agenda_dias')
    .select('data')
    .eq('dono_id', donoId)
    .gte('data', hoje)
    .order('data', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: (data || []).map((d) => d.data) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.data) return NextResponse.json({ success: false, error: 'donoId e data são obrigatórios' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('construcao_agenda_dias').upsert(
      { dono_id: body.donoId, data: body.data },
      { onConflict: 'dono_id,data', ignoreDuplicates: true }
    );
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao marcar dia' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const donoId = request.nextUrl.searchParams.get('donoId');
  const data = request.nextUrl.searchParams.get('data');
  if (!donoId || !data) return NextResponse.json({ success: false, error: 'donoId e data são obrigatórios' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('construcao_agenda_dias').delete().eq('dono_id', donoId).eq('data', data);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
