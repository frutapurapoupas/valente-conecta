// types/academia/index.ts

export interface ExercicioUsuario {
  id: string;
  nome: string;
  grupoMuscular: string;
  intensidade: 'baixa' | 'media' | 'alta';
  tempoPrevisto: number;
  cargaAtual: number;
  cargaMeta: number;
  concluido: boolean;
  dataConclusao?: string;
  caloriasEstimadas: number;
}

export interface RegistroTreino {
  id: string;
  data: string;
  exercicios: {
    nome: string;
    cargaUtilizada: number;
    series: number;
    repeticoes: string;
    intensidade: string;
  }[];
  duracaoTotal: number;
  caloriasTotal: number;
}

export interface PerfilUsuario {
  nome: string;
  peso_atual: number;
  peso_meta: number;
  altura: number;
  idade: number;
  sexo: string;
  objetivo: string;
  nivel: string;
  freq_semanal: number;
}
