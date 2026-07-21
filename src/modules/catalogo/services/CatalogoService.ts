// ==================================================
// CATALOGO MODULE - SERVICE
// ==================================================

import { CatalogoRepository } from "../repositories/CatalogoRepository";
import type { Produto, Categoria, ProdutoFiltro, ProdutoResponse } from "../types/catalogo";

export class CatalogoService {
  static async getProdutos(filtro?: ProdutoFiltro, page: number = 1, limit: number = 20): Promise<ProdutoResponse> {
    return CatalogoRepository.getProdutos(filtro, page, limit);
  }

  static async getProdutoById(id: string): Promise<Produto | null> {
    return CatalogoRepository.getProdutoById(id);
  }

  static async getCategorias(): Promise<Categoria[]> {
    return CatalogoRepository.getCategorias();
  }

  static async createProduto(data: Omit<Produto, "id" | "created_at" | "updated_at">): Promise<Produto> {
    // Validações de negócio
    if (!data.nome || data.nome.trim().length < 3) {
      throw new Error("Nome do produto deve ter pelo menos 3 caracteres");
    }

    if (!data.preco || data.preco <= 0) {
      throw new Error("Preço deve ser maior que zero");
    }

    return CatalogoRepository.createProduto(data);
  }

  static async updateProduto(id: string, data: Partial<Produto>): Promise<Produto> {
    if (data.preco !== undefined && data.preco <= 0) {
      throw new Error("Preço deve ser maior que zero");
    }

    return CatalogoRepository.updateProduto(id, data);
  }

  static async deleteProduto(id: string): Promise<void> {
    return CatalogoRepository.deleteProduto(id);
  }
}
