// types/academia/index.ts

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  peso: number;
  altura: number;
  idade: number;
  imc: number;
  gordura?: number;
  nivel: "iniciante" | "intermediario" | "avancado" | "profissional";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "condicionamento" | "saude";
  diasSeguidos: number;
  ultimoTreino?: Date;
  plano: "gratis" | "basico" | "premium";
  status: "ativo" | "inativo";
  createdAt: Date;
}

export interface Exercicio {
  id: number;
  nome: string;
  grupoMuscular: "peito" | "costas" | "pernas" | "ombros" | "bracos" | "abdomen" | "cardio" | "fullbody";
  series: number;
  repeticoes: string;
  peso?: number;
  descanso?: number;
  videoUrl?: string;
  imagem?: string;
}

export interface Treino {
  id: string;
  alunoId: string;
  data: Date;
  exercicios: ExercicioRealizado[];
  duracao: number; // em minutos
  calorias?: number;
  localizacao?: { lat: number; lng: number };
  finalizado: boolean;
}

export interface ExercicioRealizado {
  exercicioId: number;
  nome: string;
  seriesFeitas: number;
  repeticoesFeitas: number;
  pesoUtilizado: number;
  concluido: boolean;
}

export interface Esporte {
  id: number;
  nome: string;
  icone: string;
  localizacao: { lat: number; lng: number; nome: string };
  horario: string;
  participantes: number;
  maxParticipantes: number;
  data: Date;
  criadorId: string;
}

export interface Meta {
  id: string;
  alunoId: string;
  tipo: "peso" | "treinos_semana" | "calorias" | "tempo";
  meta: number;
  atual: number;
  prazo: Date;
  concluida: boolean;
}

export interface CondicaoFisica {
  alunoId: string;
  peso: number;
  altura: number;
  imc: number;
  gordura?: number;
  musculo?: number;
  dataMedicao: Date;
  observacoes?: string;
}
