// services/receitaService.ts
import { CozinhaService } from "./cozinhaService";

export const ReceitaService = {
  salvarReceita: (nome: string, itens: any[], precoInsumos: number) => {
    // Aplica a regra de precificação definida nas correções
    const financeiro = CozinhaService.calcularPrecoVenda(precoInsumos);
    
    const novaReceita = {
      id: Date.now().toString(),
      nome,
      itens,
      custoTotal: precoInsumos,
      ...financeiro, // precoVenda, lucroChef, lucroParceiro
      dataCriacao: new Date().toISOString()
    };

    const receitas = JSON.parse(localStorage.getItem("cozinha_receitas") || "[]");
    receitas.push(novaReceita);
    localStorage.setItem("cozinha_receitas", JSON.stringify(receitas));
    return novaReceita;
  }
};