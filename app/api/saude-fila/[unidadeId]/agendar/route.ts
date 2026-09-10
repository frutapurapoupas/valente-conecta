// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\agendar\route.ts
//
// Agendamento eletivo (ver proposta "Modo Valente Facil", item 5): o
// diretor ou atendente marca uma senha com dias de antecedencia, pra
// tratamento eletivo. No dia marcado, entra sozinho na fila do dia (ver
// lib/saude/filaQueries.ts) -- nao precisa o paciente refazer nada.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { calcularPrioridade, type AutodeclaracaoPrioridade } from '@/lib/saude/prioridadeLegal';
import { nivelDoUsuarioNaUnidade, podeAtender } from '@/lib/saude/nivelAcesso';

export async function POST(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const usuarioAtendenteId = String(body.usuarioAtendenteId || '').trim();
    const pacienteWhatsapp = String(body.pacienteWhatsapp || '').replace(/\D/g, '');
    const dataAgendada = String(body.dataAgendada || '').trim();

    if (!usuarioAtendenteId || !pacienteWhatsapp || !dataAgendada) {
      return NextResponse.json({ success: false, error: 'usuarioAtendenteId, pacienteWhatsapp e dataAgendada são obrigatórios' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioAtendenteId);
    if (!podeAtender(nivel)) return NextResponse.json({ success: false, error: 'Sem permissão pra agendar nessa unidade.' }, { status: 403 });

    const { data: paciente } = await supabase.from('usuarios').select('id, nome').eq('whatsapp', pacienteWhatsapp).maybeSingle();
    if (!paciente) {
      return NextResponse.json({ success: false, error: 'Esse WhatsApp ainda não tem conta no Valente Conecta.' }, { status: 404 });
    }

    // O numero da senha so' faz sentido calculado no dia -- aqui usa 0 como
    // provisorio; quando o dia chegar, a tela do dia recalcula quantos ja
    // existem hoje ANTES de mostrar (ver observacao no admin, nao ha' um
    // job separado disso na v1 -- o numero real e' redefinido no check-in).
    const autodeclaracao: AutodeclaracaoPrioridade = body.autodeclaracao || {};
    const { tier, motivo } = calcularPrioridade(autodeclaracao);

    const { data: senha, error } = await supabase
      .from('fila_saude_senhas')
      .insert({
        unidade_id: params.unidadeId,
        usuario_id: paciente.id,
        numero: 0,
        origem: 'app',
        prioridade_tier: tier,
        motivo_prioridade: motivo,
        servico_id: body.servicoId || null,
        status: 'aguardando',
        data_agendada: dataAgendada,
        agendado_por: usuarioAtendenteId,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: senha, pacienteNome: paciente.nome });
  } catch (error: any) {
    console.error('Erro ao agendar consulta eletiva:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
