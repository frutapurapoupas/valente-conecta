// Caminho: C:\valente_conecta\lib\pdv\frenteCaixaTypes.ts
//
// Tipos compartilhados entre app/pdv/page.tsx (shell) e os dois layouts de
// frente de caixa (components/pdv/FrenteCaixaDesktop.tsx e FrenteCaixaMobile.tsx).

export interface ProdutoPDV {
  estoqueId: string;
  catalogoId: string | null;
  ean: string | null;
  nome: string;
  variante: string; // vazio = produto sem variacao de tamanho/cor
  preco: number;
  fotoUrl: string | null;
  categoria: string;
  unidade: string | null;
  estoque: number;
  estoqueMinimo: number;
  validade: string | null;
}

export interface ItemCarrinho {
  chave: string; // estoqueId, so' pra key do React e agrupar quantidade
  estoqueId: string;
  catalogoId: string | null;
  ean: string | null;
  variante: string;
  unidade: string | null;
  nome: string;
  preco: number;
  quantidade: number;
  fotoUrl: string | null;
  estoqueDisponivel: number;
}

export interface ClienteFiado {
  id: string;
  nome: string;
  telefone: string;
  limite_credito: number;
  cpf?: string | null;
  endereco?: string | null;
}

export type FormaPagamento = "dinheiro" | "pix" | "cartao" | "fiado";

export interface PropsFrenteCaixa {
  usuarioId: string;
  usuarioNome?: string;
  produtos: ProdutoPDV[];
  clientes: ClienteFiado[];
  carregandoProdutos: boolean;
  onVendaFinalizada: () => void;
}
