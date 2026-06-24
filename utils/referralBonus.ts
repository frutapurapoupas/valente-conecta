export interface ReferralRule {
  id: 'usuarios_gerais' | 'empresas_lojas' | 'profissionais_liberais';
  nome: string;
  bonus: number;
  meta: number;
  ativo: boolean;
  descricao?: string;
}

export interface ReferralConfig {
  rules: ReferralRule[];
  pixMinimo?: number;
}

export interface ReferralCounts {
  usuariosGerais: number;
  empresasLojas: number;
  profissionaisLiberais: number;
}

export interface ReferralWalletSummary {
  disponivel: number;
  bloqueado: number;
  pago: number;
  totalLiberado: number;
  lotes: Record<string, number>;
}

export function getRule(config: ReferralConfig, id: ReferralRule['id']) {
  return config.rules.find((rule) => rule.id === id);
}

export function calculateCompletedLots(count: number, batchSize: number) {
  if (!batchSize || batchSize <= 0) return 0;
  return Math.floor(count / batchSize);
}

export function calculateReferralWallet(
  config: ReferralConfig,
  counts: ReferralCounts,
  payoutRequests: Array<{ amount: number; status: string }>
): ReferralWalletSummary {
  const ruleUsers = getRule(config, 'usuarios_gerais');
  const ruleStores = getRule(config, 'empresas_lojas');
  const rulePros = getRule(config, 'profissionais_liberais');

  const lots = {
    usuarios_gerais: ruleUsers?.ativo ? calculateCompletedLots(counts.usuariosGerais, ruleUsers.meta) : 0,
    empresas_lojas: ruleStores?.ativo ? calculateCompletedLots(counts.empresasLojas, ruleStores.meta) : 0,
    profissionais_liberais: rulePros?.ativo ? calculateCompletedLots(counts.profissionaisLiberais, rulePros.meta) : 0
  };

  const totalLiberado =
    lots.usuarios_gerais * Number(ruleUsers?.bonus || 0) +
    lots.empresas_lojas * Number(ruleStores?.bonus || 0) +
    lots.profissionais_liberais * Number(rulePros?.bonus || 0);

  const bloqueado = payoutRequests
    .filter((item) => item.status === 'pendente' || item.status === 'processando')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pago = payoutRequests
    .filter((item) => item.status === 'pago')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const disponivel = Math.max(totalLiberado - bloqueado - pago, 0);

  return {
    disponivel,
    bloqueado,
    pago,
    totalLiberado,
    lotes: lots
  };
}
