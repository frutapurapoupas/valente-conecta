// ==================================================
// ADMIN MODULE - SERVICE
// ==================================================

import { AdminRepository } from "../repositories/AdminRepository";
import type { AdminData, Beneficio, DashboardData, ServicoPago, SyncStatus, Usuario } from "../types/admin";

export class AdminService {
  // Benefícios
  static async getBeneficios(): Promise<Beneficio[]> {
    return AdminRepository.getBeneficios();
  }

  static async createBeneficio(data: Partial<Beneficio>): Promise<Beneficio> {
    return AdminRepository.createBeneficio(data);
  }

  static async updateBeneficio(id: string, data: Partial<Beneficio>): Promise<Beneficio> {
    return AdminRepository.updateBeneficio(id, data);
  }

  static async deleteBeneficio(id: string): Promise<void> {
    return AdminRepository.deleteBeneficio(id);
  }

  // Dashboard
  static async getDashboardData(): Promise<DashboardData> {
    return AdminRepository.getDashboardData();
  }

  // Serviços Pagos
  static async getServicosPagos(): Promise<ServicoPago[]> {
    return AdminRepository.getServicosPagos();
  }

  static async createServicoPago(data: Partial<ServicoPago>): Promise<ServicoPago> {
    return AdminRepository.createServicoPago(data);
  }

  // Sync
  static async getSyncStatus(): Promise<SyncStatus> {
    return AdminRepository.getSyncStatus();
  }

  static async runSync(): Promise<SyncStatus> {
    return AdminRepository.runSync();
  }

  // Usuários
  static async getUsuarios(): Promise<Usuario[]> {
    return AdminRepository.getUsuarios();
  }

  static async createUsuario(data: Partial<Usuario>): Promise<Usuario> {
    return AdminRepository.createUsuario(data);
  }

  static async updateUsuario(id: string, data: Partial<Usuario>): Promise<Usuario> {
    return AdminRepository.updateUsuario(id, data);
  }

  static async deleteUsuario(id: string): Promise<void> {
    return AdminRepository.deleteUsuario(id);
  }
}
