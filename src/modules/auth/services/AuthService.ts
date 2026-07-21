// ==================================================
// AUTH MODULE - SERVICE
// ==================================================

import { AuthRepository } from "../repositories/AuthRepository";
import type { RegisterData, LoginData, User } from "../types/auth";

export class AuthService {
  static async register(data: RegisterData): Promise<{ user: User; message: string }> {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }

    if (!data.email || !data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (!data.password || data.password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    if (data.password !== data.confirmPassword) {
      throw new Error("Senhas não coincidem");
    }

    const exists = await AuthRepository.checkEmailExists(data.email);
    if (exists) {
      throw new Error("Email já cadastrado");
    }

    return AuthRepository.register(data);
  }

  static async login(data: LoginData): Promise<any> {
    if (!data.email || !data.email.includes("@")) {
      throw new Error("Email inválido");
    }

    if (!data.password || data.password.length < 6) {
      throw new Error("Senha inválida");
    }

    return AuthRepository.login(data);
  }

  static async logout(): Promise<void> {
    return AuthRepository.logout();
  }

  static async getCurrentUser(): Promise<User | null> {
    return AuthRepository.getCurrentUser();
  }
}
