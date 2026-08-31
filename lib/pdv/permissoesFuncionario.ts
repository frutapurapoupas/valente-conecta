// Caminho: C:\valente_conecta\lib\pdv\permissoesFuncionario.ts
//
// Lista única de permissões configuráveis por funcionário do PDV — usada
// tanto pela tela de cadastro do dono (app/pdv/equipe) quanto pelos
// pontos de gating (PdvSubNav, FrenteCaixaDesktop/Mobile, páginas de aba).

export const PERMISSOES_PDV = [
  { chave: "estoque", label: "Ver e editar estoque" },
  { chave: "importar-estoque", label: "Importar estoque por planilha" },
  { chave: "etiquetas", label: "Imprimir etiquetas" },
  { chave: "fiado", label: "Gerenciar clientes e cobranças de fiado" },
  { chave: "caixa", label: "Ver lançamentos e fechar caixa" },
  { chave: "notas-fiscais", label: "Ver notas fiscais" },
  { chave: "relatorios", label: "Ver relatórios de vendas" },
  { chave: "captura-externa", label: "Acessar o modo espião" },
  { chave: "aplicar_desconto", label: "Aplicar desconto na venda" },
  { chave: "vender_fiado", label: "Vender fiado" },
  { chave: "forcar_limite_fiado", label: "Vender fiado acima do limite do cliente" },
] as const;

export type ChavePermissaoPdv = (typeof PERMISSOES_PDV)[number]["chave"];

export type PermissoesFuncionario = Partial<Record<ChavePermissaoPdv, boolean>>;

export const PERMISSOES_PADRAO: PermissoesFuncionario = {};
