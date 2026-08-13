// Caminho: C:\valente_conecta\lib\moedaCidade.ts
//
// Sugestao automatica de nome/prefixo da Moeda Conecta pra uma cidade nova
// — o admin master sempre pode editar antes de aprovar (ver
// 033_cidades_moeda_config.sql). Prefixo = ate 4 letras do nome da cidade,
// nome = "<Cidade> Coin", ambos so' um ponto de partida.

export function sugerirMoedaCidade(cidade: string): { moedaNome: string; moedaPrefixo: string } {
  const nomeLimpo = String(cidade || '').trim();
  const nomeFormatado = nomeLimpo
    .toLowerCase()
    .split(/\s+/)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');

  const semAcento = nomeLimpo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();

  const prefixo = (semAcento.slice(0, 4) || 'MC').padEnd(3, 'X');

  return {
    moedaNome: nomeFormatado ? `${nomeFormatado} Coin` : 'Moeda Conecta',
    moedaPrefixo: prefixo,
  };
}
