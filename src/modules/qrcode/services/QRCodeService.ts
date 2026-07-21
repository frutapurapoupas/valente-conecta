import { QRCodeRepository } from "../repositories/QRCodeRepository";
import type { QRCode, QRCodeStats } from "../types/qrcode";

export class QRCodeService {
  static async listar(): Promise<QRCode[]> {
    return QRCodeRepository.getQRCodes();
  }

  static async buscarPorId(id: string): Promise<QRCode | null> {
    return QRCodeRepository.getQRCodeById(id);
  }

  static async buscarPorCodigo(codigo: string): Promise<QRCode | null> {
    return QRCodeRepository.getQRCodeByCodigo(codigo);
  }

  static async criar(data: Omit<QRCode, "id" | "created_at" | "updated_at" | "visualizacoes">): Promise<QRCode> {
    if (!data.codigo || data.codigo.length < 3) {
      throw new Error("Código do QR Code deve ter pelo menos 3 caracteres");
    }
    if (!data.referencia_id) {
      throw new Error("Referência é obrigatória");
    }
    return QRCodeRepository.createQRCode(data);
  }

  static async registrarVisualizacao(id: string): Promise<void> {
    return QRCodeRepository.incrementVisualizacao(id);
  }

  static async remover(id: string): Promise<void> {
    return QRCodeRepository.deleteQRCode(id);
  }

  static async obterStats(): Promise<QRCodeStats> {
    return QRCodeRepository.getStats();
  }
}
