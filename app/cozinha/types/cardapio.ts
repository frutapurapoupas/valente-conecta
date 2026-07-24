export interface CardapioItem {
  id: string;
  dia: string;
  precoEspecial?: number;
  produto?: {
    nome: string;
  };
}