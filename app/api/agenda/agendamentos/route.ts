// Caminho: C:\valente_conecta\app\api\agenda\agendamentos\route.ts
//
// Entrar na fila / agendar horario, listar (com posicao calculada) e mudar
// status (chamar, atender, cancelar). A "posicao na fila" e' calculada aqui,
// nao guardada — sempre reflete quem ainda esta' 'aguardando' na frente,
// pra nunca dessincronizar depois de um cancelamento por exemplo.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profissionalId = searchParams.get('profissionalId');
  const donoId = searchParams.get('donoId');
  const data = searchParams.get('data') || new Date().toISOString().slice(0, 10);
  const id = searchParams.get('id');

  const supabase = createClient();

  if (id) {
    const { data: item, error } = await supabase.from('agenda_agendamentos').select('*').eq('id', id).maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!item) return NextResponse.json({ success: false, error: 'Não encontrado' }, { status: 404 });
    const posicao = await calcularPosicao(supabase, item);
    return NextResponse.json({ success: true, data: { ...item, posicaoFila: posicao } });
  }

  if (!profissionalId && !donoId) {
    return NextResponse.json({ success: false, error: 'profissionalId ou donoId é obrigatório' }, { status: 400 });
  }

  let query = supabase.from('agenda_agendamentos').select('*').eq('data', data).order('created_at');
  if (profissionalId) query = query.eq('profissional_id', profissionalId);
  if (donoId) query = query.eq('dono_id', donoId);
  const { data: itens, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // calcula posicao dentro de cada profissional, na ordem em que entraram
  const contadorPorProf: Record<string, number> = {};
  const comPosicao = (itens || []).map((item) => {
    if (item.status !== 'aguardando') return { ...item, posicaoFila: null };
    contadorPorProf[item.profissional_id] = (contadorPorProf[item.profissional_id] || 0) + 1;
    return { ...item, posicaoFila: contadorPorProf[item.profissional_id] };
  });

  return NextResponse.json({ success: true, data: comPosicao });
}

async function calcularPosicao(supabase: any, item: any) {
  if (item.status !== 'aguardando') return null;
  const { count } = await supabase
    .from('agenda_agendamentos')
    .select('id', { count: 'exact', head: true })
    .eq('profissional_id', item.profissional_id)
    .eq('data', item.data)
    .eq('status', 'aguardando')
    .lte('created_at', item.created_at);
  return count || 1;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.profissionalId || !body.clienteNome?.trim() || !body.clienteTelefone?.trim()) {
      return NextResponse.json({ success: false, error: 'donoId, profissionalId, clienteNome e clienteTelefone são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();
    const data = body.data || new Date().toISOString().slice(0, 10);

    // Lojas de saude podem exigir que o paciente ja tenha sido cadastrado
    // presencialmente na recepcao antes de entrar na fila virtualmente
    // (ver 020_agenda_clinica.sql).
    const { data: habilitacao } = await supabase
      .from('agenda_habilitacoes')
      .select('exige_cadastro_previo')
      .eq('dono_id', body.donoId)
      .maybeSingle();

    if (habilitacao?.exige_cadastro_previo) {
      const { data: paciente } = await supabase
        .from('agenda_pacientes')
        .select('id')
        .eq('dono_id', body.donoId)
        .eq('telefone', body.clienteTelefone.trim())
        .maybeSingle();
      if (!paciente) {
        return NextResponse.json(
          { success: false, error: 'Este estabelecimento exige cadastro presencial antes do agendamento virtual. Procure a recepção para se cadastrar.' },
          { status: 403 }
        );
      }
    }

    const { data: senha, error: erroSenha } = await supabase.rpc('proxima_senha_fila', {
      p_profissional_id: body.profissionalId,
      p_data: data,
    });
    if (erroSenha) throw erroSenha;

    const { data: agendamento, error } = await supabase
      .from('agenda_agendamentos')
      .insert({
        dono_id: body.donoId,
        profissional_id: body.profissionalId,
        cliente_id: body.clienteId || null,
        cliente_nome: body.clienteNome.trim(),
        cliente_telefone: body.clienteTelefone.trim(),
        servico: body.servico || null,
        data,
        horario: body.horario || null,
        senha_fila: senha,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: agendamento });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao entrar na fila' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const supabase = createClient();
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status) patch.status = body.status;

    const { data, error } = await supabase
      .from('agenda_agendamentos')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    // Avisa o cliente por push: automatico quando chega a vez dele, ou uma
    // mensagem livre que a equipe quiser mandar (ex: "traga um documento").
    if (data?.cliente_id) {
      if (body.status === 'chamado') {
        await enviarPushParaUsuario(data.cliente_id, {
          titulo: 'É a sua vez!',
          corpo: `Senha ${data.senha_fila} — dirija-se ao atendimento.`,
          url: `/agenda/${data.dono_id}`,
        });
      } else if (body.mensagem?.trim()) {
        await enviarPushParaUsuario(data.cliente_id, {
          titulo: 'Aviso do estabelecimento',
          corpo: body.mensagem.trim(),
          url: `/agenda/${data.dono_id}`,
        });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}
