// app/cozinha/services/CardapioService.ts
import { CardapioRepository } from '../repositories/CardapioRepository';
import { CardapioItem, CardapioInput, DiaSemana } from '../types/cardapio';

export class CardapioService {
  private repository = new CardapioRepository();

  async listarTodos(): Promise<CardapioItem[]> {
    try {
      return await this.repository.buscarTodos();
    } catch (error) {
      console.error('Erro no Service ao listar cardápio:', error);
      throw error;
    }
  }

  async listarPorDia(dia: string): Promise<CardapioItem[]> {
    try {
      if (!dia) {
        throw new Error('Dia é obrigatório');
      }
      return await this.repository.buscarPorDia(dia);
    } catch (error) {
      console.error('Erro no Service ao listar cardápio do dia:', error);
      throw error;
    }
  }

  async adicionar(item: CardapioInput): Promise<CardapioItem> {
    try {
      // Regra de negócio: Validar dados
      this.validarItemCardapio(item);
      return await this.repository.adicionar(item);
    } catch (error) {
      console.error('Erro no Service ao adicionar item ao cardápio:', error);
      throw error;
    }
  }

  async remover(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID do item é obrigatório');
      }
      await this.repository.remover(id);
    } catch (error) {
      console.error('Erro no Service ao remover item do cardápio:', error);
      throw error;
    }
  }

  async atualizar(id: string, dados: Partial<CardapioInput>): Promise<CardapioItem> {
    try {
      if (!id) {
        throw new Error('ID do item é obrigatório');
      }
      return await this.repository.atualizar(id, dados);
    } catch (error) {
      console.error('Erro no Service ao atualizar item do cardápio:', error);
      throw error;
    }
  }

  private validarItemCardapio(item: CardapioInput): void {
    const diasValidos: DiaSemana[] = [
      'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
    ];

    if (!diasValidos.includes(item.dia as DiaSemana)) {
      throw new Error('Dia da semana inválido');
    }

    if (!item.produtoId) {
      throw new Error('ID do produto é obrigatório');
    }

    if (item.precoEspecial !== undefined && item.precoEspecial < 0) {
      throw new Error('Preço especial não pode ser negativo');
    }
  }
}