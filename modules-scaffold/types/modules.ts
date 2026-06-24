/**
 * Tipos compartilhados para módulos
 * Estes tipos são utilizados em todos os módulos (Saúde, Transporte, Mercado, etc.)
 */

export interface Item {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  preco?: number;
  imagem?: string;
  telefone?: string;
  fornecedorId?: string;
  fornecedorNome?: string;
  status?: 'pendente' | 'publicado';
  createdAt?: string;
  updatedAt?: string;
  subcategoria?: string;
  disponibilidade?: 'disponivel' | 'indisponivel';
  metadadosModulo?: Record<string, any>;
}

export interface Demand {
  id: string;
  categoria: string;
  nomeCliente: string;
  contato?: string;
  descricao?: string;
  status?: 'pendente' | 'em_andamento' | 'resolvido' | 'cancelado';
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  role: 'user' | 'supplier' | 'admin';
  nome?: string;
  telefone?: string;
  email?: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  userId?: string;
  nomeEmpresa?: string;
  telefone?: string;
  email?: string;
  contatos?: string[];
  categorias?: string[];
  createdAt?: string;
}

export interface Schedule {
  id: string;
  itemId?: string;
  userId?: string;
  start?: string;
  end?: string;
  status?: 'agendado' | 'concluido' | 'cancelado' | 'nao_compareceu';
  notas?: string;
  createdAt?: string;
}

export interface QueueEntry {
  id: string;
  servicePoint?: string;
  nome?: string;
  contato?: string;
  prioridade?: 'normal' | 'alta' | 'urgente';
  posicao?: number;
  status?: 'aguardando' | 'em_atendimento' | 'atendido' | 'cancelado';
  timeWaited?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleConfig {
  name: string;
  categoria: string;
  icon: string;
  color: string;
  description: string;
  hasScheduling?: boolean;
  hasQueues?: boolean;
  hasCatalog?: boolean;
  customFields?: Record<string, any>;
}
