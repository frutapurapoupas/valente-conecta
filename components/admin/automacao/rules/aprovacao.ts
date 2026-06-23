// components/admin/automacao/rules/aprovacao.ts
// 🆕 REGRAS DE APROVAÇÃO AUTOMÁTICA

import { Lojista, RegraAprovacao } from '../../menu/types';

// ============================================================
// REGRA 1: AUTO-APROVAÇÃO POR SCORE
// ============================================================

export const regraAutoAprovacao: RegraAprovacao = {
  id: 'auto-aprovacao-score',
  nome: 'Auto-Aprovação por Score',
  prioridade: 1,
  condicao: (lojista: Lojista) => {
    // Aprova automaticamente se:
    // - Score de confiança >= 70
    // - Tem foto
    // - Descrição completa
    return (
      lojista.scoreConfianca >= 70 &&
      lojista.possuiFoto &&
      lojista.descricaoCompleta
    );
  },
  acao: 'aprovar'
};

// ============================================================
// REGRA 2: APROVAÇÃO APÓS 5 AVALIAÇÕES POSITIVAS
// ============================================================

export const regraAprovacaoPorAvaliacoes: RegraAprovacao = {
  id: 'aprovacao-avaliacoes',
  nome: 'Aprovação por Avaliações',
  prioridade: 2,
  condicao: (lojista: Lojista) => {
    return (
      lojista.totalAvaliacoes >= 5 &&
      lojista.avaliacaoMedia >= 4.0
    );
  },
  acao: 'aprovar'
};

// ============================================================
// REGRA 3: SUSPENSÃO POR DENÚNCIAS
// ============================================================

export const regraSuspensaoPorDenuncias: RegraAprovacao = {
  id: 'suspensao-denuncias',
  nome: 'Suspensão por Denúncias',
  prioridade: 10,
  condicao: (lojista: Lojista) => {
    return lojista.denuncias >= 3;
  },
  acao: 'suspender'
};

// ============================================================
// REGRA 4: SUSPENSÃO POR BAIXA QUALIDADE
// ============================================================

export const regraSuspensaoPorQualidade: RegraAprovacao = {
  id: 'suspensao-qualidade',
  nome: 'Suspensão por Baixa Qualidade',
  prioridade: 11,
  condicao: (lojista: Lojista) => {
    // Sem foto e sem descrição por mais de 30 dias
    const diasInativo = calcularDiasInativo(lojista.ultimaAtividade);
    return (
      !lojista.possuiFoto &&
      !lojista.descricaoCompleta &&
      diasInativo > 30
    );
  },
  acao: 'suspender'
};

// ============================================================
// REGRA 5: AUTO-PUBLICAÇÃO PARA LOJAS CONFIÁVEIS
// ============================================================

export const regraAutoPublicacao: RegraAprovacao = {
  id: 'auto-publicacao',
  nome: 'Auto-Publicação',
  prioridade: 3,
  condicao: (lojista: Lojista) => {
    return (
      lojista.status === 'aprovado' &&
      lojista.scoreConfianca >= 80 &&
      lojista.totalAvaliacoes >= 10 &&
      lojista.avaliacaoMedia >= 4.5
    );
  },
  acao: 'aprovar'
};

// ============================================================
// REGRA 6: NOTIFICAÇÃO PARA ADMIN
// ============================================================

export const regraNotificacaoAdmin: RegraAprovacao = {
  id: 'notificacao-admin',
  nome: 'Notificação para Admin',
  prioridade: 20,
  condicao: (lojista: Lojista) => {
    // Notifica se:
    // - Denúncias >= 2 (próximo de suspensão)
    // - Score < 30 (muito baixo)
    return (
      lojista.denuncias >= 2 ||
      lojista.scoreConfianca < 30
    );
  },
  acao: 'notificar'
};

// ============================================================
// TODAS AS REGRAS
// ============================================================

export const todasRegras: RegraAprovacao[] = [
  regraAutoAprovacao,
  regraAprovacaoPorAvaliacoes,
  regraAutoPublicacao,
  regraSuspensaoPorDenuncias,
  regraSuspensaoPorQualidade,
  regraNotificacaoAdmin
];

// ============================================================
// FUNÇÃO AUXILIAR
// ============================================================

function calcularDiasInativo(ultimaAtividade: string): number {
  const ultima = new Date(ultimaAtividade);
  const agora = new Date();
  const diff = agora.getTime() - ultima.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}