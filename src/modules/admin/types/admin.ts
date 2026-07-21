// ==================================================
// ADMIN MODULE - TYPES
// ==================================================

export interface Beneficio {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  tipo: "desconto" | "bonus" | "voucher";
  validade?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardData {
  totalUsuarios: number;
  totalBeneficios: number;
  totalServicosPagos: number;
  ultimoSync: any;
}

export interface ServicoPago {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  status: "ativo" | "inativo" | "pendente";
  created_at?: string;
  updated_at?: string;
}

export interface SyncStatus {
  status: "idle" | "running" | "completed" | "error";
  lastSync: string | null;
}

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: "admin" | "user" | "master";
  status: "ativo" | "inativo" | "pendente";
  created_at?: string;
  updated_at?: string;
}

export interface AdminData {
  beneficios: Beneficio[];
  dashboard: DashboardData;
  servicosPagos: ServicoPago[];
  syncStatus: SyncStatus;
  usuarios: Usuario[];
}
