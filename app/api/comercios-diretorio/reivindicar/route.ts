// Caminho: C:\valente_conecta\app\api\comercios-diretorio\reivindicar\route.ts
//
// "Sou proprietário": quem clica atualiza os dados do comercio, e isso vira
// uma solicitacao — aprovada manualmente pelo admin master ou
// automaticamente, conforme admin_configuracoes.chave='comercios_moderacao'
// (ver 056_comercios_diretorio.sql). Aprovada (nos dois casos), o comercio
// ganha dono_id de verdade e uma habilitacao no modulo Agenda+Fila
// (019_agenda_fila.sql) e' criada/ativada, liberando agendamento.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function aplicarReivindicacao(supabase: any, comercioId: string, dadosNovos: any, usuarioId: string | null) {
  await supabase
    .from('comercios_diretorio')
    .update({
      nome: dadosNovos.nome,
      telefone: dadosNovos.telefone,
      whatsapp: dadosNovos.whatsapp || dadosNovos.telefone,
      endereco: dadosNovos.endereco,
      horario: dadosNovos.horario,
      categoria: dadosNovos.categoria,
      foto: dadosNovos.foto || null,
      dono_id: usuarioId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', comercioId);

  // Libera o comercio pro modulo Agenda+Fila — a partir daqui o dono pode
  // cadastrar profissionais/horarios e o comercio aceita agendamento.
  if (usuarioId) {
    await supabase
      .from('agenda_habilitacoes')
      .upsert({ dono_id: usuarioId, ativo: true, gratuito: true, liberado_em: new Date().toISOString() }, { onConflict: 'dono_id' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comercioId, usuarioId, nomeSolicitante, telefoneSolicitante, dadosNovos } = body || {};
    if (!comercioId || !telefoneSolicitante?.trim() || !dadosNovos?.nome?.trim() || !dadosNovos?.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'Preencha nome, telefone e os dados do comércio.' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: comercio } = await supabase.from('comercios_diretorio').select('id, dono_id').eq('id', comercioId).maybeSingle();
    if (!comercio) return NextResponse.json({ success: false, error: 'Comércio não encontrado.' }, { status: 404 });
    if (comercio.dono_id) {
      return NextResponse.json({ success: false, error: 'Esse comércio já foi reivindicado por outra pessoa.' }, { status: 409 });
    }

    const { data: configData } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'comercios_moderacao').maybeSingle();
    const auto = configData?.valor ? Boolean(JSON.parse(configData.valor).auto) : false;

    const { data: reivindicacao, error } = await supabase
      .from('comercios_diretorio_reivindicacoes')
      .insert({
        comercio_id: comercioId,
        usuario_id: usuarioId || null,
        nome_solicitante: nomeSolicitante || null,
        telefone_solicitante: telefoneSolicitante.trim(),
        dados_novos: dadosNovos,
        status: auto ? 'aprovada' : 'pendente',
        processado_em: auto ? new Date().toISOString() : null,
      })
      .select('*')
      .single();
    if (error) throw error;

    if (auto) {
      await aplicarReivindicacao(supabase, comercioId, dadosNovos, usuarioId || null);
    }

    return NextResponse.json({ success: true, data: reivindicacao, aprovadaAutomaticamente: auto });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar solicitação' }, { status: 500 });
  }
}
