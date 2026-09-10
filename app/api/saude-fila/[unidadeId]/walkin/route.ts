// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\walkin\route.ts
//
// Atendente registra alguem que chegou sem passar pelo app (ex: idoso/PCD
// que apareceu direto no balcao -- "fura-fila legal", ver proposta "Modo
// Valente Facil", item 5). A fila ja reordena sozinha porque toda leitura
// e' ORDER BY prioridade_tier, created_at (lib/saude/filaQueries.ts) --
// nao precisa mover nada manualmente.
//
// Quem foi empurrado recebe aviso DENTRO DO APP (aviso_reordenacao=true,
// lido pela tela de acompanhamento do paciente) E push de verdade (ver
// lib/saude/avisos.ts). WhatsApp automatico continua de fora -- nao existe
// integracao com nenhuma API de WhatsApp Business no projeto.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { calcularPrioridade, type AutodeclaracaoPrioridade } from '@/lib/saude/prioridadeLegal';
import { nivelDoUsuarioNaUnidade, podeAtender } from '@/lib/saude/nivelAcesso';
import { avisarReordenacao } from '@/lib/saude/avisos';

export async function POST(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim(); // atendente logado
    const nome = String(body.nome || '').trim();
    if (!usuarioId || !nome) return NextResponse.json({ success: false, error: 'usuarioId e nome são obrigatórios' }, { status: 400 });

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
    if (!podeAtender(nivel)) return NextResponse.json({ success: false, error: 'Sem permissão pra registrar walk-in nessa unidade.' }, { status: 403 });

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('fila_saude_senhas')
      .select('*', { count: 'exact', head: true })
      .eq('unidade_id', params.unidadeId)
      .gte('created_at', inicioDoDia.toISOString());
    const numero = (count || 0) + 1;

    const autodeclaracao: AutodeclaracaoPrioridade = body.autodeclaracao || {};
    const { tier, motivo } = calcularPrioridade(autodeclaracao);

    const { data: senha, error } = await supabase
      .from('fila_saude_senhas')
      .insert({
        unidade_id: params.unidadeId,
        nome_avulso: nome,
        numero,
        origem: 'walkin',
        prioridade_tier: tier,
        motivo_prioridade: motivo,
        status: 'presente',
        registrado_por: usuarioId,
      })
      .select('*')
      .single();
    if (error) throw error;

    // Avisa (dentro do app) quem estava esperando com prioridade igual ou
    // menor -- so' faz sentido se o walk-in realmente furou fila de
    // alguem (tier 1 ou 2).
    if (tier <= 2) {
      const { data: afetados } = await supabase
        .from('fila_saude_senhas')
        .update({ aviso_reordenacao: true })
        .eq('unidade_id', params.unidadeId)
        .in('status', ['aguardando', 'presente'])
        .gte('prioridade_tier', tier)
        .not('usuario_id', 'is', null)
        .neq('id', senha.id)
        .select('id, usuario_id');
      await Promise.all((afetados || []).map((a) => avisarReordenacao(a.usuario_id, params.unidadeId, a.id)));
    }

    return NextResponse.json({ success: true, data: senha });
  } catch (error: any) {
    console.error('Erro ao registrar walk-in na fila de saúde:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
