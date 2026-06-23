// services/producaoService.ts
import { EstoqueService } from "./estoqueService";

export const ProducaoService = {
  concluirProducao: (receita: any) => {
    // Ao concluir, deduz os insumos do estoque
    receita.itens.forEach((item: any) => {
      const estoqueAtual = EstoqueService.getEstoque();
      const itemEstoque = estoqueAtual.find((i: any) => i.nome === item.nome);
      if (itemEstoque) {
        const novaQuantidade = itemEstoque.quantidade - item.quantidade;
        EstoqueService.atualizarEstoque(item.nome, novaQuantidade);
      }
    });
    
    // Atualiza status no localStorage
    const producoes = JSON.parse(localStorage.getItem("cozinha_producao") || "[]");
    const index = producoes.findIndex((p: any) => p.id === receita.id);
    if (index !== -1) {
      producoes[index].status = "concluido";
      localStorage.setItem("cozinha_producao", JSON.stringify(producoes));
    }
  }
};