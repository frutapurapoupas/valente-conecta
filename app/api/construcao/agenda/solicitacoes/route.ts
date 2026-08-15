// Caminho: C:\valente_conecta\app\api\construcao\agenda\solicitacoes\route.ts
//
// Solicitacao de um dia livre na agenda do prestador (ver migration
// 047_construcao_agenda.sql). POST cria a solicitacao e avisa o
// profissional por push; PUT aceita/recusa — aceitando, marca o dia como
// ocupado (pra ninguem mais pedir o mesmo dia) e avisa o solicitante.
//
// GET aceita donoId (inbox do profissional) OU solicitanteId (status das
// proprias solicitacoes) — nunca os dois junto, sao publicos diferentes.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const donoId = request.nextUrl.searchParams.get('donoId');
  const solicitanteId = request.nextUrl.searchParams.get('solicitanteId');
  if (!donoId && !solicitanteId) {
    return NextResponse.json({ success: false, error: 'donoId ou solicitanteId é obrigatório' }, { status: 400 });
  }

  const supabase = createClient();
  let query = supabase.from('construcao_agenda_solicitacoes').select('*').order('created_at', { ascending: false });
  query = donoId ? query.eq('dono_id', donoId) : query.eq('solicitante_id', solicitanteId as string);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.solicitanteId || !body.data || !body.solicitanteNome || !body.solicitanteTelefone) {
      return NextResponse.json(
        { success: false, error: 'donoId, solicitanteId, data, solicitanteNome e solicitanteTelefone são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: jaOcupado } = await supabase
      .from('construcao_agenda_dias')
      .select('id')
      .eq('dono_id', body.donoId)
      .eq('data', body.data)
      .maybeSingle();
    if (jaOcupado) return NextResponse.json({ success: false, error: 'Esse dia já está ocupado.' }, { status: 409 });

    const { data: solicitacao, error } = await supabase
      .from('construcao_agenda_solicitacoes')
      .insert({
        dono_id: body.donoId,
        solicitante_id: body.solicitanteId,
        solicitante_nome: body.solicitanteNome,
        solicitante_telefone: body.solicitanteTelefone,
        data: body.data,
        observacoes: body.observacoes || null,
      })
      .select('*')
      .single();
    if (error) throw error;

    try {
      await enviarPushParaUsuario(body.donoId, {
        titulo: 'Novo pedido de agendamento',
        corpo: `${body.solicitanteNome} quer marcar ${new Date(body.data + 'T00:00:00').toLocaleDateString('pt-BR')} com você.`,
        url: '/construcao/admin',
      });
    } catch {
      // push e' best-effort
    }

    return NextResponse.json({ success: true, data: solicitacao });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar agendamento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    if (!['aceito', 'recusado'].includes(body.status)) {
      return NextResponse.json({ success: false, error: 'status inválido' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: solicitacao, error } = await supabase
      .from('construcao_agenda_solicitacoes')
      .update({ status: body.status, respondido_em: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pendente')
      .select('*')
      .single();
    if (error) throw error;
    if (!solicitacao) return NextResponse.json({ success: false, error: 'Solicitação já respondida ou não encontrada.' }, { status: 409 });

    if (body.status === 'aceito') {
      await supabase.from('construcao_agenda_dias').upsert(
        { dono_id: solicitacao.dono_id, data: solicitacao.data },
        { onConflict: 'dono_id,data', ignoreDuplicates: true }
      );
    }

    try {
      const dataFormatada = new Date(solicitacao.data + 'T00:00:00').toLocaleDateString('pt-BR');
      await enviarPushParaUsuario(solicitacao.solicitante_id, {
        titulo: body.status === 'aceito' ? 'Agendamento confirmado!' : 'Agendamento recusado',
        corpo:
          body.status === 'aceito'
            ? `O profissional confirmou o dia ${dataFormatada}. Ele vai entrar em contato.`
            : `O profissional não pôde confirmar o dia ${dataFormatada}. Tente outra data.`,
        url: '/construcao',
      });
    } catch {
      // push e' best-effort
    }

    return NextResponse.json({ success: true, data: solicitacao });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao responder solicitação' }, { status: 500 });
  }
}
