// ==================================================
// DEMAND MODULE - SERVICE
// ==================================================

import { DemandRepository } from "../repositories/DemandRepository";
import type { Demand } from "../types/demand";

export class DemandService {
  static async capture(data: Partial<Demand>): Promise<Demand> {
    // Validações de negócio aqui
    if (!data.title) {
      throw new Error("Título é obrigatório");
    }
    return DemandRepository.create(data);
  }

  static async list(): Promise<Demand[]> {
    return DemandRepository.findAll();
  }

  static async update(id: string, data: Partial<Demand>): Promise<Demand> {
    return DemandRepository.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    return DemandRepository.delete(id);
  }

  static async findById(id: string): Promise<Demand | null> {
    return DemandRepository.findById(id);
  }
}
