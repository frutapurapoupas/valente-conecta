"use client";
import { CozinhaService } from "@/services/cozinhaService";

// Dentro do seu componente administrativo:
const handleSalvarReceita = (receita: any, precosAtuais: Record<string, number>) => {
  // 1. Calcula o custo total com base na lista de ingredientes da receita
  const custoTotal = CozinhaService.calcularCustoReceita(receita, precosAtuais);
  
  // 2. Aplica a regra de precificaÃ§Ã£o 40/30/30
  const precificacao = CozinhaService.calcularPrecificacao(custoTotal);
  
  // 3. Monta o objeto que serÃ¡ salvo no banco de dados
  const receitaFinal = {
    ...receita,
    custoInsumos: precificacao.custoInsumos,
    precoVenda: precificacao.precoVenda,
    lucroChef: precificacao.lucroChef,
    lucroParceiro: precificacao.lucroParceiro,
    resumoFinanceiro: precificacao.resumo
  };

  console.log("Receita pronta para salvar:", receitaFinal);
  
  // Agora vocÃª pode chamar a sua funÃ§Ã£o de salvar no banco, ex:
  // await salvarNoBanco(receitaFinal);
};

