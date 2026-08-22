// Caminho: C:\valente_conecta\app\api\agua-gas\reivindicar\route.ts
//
// "Sou proprietário" pro diretorio de Agua e Gas — mesmo padrao ja usado em
// saude/reivindicar (059), so' que gravando em agua_gas_fornecedores
// (061_agua_gas_reivindicacoes.sql). Reaproveita a mesma config de
// moderacao (comercios_moderacao). Sem agenda_habilitacoes aqui — Agua e
// Gas tem o proprio painel de pedidos (/agua-gas/fornecedor), nao usa o
// backend de agenda/fila.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function aplicarReivindicacao(supabase: any, fornecedorId: string, dadosNovos: any, usuarioId: string | null) {
  await supabase
    .from('agua_gas_fornecedores')
    .update({
      nome: dadosNovos.nome,
      responsavel: dadosNovos.responsavel || '',
      telefone: dadosNovos.telefone,
      whatsapp: dadosNovos.whatsapp || dadosNovos.telefone,
      endereco: dadosNovos.endereco || '',
      horario: dadosNovos.horario || '',
      dono_id: usuarioId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fornecedorId);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fornecedorId, usuarioId, nomeSolicitante, telefoneSolicitante, dadosNovos } = body || {};
    if (!fornecedorId || !telefoneSolicitante?.trim() || !dadosNovos?.nome?.trim() || !dadosNovos?.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'Preencha nome, telefone e os dados do fornecedor.' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: fornecedor } = await supabase.from('agua_gas_fornecedores').select('id, dono_id').eq('id', fornecedorId).maybeSingle();
    if (!fornecedor) return NextResponse.json({ success: false, error: 'Fornecedor não encontrado.' }, { status: 404 });
    if (fornecedor.dono_id) {
      return NextResponse.json({ success: false, error: 'Esse fornecedor já foi reivindicado por outra pessoa.' }, { status: 409 });
    }

    const { data: configData } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'comercios_moderacao').maybeSingle();
    const auto = configData?.valor ? Boolean(JSON.parse(configData.valor).auto) : false;

    const { data: reivindicacao, error } = await supabase
      .from('agua_gas_reivindicacoes')
      .insert({
        fornecedor_id: fornecedorId,
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
      await aplicarReivindicacao(supabase, fornecedorId, dadosNovos, usuarioId || null);
    }

    return NextResponse.json({ success: true, data: reivindicacao, aprovadaAutomaticamente: auto });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar solicitação' }, { status: 500 });
  }
}
