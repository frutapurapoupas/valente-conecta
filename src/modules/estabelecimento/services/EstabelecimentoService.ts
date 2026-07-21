import { EstabelecimentoRepository } from "../repositories/EstabelecimentoRepository";
import type { Estabelecimento, EstabelecimentoFiltro, EstabelecimentoStats } from "../types/estabelecimento";

export class EstabelecimentoService {
  static async listar(filtro?: EstabelecimentoFiltro): Promise<Estabelecimento[]> {
    return EstabelecimentoRepository.getEstabelecimentos(filtro);
  }

  static async buscarPorId(id: string): Promise<Estabelecimento | null> {
    return EstabelecimentoRepository.getEstabelecimentoById(id);
  }

  static async criar(data: Omit<Estabelecimento, "id" | "created_at" | "updated_at">): Promise<Estabelecimento> {
    if (!data.nome || data.nome.length < 3) {
      throw new Error("Nome do estabelecimento deve ter pelo menos 3 caracteres");
    }
    if (!data.categoria) {
      throw new Error("Categoria é obrigatória");
    }
    if (!data.endereco || data.endereco.length < 5) {
      throw new Error("Endereço inválido");
    }
    if (!data.cidade) {
      throw new Error("Cidade é obrigatória");
    }
    return EstabelecimentoRepository.createEstabelecimento(data);
  }

  static async aprovar(id: string): Promise<Estabelecimento> {
    return EstabelecimentoRepository.updateStatus(id, "aprovado");
  }

  static async rejeitar(id: string): Promise<Estabelecimento> {
    return EstabelecimentoRepository.updateStatus(id, "rejeitado");
  }

  static async obterStats(): Promise<EstabelecimentoStats> {
    return EstabelecimentoRepository.getStats();
  }
}
