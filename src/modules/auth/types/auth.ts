// ==================================================
// AUTH MODULE - TYPES
// ==================================================

export interface User {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  role: "user" | "admin" | "master";
  status: "ativo" | "inativo" | "pendente";
  created_at?: string;
  updated_at?: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  password: string;
  telefone?: string;
  confirmPassword?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface RegisterResponse {
  user: User;
  message: string;
}
