// Caminho: C:\valente_conecta\app\api\saude\reivindicar\route.ts
//
// "Sou proprietário" pro diretorio de Saude — mesmo padrao ja usado em
// comercios-diretorio/reivindicar (056), so' que gravando em
// saude_estabelecimentos (059_saude_reivindicacoes.sql). Reaproveita a
// mesma config de moderacao (comercios_moderacao) — e' a mesma decisao de
// negocio (auto/manual).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function aplicarReivindicacao(supabase: any, estabelecimentoId: string, dadosNovos: any, usuarioId: string | null) {
  await supabase
    .from('saude_estabelecimentos')
    .update({
      nome: dadosNovos.nome,
      telefone: dadosNovos.telefone,
      whatsapp: dadosNovos.whatsapp || dadosNovos.telefone,
      endereco: dadosNovos.endereco,
      horario: dadosNovos.horario,
      tipo: dadosNovos.tipo,
      especialidades: Array.isArray(dadosNovos.especialidades) ? dadosNovos.especialidades : [],
      foto: dadosNovos.foto || null,
      dono_id: usuarioId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', estabelecimentoId);

  if (usuarioId) {
    await supabase
      .from('agenda_habilitacoes')
      .upsert({ dono_id: usuarioId, ativo: true, gratuito: true, liberado_em: new Date().toISOString() }, { onConflict: 'dono_id' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { estabelecimentoId, usuarioId, nomeSolicitante, telefoneSolicitante, dadosNovos } = body || {};
    if (!estabelecimentoId || !telefoneSolicitante?.trim() || !dadosNovos?.nome?.trim() || !dadosNovos?.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'Preencha nome, telefone e os dados do estabelecimento.' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: estabelecimento } = await supabase.from('saude_estabelecimentos').select('id, dono_id').eq('id', estabelecimentoId).maybeSingle();
    if (!estabelecimento) return NextResponse.json({ success: false, error: 'Estabelecimento não encontrado.' }, { status: 404 });
    if (estabelecimento.dono_id) {
      return NextResponse.json({ success: false, error: 'Esse estabelecimento já foi reivindicado por outra pessoa.' }, { status: 409 });
    }

    const { data: configData } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'comercios_moderacao').maybeSingle();
    const auto = configData?.valor ? Boolean(JSON.parse(configData.valor).auto) : false;

    const { data: reivindicacao, error } = await supabase
      .from('saude_estabelecimentos_reivindicacoes')
      .insert({
        estabelecimento_id: estabelecimentoId,
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
      await aplicarReivindicacao(supabase, estabelecimentoId, dadosNovos, usuarioId || null);
    }

    return NextResponse.json({ success: true, data: reivindicacao, aprovadaAutomaticamente: auto });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar solicitação' }, { status: 500 });
  }
}
