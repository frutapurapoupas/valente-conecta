import { IndicacaoRepository } from "../repositories/IndicacaoRepository";
import type { Indicacao, IndicacaoFiltro, IndicacaoStats } from "../types/indicacao";

export class IndicacaoService {
  static async listar(filtro?: IndicacaoFiltro): Promise<Indicacao[]> {
    return IndicacaoRepository.getIndicacoes(filtro);
  }

  static async criar(data: Omit<Indicacao, "id" | "created_at" | "updated_at">): Promise<Indicacao> {
    if (!data.nome_indicante || data.nome_indicante.length < 3) {
      throw new Error("Nome do indicante deve ter pelo menos 3 caracteres");
    }
    if (!data.nome_indicado || data.nome_indicado.length < 3) {
      throw new Error("Nome do indicado deve ter pelo menos 3 caracteres");
    }
    if (!data.telefone_indicado || data.telefone_indicado.length < 10) {
      throw new Error("Telefone do indicado inválido");
    }
    return IndicacaoRepository.createIndicacao(data);
  }

  static async atualizarStatus(id: string, status: string): Promise<Indicacao> {
    const validStatus = ["pendente", "aceito", "concluido", "cancelado"];
    if (!validStatus.includes(status)) throw new Error("Status inválido");
    return IndicacaoRepository.updateStatus(id, status);
  }

  static async obterStats(userId: string): Promise<IndicacaoStats> {
    return IndicacaoRepository.getStats(userId);
  }
}
