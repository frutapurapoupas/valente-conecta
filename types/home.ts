// types/home.ts
// 📋 TIPOS COMPARTILHADOS - Home

export interface HomeData {
  // Dados estáticos ou dinâmicos
}

export interface NotificacaoAdmin {
  id: string | number;
  mensagem: string;
  importancia: string;
  data: string;
  status?: string;
}

export interface CategoriaItem {
  nome: string;
  icone: string;
  href: string | null;
}

export interface GridItem {
  titulo: string;
  cor: string;
  icone: string;
  href: string;
}

export interface User {
  id?: string;
  nome?: string;
  name?: string;
  email?: string;
  telefone?: string;
}

