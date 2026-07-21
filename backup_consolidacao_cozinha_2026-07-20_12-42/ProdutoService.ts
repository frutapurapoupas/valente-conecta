// app/cozinha/services/ProdutoService.ts
import { ProdutoRepository } from '../repositories/ProdutoRepository';
import { Produto, ProdutoInput } from '../types/produto';

export class ProdutoService {
  private repository = new ProdutoRepository();

  async listarTodos(): Promise<Produto[]> {
    try {
      const produtos = await this.repository.buscarTodos();
      // Regra de negócio: Filtrar apenas ativos para exibição pública
      return produtos.filter(p => p.ativo !== false);
    } catch (error) {
      console.error('Erro no Service ao listar produtos:', error);
      // Retorna array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  async listarPorCategoria(categoria: string): Promise<Produto[]> {
    try {
      if (!categoria) {
        throw new Error('Categoria é obrigatória');
      }
      return await this.repository.buscarPorCategoria(categoria);
    } catch (error) {
      console.error('Erro no Service ao listar produtos por categoria:', error);
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    try {
      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }
      return await this.repository.buscarPorId(id);
    } catch (error) {
      console.error('Erro no Service ao buscar produto:', error);
      throw error;
    }
  }

  async criar(produto: ProdutoInput): Promise<Produto> {
    try {
      // Regra de negócio: Validar dados
      this.validarProduto(produto);
      
      // Regra de negócio: Preço não pode ser negativo
      if (produto.preco < 0) {
        throw new Error('Preço não pode ser negativo');
      }

      // Regra de negócio: Estoque não pode ser negativo
      if (produto.estoque && produto.estoque < 0) {
        throw new Error('Estoque não pode ser negativo');
      }

      return await this.repository.criar(produto);
    } catch (error) {
      console.error('Erro no Service ao criar produto:', error);
      throw error;
    }
  }

  async atualizar(id: string, produto: Partial<ProdutoInput>): Promise<Produto> {
    try {
      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }

      // Validar apenas campos que estão sendo atualizados
      if (produto.preco !== undefined && produto.preco < 0) {
        throw new Error('Preço não pode ser negativo');
      }

      if (produto.estoque !== undefined && produto.estoque < 0) {
        throw new Error('Estoque não pode ser negativo');
      }

      return await this.repository.atualizar(id, produto);
    } catch (error) {
      console.error('Erro no Service ao atualizar produto:', error);
      throw error;
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('ID do produto é obrigatório');
      }
      await this.repository.deletar(id);
    } catch (error) {
      console.error('Erro no Service ao deletar produto:', error);
      throw error;
    }
  }

  private validarProduto(produto: ProdutoInput): void {
    if (!produto.nome || produto.nome.trim().length < 3) {
      throw new Error('Nome do produto deve ter pelo menos 3 caracteres');
    }

    if (!produto.categoria || produto.categoria.trim().length < 2) {
      throw new Error('Categoria é obrigatória');
    }

    if (produto.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }
  }
}