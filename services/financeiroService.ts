// services/financeiroService.ts
// ?? LÓGICA DE API - Comunicação com o backend

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data: string;
  categoria?: string;
  forma_pagamento?: string;
  status?: string;
  recorrencia?: string;
  recorrencia_quantidade?: number;
  observacoes?: string;
}

const API_URL = '/api/cozinha/financeiro';

export const financeiroService = {
  listar: async (): Promise<{ success: boolean; data: Transacao[] }> => {
    const response = await fetch(API_URL);
    return response.json();
  },

  buscar: async (id: string): Promise<{ success: boolean; data: Transacao }> => {
    const response = await fetch(`${API_URL}/${id}`);
    return response.json();
  },

  // ? Criar com LOGS
  criar: async (data: Omit<Transacao, 'id'>): Promise<{ success: boolean; data: Transacao }> => {
    console.log('?? financeiroService.criar - Enviando:', data);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('?? financeiroService.criar - Resposta:', result);
    
    return result;
  },

  atualizar: async (id: string, data: Partial<Transacao>): Promise<{ success: boolean; data: Transacao }> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  excluir: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};


