// app/admin-master/cozinha/services/EstoqueService.ts
import { EstoqueRepository } from '../repositories/EstoqueRepository';
import { IngredienteRepository } from '../repositories/IngredienteRepository';
import { MovimentacaoEstoque, EstoqueResumo } from '../types/estoque';

export class EstoqueService {
  private repository = new EstoqueRepository();
  private ingredienteRepository = new IngredienteRepository();

  async listarMovimentacoes(ingredienteId?: string): Promise<MovimentacaoEstoque[]> {
    try {
      return await this.repository.buscarMovimentacoes(ingredienteId);
    } catch (error) {
      console.error('Erro no Service ao listar movimentações:', error);
      throw error;
    }
  }

  async registrarEntrada(
    ingredienteId: string,
    quantidade: number,
    motivo: string,
    usuarioId: string
  ): Promise<MovimentacaoEstoque> {
    try {
      return await this.registrarMovimentacao(ingredienteId, quantidade, 'entrada', motivo, usuarioId);
    } catch (error) {
      console.error('Erro no Service ao registrar entrada:', error);
      throw error;
    }
  }

  async registrarSaida(
    ingredienteId: string,
    quantidade: number,
    motivo: string,
    usuarioId: string
  ): Promise<MovimentacaoEstoque> {
    try {
      return await this.registrarMovimentacao(ingredienteId, quantidade, 'saida', motivo, usuarioId);
    } catch (error) {
      console.error('Erro no Service ao registrar saída:', error);
      throw error;
    }
  }

  private async registrarMovimentacao(
    ingredienteId: string,
    quantidade: number,
    tipo: 'entrada' | 'saida' | 'ajuste',
    motivo: string,
    usuarioId: string
  ): Promise<MovimentacaoEstoque> {
    // Buscar ingrediente
    const ingrediente = await this.ingredienteRepository.buscarPorId(ingredienteId);
    if (!ingrediente) {
      throw new Error('Ingrediente não encontrado');
    }

    const quantidadeAnterior = ingrediente.estoqueAtual;
    const quantidadeNova = tipo === 'entrada' 
      ? quantidadeAnterior + quantidade 
      : quantidadeAnterior - quantidade;

    if (quantidadeNova < 0) {
      throw new Error('Estoque insuficiente para esta operação');
    }

    // Registrar movimentação
    const movimentacao = await this.repository.registrarMovimentacao({
      ingredienteId,
      ingredienteNome: ingrediente.nome,
      tipo,
      quantidade,
      quantidadeAnterior,
      quantidadeNova,
      motivo,
      usuarioId
    });

    // Atualizar estoque
    await this.repository.atualizarEstoque(ingredienteId, quantidadeNova);

    return movimentacao;
  }

  async buscarResumo(): Promise<EstoqueResumo[]> {
    try {
      const resumo = await this.repository.buscarResumo();
      
      // Calcular valores totais
      const ingredientes = await this.ingredienteRepository.buscarTodos();
      const valorPorIngrediente = new Map(
        ingredientes.map(ing => [ing.id, ing.precoMedio])
      );

      return resumo.map(item => ({
        ...item,
        valorTotal: (item.quantidadeAtual * (valorPorIngrediente.get(item.ingredienteId) || 0))
      }));
    } catch (error) {
      console.error('Erro no Service ao buscar resumo:', error);
      throw error;
    }
  }

  async alertasEstoqueBaixo(): Promise<EstoqueResumo[]> {
    const resumo = await this.buscarResumo();
    return resumo.filter(item => 
      item.status === 'baixo' || item.status === 'critico'
    );
  }
}