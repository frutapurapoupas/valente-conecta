// app/empregos/types/index.ts

// ============================================================================
// TIPOS PRINCIPAIS
// ============================================================================

export type TipoVaga = "CLT" | "PJ" | "Freelancer" | "Estágio" | "Temporário";
export type Modalidade = "Presencial" | "Remoto" | "Híbrido";
export type StatusVaga = "aberta" | "fechada" | "em_andamento";
export type StatusCandidatura = "pendente" | "analise" | "aprovada" | "rejeitada";
export type NivelExperiencia = "Estagiário" | "Júnior" | "Pleno" | "Sênior" | "Especialista";

// ============================================================================
// VAGA
// ============================================================================

export interface Vaga {
  id: string;
  titulo: string;
  empresa: string;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
  tipo: TipoVaga;
  modalidade: Modalidade;
  nivel: NivelExperiencia;
  salarioMin?: number;
  salarioMax?: number;
  localizacao: string;
  status: StatusVaga;
  dataPublicacao: string;
  dataEncerramento?: string;
  link?: string;
  candidatos?: number;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ============================================================================
// CURRÍCULO
// ============================================================================

export interface Curriculo {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  objetivo: string;
  experiencias: Experiencia[];
  educacao: Educacao[];
  habilidades: string[];
  idiomas: Idioma[];
  certificacoes: Certificacao[];
  status: "ativo" | "inativo";
  criadoEm: string;
  atualizadoEm: string;
}

export interface Experiencia {
  id: string;
  empresa: string;
  cargo: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  atual: boolean;
}

export interface Educacao {
  id: string;
  instituicao: string;
  curso: string;
  nivel: "fundamental" | "medio" | "tecnico" | "graduacao" | "pos" | "mestrado" | "doutorado";
  dataInicio: string;
  dataFim?: string;
  cursando: boolean;
}

export interface Idioma {
  id: string;
  nome: string;
  nivel: "basico" | "intermediario" | "avancado" | "fluente" | "nativo";
}

export interface Certificacao {
  id: string;
  nome: string;
  emissor: string;
  data: string;
  url?: string;
}

// ============================================================================
// CANDIDATURA
// ============================================================================

export interface Candidatura {
  id: string;
  vagaId: string;
  vagaTitulo: string;
  vagaEmpresa: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  status: StatusCandidatura;
  mensagem?: string;
  curriculoId?: string;
  dataCandidatura: string;
  dataAtualizacao: string;
  feedback?: string;
}

// ============================================================================
// FILTROS
// ============================================================================

export interface FiltrosVaga {
  busca?: string;
  tipo?: TipoVaga;
  modalidade?: Modalidade;
  nivel?: NivelExperiencia;
  status?: StatusVaga;
  localizacao?: string;
  salarioMin?: number;
  salarioMax?: number;
}

