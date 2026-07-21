// app/admin-master/cozinha/types/fornecedor.ts
export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  contato?: string;
  categorias: string[]; // ingredientes que fornece
  observacao?: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FornecedorInput {
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  contato?: string;
  categorias: string[];
  observacao?: string;
}