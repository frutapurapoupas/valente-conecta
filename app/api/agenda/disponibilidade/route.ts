// Caminho: C:\valente_conecta\app\api\agenda\disponibilidade\route.ts
// Horarios semanais recorrentes de um profissional.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profissionalId = searchParams.get('profissionalId');
  if (!profissionalId) return NextResponse.json({ success: false, error: 'profissionalId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('agenda_disponibilidade')
    .select('*')
    .eq('profissional_id', profissionalId)
    .order('dia_semana');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.profissionalId || body.diaSemana === undefined || !body.horaInicio || !body.horaFim) {
      return NextResponse.json({ success: false, error: 'profissionalId, diaSemana, horaInicio e horaFim são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('agenda_disponibilidade')
      .insert({
        profissional_id: body.profissionalId,
        dia_semana: body.diaSemana,
        hora_inicio: body.horaInicio,
        hora_fim: body.horaFim,
        duracao_minutos: body.duracaoMinutos || 30,
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar horário' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
  const supabase = createClient();
  const { error } = await supabase.from('agenda_disponibilidade').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
