export type ClassificadoTipo = "produto" | "servico";

export type CategoriaConfig = {
  nome: string;
  tipo: ClassificadoTipo | "ambos";
  sublabel?: string;
};

export const CLASSIFICADOS_CATEGORIAS: CategoriaConfig[] = [
  { nome: "Tecnologia", tipo: "ambos", sublabel: "Eletrônicos, informática e serviços de TI" },
  { nome: "Casa e Construção", tipo: "ambos", sublabel: "Materiais, móveis, reparos e manutenção" },
  { nome: "Saúde e Beleza", tipo: "ambos", sublabel: "Produtos, estética e bem-estar" },
  { nome: "Automotivo", tipo: "ambos", sublabel: "Veículos, peças e serviços automotivos" },
  { nome: "Educação", tipo: "ambos", sublabel: "Livros, cursos, aulas e treinamentos" },
  { nome: "Moda e Acessórios", tipo: "ambos", sublabel: "Roupas, acessórios e costura" },
  { nome: "Alimentação", tipo: "ambos", sublabel: "Produtos, delivery e serviços gastronômicos" },
  { nome: "Entretenimento e Lazer", tipo: "ambos", sublabel: "Eventos, turismo, esportes e lazer" },
  { nome: "Serviços Profissionais", tipo: "servico", sublabel: "Consultoria, assessoria e expertise" },
  { nome: "Serviços Domésticos e Pessoais", tipo: "ambos", sublabel: "Limpeza, utensílios e cuidados pessoais" },
  { nome: "Agro e Indústria", tipo: "ambos", sublabel: "Máquinas, insumos e serviços B2B" },
];

export const CIDADES_PADRAO = [
  "Valente",
  "São Domingos",
  "Conceição do Coité",
  "Retirolândia",
  "Santaluz",
  "Santa Luz",
  "Valilândia",
];

export function normalizarTipo(value?: string | null): ClassificadoTipo {
  const v = (value || "").toLowerCase().trim();
  return v === "servico" ? "servico" : "produto";
}

export function formatarPreco(valor?: number | null) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "A combinar";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

export function formatarDataRelativa(data?: string | null) {
  if (!data) return "";

  const date = new Date(data);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias < 7) return `${diffDias}d atrás`;

  return date.toLocaleDateString("pt-BR");
}