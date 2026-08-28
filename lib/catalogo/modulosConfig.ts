// Caminho: C:\valente_conecta\lib\catalogo\modulosConfig.ts
//
// Categorias por modulo — unica fonte de verdade usada pela pagina publica,
// pelo admin da loja (LojaAdminShell) e pelo admin master de cada modulo.
// Evita repetir a mesma lista em varios arquivos (MASTER_SPEC secao 2).

import type { ModuloId } from "./marketplaceTypes";

export const CATEGORIAS_POR_MODULO: Record<ModuloId, string[]> = {
  "agua-gas": ["Água Mineral", "Garrafão 20L", "Gás P13", "Gás P20", "Gás P45", "Gás Granel"],
  servicos: ["Profissional autônomo", "Assistência técnica", "Automotivo", "Agro e Campo", "Beleza e estética", "Educação", "Eventos", "Aulas particulares", "Financeiro", "Tecnologia", "Outros serviços"],
  mercados: ["Mercearia", "Hortifruti", "Açougue", "Padaria", "Bebidas"],
  imoveis: ["Casa", "Apartamento", "Terreno", "Comercial", "Rural", "Temporada"],
  emprego: ["CLT", "PJ", "Freelancer", "Estágio", "Temporário"],
  construcao: ["Materiais de construção", "Aluguel de máquinas", "Mão de obra", "Projetos e engenharia"],
  saude: ["Consulta médica", "Odontologia", "Fisioterapia", "Psicologia", "Exames", "Enfermagem", "Farmácia"],
  pet: ["Ração e produtos", "Banho e tosa", "Veterinário", "Adestramento"],
  moda: ["Moda Feminina", "Moda Masculina", "Moda Infantil", "Calçados", "Acessórios"],
  alimentacao: ["Restaurante", "Lanchonete", "Pizzaria", "Bar", "Cafeteria", "Doceria", "Food truck"],
};
