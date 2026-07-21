// services/compraService.ts

import { CompraItem } from '@/types/cozinha';

export const compraService = {
  async atualizarEstoqueAposCompra(itens: CompraItem[]): Promise<boolean> {
    try {
      // Simulação - substituir por chamada real à API
      console.log('Atualizando estoque com:', itens);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      return false;
    }
  }
};



