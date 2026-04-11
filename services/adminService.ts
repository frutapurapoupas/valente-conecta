export async function getAdminData() {
  // depois você conecta no Supabase

  return {
    summary: [
      { title: "Usuários", value: "12.450" },
      { title: "Empresas", value: "3.210" },
      { title: "Faturamento", value: "R$ 187.500" },
      { title: "Produtos", value: "1.580" },
    ],

    charts: {
      line: [
        { name: "Jan", users: 10000 },
        { name: "Fev", users: 15000 },
      ],
      pie: [
        { name: "Grátis", value: 25 },
        { name: "Premium", value: 75 },
      ],
      bar: [
        { name: "Jan", value: 8000 },
        { name: "Fev", value: 12000 },
      ],
    },

    reports: [
      "67% das vendas concentradas em 3 empresas",
      "12 empresas com estoque baixo",
    ],
  };
}