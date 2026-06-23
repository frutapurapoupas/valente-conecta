// services/cozinhaService.ts
// 🔧 LÓGICA DE API - Comunicação com o backend

const API_BASE = '/api/cozinha';

export interface Prato {
  id: string;
  nome: string;
  descricao: string;
  dia_semana: string;
  preco: number;
  ativo: boolean;
  created_at?: string;
}

export interface EstoqueItem {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade: number;
  quantidade_minima: number;
  preco_unitario: number;
}

export interface ProducaoItem {
  id: string;
  prato_id: string;
  quantidade_prevista: number;
  quantidade_produzida?: number;
  status: 'pendente' | 'produzindo' | 'concluido' | 'cancelado';
  inicio?: string;
  fim?: string;
  responsavel?: string;
  created_at?: string;
  prato?: Prato;
}

export interface CompraItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  prioridade: 'alta' | 'media' | 'baixa';
  comprado: boolean;
  created_at?: string;
}

export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  porcoes: number;
  custo_total: number;
  preco_sugerido: number;
  ingredientes: any[];
  created_at?: string;
}

export const cozinhaService = {
  // ==================== PRATOS ====================
  getPratos: () => fetch(`${API_BASE}/pratos`).then(res => res.json()),
  getPrato: (id: string) => fetch(`${API_BASE}/pratos/${id}`).then(res => res.json()),
  createPrato: (data: any) => fetch(`${API_BASE}/pratos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updatePrato: (id: string, data: any) => fetch(`${API_BASE}/pratos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deletePrato: (id: string) => fetch(`${API_BASE}/pratos/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // ==================== ESTOQUE ====================
  getEstoque: () => fetch(`${API_BASE}/estoque`).then(res => res.json()),
  getEstoqueItem: (id: string) => fetch(`${API_BASE}/estoque/${id}`).then(res => res.json()),
  createEstoqueItem: (data: any) => fetch(`${API_BASE}/estoque`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateEstoqueItem: (id: string, data: any) => fetch(`${API_BASE}/estoque/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteEstoqueItem: (id: string) => fetch(`${API_BASE}/estoque/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // ==================== PRODUÇÃO ====================
  getProducao: () => fetch(`${API_BASE}/producao`).then(res => res.json()),
  createProducao: (data: any) => fetch(`${API_BASE}/producao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateProducaoStatus: (id: string, status: string, quantidade?: number) => fetch(`${API_BASE}/producao`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, quantidade_produzida: quantidade })
  }).then(res => res.json()),

  // ==================== COMPRAS ====================
  getCompras: () => fetch(`${API_BASE}/compras`).then(res => res.json()),
  createCompra: (data: any) => fetch(`${API_BASE}/compras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  toggleCompra: (id: string, comprado: boolean) => fetch(`${API_BASE}/compras`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, comprado })
  }).then(res => res.json()),
  deleteCompra: (id: string) => fetch(`${API_BASE}/compras/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // ==================== RECEITAS ====================
  getReceitas: () => fetch(`${API_BASE}/receitas`).then(res => res.json()),
  getReceita: (id: string) => fetch(`${API_BASE}/receitas/${id}`).then(res => res.json()),
  createReceita: (data: any) => fetch(`${API_BASE}/receitas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  updateReceita: (id: string, data: any) => fetch(`${API_BASE}/receitas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteReceita: (id: string) => fetch(`${API_BASE}/receitas/${id}`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // ==================== FINANCEIRO ====================
  // ✅ NOVA FUNÇÃO ADICIONADA
  getFinanceiro: () => fetch(`${API_BASE}/financeiro`).then(res => res.json()),
};