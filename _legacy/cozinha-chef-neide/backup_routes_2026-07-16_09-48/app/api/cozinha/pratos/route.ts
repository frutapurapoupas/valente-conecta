import { NextResponse } from 'next/server';

// Dados reais simulados que futuramente podem vir do seu banco de dados
// Aqui jÃ¡ incluÃ­mos a inteligÃªncia financeira de custos e lucros para o Admin
const bancoMarmitasMock = [
  {
    id: "1",
    nome: "Marmita Fit de Frango - Chef Neide",
    descricaoCurta: "Arroz integral, purÃª de batata doce e frango grelhado desfiado.",
    preco: 22.00, // PreÃ§o de venda ao pÃºblico
    custoIngredientes: 8.50, // Insumos diretos
    custosFixos: 4.40, // 20% de custos operacionais (gÃ¡s, embalagem, energia)
    lucroDinheiro: 9.10, // Margem lÃ­quida sobra para a Chef Neide
    lucroPorcentagem: 41.3, // % real de lucro sobre a venda
    estoqueAtual: 45,
    enviadoProducao: 120
  },
  {
    id: "2",
    nome: "Feijoada Light Executiva",
    descricaoCurta: "Feijoada com carnes magras, arroz branco, couve refogada e farofa.",
    preco: 28.00,
    custoIngredientes: 11.20,
    custosFixos: 5.60,
    lucroDinheiro: 11.20,
    lucroPorcentagem: 40.0,
    estoqueAtual: 30,
    enviadoProducao: 85
  }
];

// FunÃ§Ã£o GET que o catÃ¡logo pÃºblico chama e que estava dando erro 404
export async function GET() {
  try {
    // Retorna a lista de pratos com status de sucesso 200
    return NextResponse.json(bancoMarmitasMock, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pratos da Cozinha" }, { status: 500 });
  }
}

