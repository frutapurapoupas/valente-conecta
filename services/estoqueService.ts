// services/estoqueService.ts
export const EstoqueService = {
  // Lista todos os itens do estoque
  getEstoque: () => {
    const estoque = localStorage.getItem("cozinha_estoque");
    return estoque ? JSON.parse(estoque) : [];
  },

  // Identifica itens abaixo do mÃ­nimo e gera a lista automaticamente
  gerarListaComprasAutomatica: () => {
    const estoque = EstoqueService.getEstoque();
    return estoque.filter((item: any) => item.quantidade <= item.minimo)
                  .map((item: any) => ({
                    nome: item.nome,
                    quantidadeParaComprar: item.minimo - item.quantidade + item.bufferSeguranca
                  }));
  },

  // Atualiza um item apÃ³s compra
  atualizarEstoque: (nomeItem: string, novaQuantidade: number) => {
    const estoque = EstoqueService.getEstoque();
    const index = estoque.findIndex((i: any) => i.nome === nomeItem);
    if (index !== -1) {
      estoque[index].quantidade = novaQuantidade;
      localStorage.setItem("cozinha_estoque", JSON.stringify(estoque));
    }
  }
};


