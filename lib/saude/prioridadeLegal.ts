// Caminho: C:\valente_conecta\lib\saude\prioridadeLegal.ts
//
// Hierarquia de prioridade da Fila Virtual de Saude (ver proposta "Modo
// Valente Facil", item 5, e Lei 10.048/2000 atualizada pela Lei
// 14.626/2023 + Estatuto do Idoso -- a referencia que embasou isso foi
// trazida pelo dono do produto, nao e' interpretacao juridica nossa).
// Autodeclaracao no ato de entrar na fila (mesmo padrao ja usado em
// outros cadastros do app, ex: motorista de carona) -- nao ha' validacao
// documental automatica.
//
// tier 1 = idoso 80+ (superprioridade, na frente de tudo)
// tier 2 = demais prioridades legais (idoso 60-79, gestante, lactante,
//          pessoa com crianca de colo, PCD, autista, obesidade)
// tier 3 = ampla concorrencia

export interface AutodeclaracaoPrioridade {
  idade?: number;
  gestante?: boolean;
  lactante?: boolean;
  comCriancaDeColo?: boolean;
  pcd?: boolean;
  autista?: boolean;
  obesidade?: boolean;
}

export function calcularPrioridade(dados: AutodeclaracaoPrioridade): { tier: 1 | 2 | 3; motivo: string | null } {
  const idade = Number(dados.idade || 0);

  if (idade >= 80) return { tier: 1, motivo: 'Idoso com 80 anos ou mais (superprioridade)' };

  const motivos: string[] = [];
  if (idade >= 60) motivos.push('Idoso (60 a 79 anos)');
  if (dados.gestante) motivos.push('Gestante');
  if (dados.lactante) motivos.push('Lactante');
  if (dados.comCriancaDeColo) motivos.push('Pessoa com criança de colo');
  if (dados.pcd) motivos.push('Pessoa com deficiência');
  if (dados.autista) motivos.push('Pessoa autista');
  if (dados.obesidade) motivos.push('Pessoa com obesidade');

  if (motivos.length > 0) return { tier: 2, motivo: motivos.join(', ') };

  return { tier: 3, motivo: null };
}
