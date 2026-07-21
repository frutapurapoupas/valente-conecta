// components/admin/menu/types.ts
// ðŸ“‹ TIPOS - Interfaces de AutomaÃ§Ã£o

import { LucideIcon } from "lucide-react";

// ============================================================
// TIPOS EXISTENTES
// ============================================================

export type MenuStatus = 'active' | 'construction' | 'coming-soon';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  status?: MenuStatus;
}

export interface MenuGroup {
  name: string;
  icon: LucideIcon;
  collapsible?: boolean;
  items: MenuItem[];
  description?: string;
}

export type AdminMenu = MenuGroup[];

// ============================================================
// ðŸ†• TIPOS DE AUTOMAÃ‡ÃƒO
// ============================================================

export type LojistaStatus = 'pendente' | 'aprovado' | 'reprovado' | 'suspenso' | 'automatico';

export interface Lojista {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  categoria: string;
  status: LojistaStatus;
  dataCriacao: string;
  dataAprovacao?: string;
  scoreConfianca: number; // 0-100
  totalAvaliacoes: number;
  avaliacaoMedia: number;
  denuncias: number;
  possuiFoto: boolean;
  descricaoCompleta: boolean;
  ultimaAtividade: string;
}

export interface RegraAprovacao {
  id: string;
  nome: string;
  condicao: (lojista: Lojista) => boolean;
  acao: 'aprovar' | 'reprovar' | 'suspender' | 'notificar';
  prioridade: number;
}

export interface Notificacao {
  id: string;
  tipo: 'alerta' | 'denuncia' | 'aprovacao' | 'suspensao';
  mensagem: string;
  lojistaId: string;
  data: string;
  lida: boolean;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface MonitorMetrics {
  totalLojistas: number;
  pendentes: number;
  aprovados: number;
  suspensos: number;
  comDenuncia: number;
  comBaixaQualidade: number;
  autoAprovados: number;
}

