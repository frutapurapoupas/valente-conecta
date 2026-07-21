import { RecargaRepository } from "../repositories/RecargaRepository";
import type { Recarga, RecargaFiltro, RecargaStats } from "../types/recarga";

export class RecargaService {
  static async listar(filtro?: RecargaFiltro): Promise<Recarga[]> {
    return RecargaRepository.getRecargas(filtro);
  }

  static async listarPorUsuario(userId: string): Promise<Recarga[]> {
    if (!userId) throw new Error("Usuário não identificado");
    return RecargaRepository.getRecargasByUser(userId);
  }

  static async criar(data: Omit<Recarga, "id" | "created_at" | "updated_at">): Promise<Recarga> {
    if (!data.usuario_id) throw new Error("Usuário é obrigatório");
    if (!data.valor || data.valor <= 0) throw new Error("Valor deve ser maior que zero");
    if (!data.metodo) throw new Error("Método de pagamento é obrigatório");
    const metodosValidos = ["pix", "cartao", "boleto", "transferencia"];
    if (!metodosValidos.includes(data.metodo)) throw new Error("Método de pagamento inválido");
    return RecargaRepository.createRecarga(data);
  }

  static async confirmar(id: string, transacao_id?: string): Promise<Recarga> {
    return RecargaRepository.updateStatus(id, "confirmado", transacao_id);
  }

  static async cancelar(id: string): Promise<Recarga> {
    return RecargaRepository.updateStatus(id, "cancelado");
  }

  static async obterStats(userId: string): Promise<RecargaStats> {
    return RecargaRepository.getStats(userId);
  }
}
