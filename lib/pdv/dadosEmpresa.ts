// Caminho: C:\valente_conecta\lib\pdv\dadosEmpresa.ts
//
// Dados da empresa pra imprimir na nota de venda formal (nome, CNPJ,
// endereco, telefone) -- opcionais, guardados por dispositivo em
// localStorage, mesmo padrao ja usado pro nome da loja no fiado
// (app/pdv/fiado/page.tsx, chave pdv_fiado_loja_nome). Nao virou
// migration/tabela porque e' so' conteudo impresso, nao dado
// transacional -- consistente com o resto do PDV que ja usa esse
// padrao pra preferencia de dispositivo (usePdvLayoutPreference).

const CHAVE = "pdv_dados_empresa";

export interface DadosEmpresa {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
}

export function obterDadosEmpresa(): DadosEmpresa {
  if (typeof window === "undefined") return { nome: "", cnpj: "", endereco: "", telefone: "" };
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return { nome: "", cnpj: "", endereco: "", telefone: "", ...JSON.parse(salvo) };
  } catch {
    // ignora e cai no default
  }
  return { nome: "", cnpj: "", endereco: "", telefone: "" };
}

export function salvarDadosEmpresa(dados: DadosEmpresa) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE, JSON.stringify(dados));
}
