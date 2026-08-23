// Caminho: C:\valente_conecta\lib\pdv\frenteCaixaTypes.ts
//
// Tipos compartilhados entre app/pdv/page.tsx (shell) e os dois layouts de
// frente de caixa (components/pdv/FrenteCaixaDesktop.tsx e FrenteCaixaMobile.tsx).

export interface ProdutoPDV {
  estoqueId: string;
  catalogoId: string | null;
  nome: string;
  preco: number;
  fotoUrl: string | null;
  categoria: string;
  estoque: number;
}

export interface ItemCarrinho {
  chave: string; // estoqueId, so' pra key do React e agrupar quantidade
  estoqueId: string;
  catalogoId: string | null;
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
}

export type FormaPagamento = "dinheiro" | "pix" | "cartao" | "fiado";

export interface PropsFrenteCaixa {
  usuarioId: string;
  produtos: ProdutoPDV[];
  clientes: ClienteFiado[];
  carregandoProdutos: boolean;
  onVendaFinalizada: () => void;
}
