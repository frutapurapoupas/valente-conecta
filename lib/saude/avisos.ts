// Caminho: C:\valente_conecta\lib\saude\avisos.ts
//
// Avisos por push da Fila Virtual de Saude (ver proposta "Modo Valente
// Facil", item 5). Reaproveita a infraestrutura de push que ja existe no
// projeto (lib/push.ts, webpush real com VAPID) -- nao e' novidade nenhuma,
// so' um novo lugar chamando a mesma funcao. Falha silenciosa por
// natureza (enviarPushParaUsuario ja nao lanca erro), entao nunca trava o
// fluxo principal da fila.
//
// WhatsApp automatico (sem o usuario precisar abrir o app) NAO esta
// incluido aqui -- nao existe integracao com nenhuma API de WhatsApp
// Business no projeto (so' o padrao wa.me aberto pelo proprio usuario,
// usado em ~25 telas). Fica de fora ate' isso ser decidido.

import type { SupabaseClient } from '@supabase/supabase-js';
import { enviarPushParaUsuario } from '@/lib/push';

export async function avisarChamado(usuarioId: string | null, numero: number, unidadeId: string) {
  if (!usuarioId) return;
  await enviarPushParaUsuario(usuarioId, {
    titulo: 'É a sua vez!',
    corpo: `Sua senha ${String(numero).padStart(3, '0')} foi chamada.`,
    url: `/saude/fila/${unidadeId}?senha=${usuarioId}`,
  });
}

export async function avisarReordenacao(usuarioId: string | null, unidadeId: string, senhaId: string) {
  if (!usuarioId) return;
  await enviarPushParaUsuario(usuarioId, {
    titulo: 'Sua posição na fila mudou',
    corpo: 'Chegou um atendimento prioritário. Confira sua posição atualizada.',
    url: `/saude/fila/${unidadeId}?senha=${senhaId}`,
  });
}

export async function avisarPagamentoConfirmado(usuarioId: string | null, unidadeId: string, senhaId: string) {
  if (!usuarioId) return;
  await enviarPushParaUsuario(usuarioId, {
    titulo: 'Pagamento confirmado',
    corpo: 'A unidade confirmou o recebimento do seu pagamento.',
    url: `/saude/fila/${unidadeId}?senha=${senhaId}`,
  });
}

// Roda depois que a fila avanca (chamar/concluir) -- quem passou a ter 3
// ou menos pessoas na frente e ainda nao foi avisado, recebe o "pode ir
// se deslocando" (so' uma vez, ver aviso_deslocamento_enviado).
export async function avisarDeslocamentoSeNecessario(supabase: SupabaseClient, unidadeId: string) {
  try {
    await avisarDeslocamentoSeNecessarioInterno(supabase, unidadeId);
  } catch (error) {
    // Nunca deixa um aviso quebrar chamar/concluir -- a fila ja avancou de
    // verdade, so' a notificacao falhou.
    console.error('Erro ao avisar deslocamento na fila de saúde:', error);
  }
}

async function avisarDeslocamentoSeNecessarioInterno(supabase: SupabaseClient, unidadeId: string) {
  const { data: esperando } = await supabase
    .from('fila_saude_senhas')
    .select('id, usuario_id, prioridade_tier, created_at, aviso_deslocamento_enviado')
    .eq('unidade_id', unidadeId)
    .in('status', ['aguardando', 'presente'])
    .eq('aviso_deslocamento_enviado', false)
    .not('usuario_id', 'is', null)
    .order('prioridade_tier', { ascending: true })
    .order('created_at', { ascending: true });

  if (!esperando || esperando.length === 0) return;

  for (const senha of esperando) {
    const { count: naFrenteMenorTier } = await supabase
      .from('fila_saude_senhas')
      .select('*', { count: 'exact', head: true })
      .eq('unidade_id', unidadeId)
      .in('status', ['aguardando', 'presente'])
      .lt('prioridade_tier', senha.prioridade_tier);
    const { count: naFrenteMesmoTier } = await supabase
      .from('fila_saude_senhas')
      .select('*', { count: 'exact', head: true })
      .eq('unidade_id', unidadeId)
      .in('status', ['aguardando', 'presente'])
      .eq('prioridade_tier', senha.prioridade_tier)
      .lt('created_at', senha.created_at);
    const pessoasNaFrente = (naFrenteMenorTier || 0) + (naFrenteMesmoTier || 0);

    if (pessoasNaFrente <= 3) {
      await enviarPushParaUsuario(senha.usuario_id, {
        titulo: 'Sua vez está chegando',
        corpo: 'Pode ir se deslocando pra unidade.',
        url: `/saude/fila/${unidadeId}?senha=${senha.id}`,
      });
      await supabase.from('fila_saude_senhas').update({ aviso_deslocamento_enviado: true }).eq('id', senha.id);
    }
  }
}
