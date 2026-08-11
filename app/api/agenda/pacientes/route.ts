// Caminho: C:\valente_conecta\app\api\agenda\pacientes\route.ts
//
// Cadastro presencial de pacientes (recepcao da clinica/hospital) — usado
// pela loja pra liberar quem pode entrar na fila virtualmente quando
// agenda_habilitacoes.exige_cadastro_previo esta ligado (ver 020_agenda_clinica.sql).
// GET com telefone verifica um paciente especifico (usado pela tela do
// cliente antes de entrar na fila); GET sem telefone lista todos (painel
// da equipe).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  const telefone = searchParams.get('telefone');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();

  if (telefone) {
    const { data, error } = await supabase
      .from('agenda_pacientes')
      .select('*')
      .eq('dono_id', donoId)
      .eq('telefone', telefone.trim())
      .maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data || null });
  }

  const { data, error } = await supabase
    .from('agenda_pacientes')
    .select('*')
    .eq('dono_id', donoId)
    .order('cadastrado_em', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.nome?.trim() || !body.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'donoId, nome e telefone são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('agenda_pacientes')
      .upsert(
        {
          dono_id: body.donoId,
          nome: body.nome.trim(),
          telefone: body.telefone.trim(),
          observacao: body.observacao || null,
        },
        { onConflict: 'dono_id,telefone' }
      )
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar paciente' }, { status: 500 });
  }
}
