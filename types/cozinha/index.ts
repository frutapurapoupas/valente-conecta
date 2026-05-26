// types/cozinha/index.ts
export interface Prato {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: "prato" | "sobremesa";
  diaSemana: "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado";
  disponivel: boolean;
  ingredientes?: string[];
  tempoPreparo?: number;
}

export interface CardapioSemana {
  dia: string;
  pratos: Prato[];
  sobremesas: Prato[];
}

export interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
}

export interface Pedido {
  id: string;
  items: ItemCarrinho[];
  total: number;
  status: "pendente" | "confirmado" | "preparando" | "entregue" | "cancelado";
  cliente: string;
  telefone: string;
  endereco: string;
  createdAt: Date;
}
