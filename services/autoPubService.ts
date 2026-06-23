// services/autoPubService.ts
export const AutoPubService = {
  devePublicarAutomaticamente: (fornecedor: any) => {
    // Regra: Se o fornecedor tem histórico limpo e mais de 5 avaliações > 4.5, publica só
    const temHistoricoBom = fornecedor.avaliacoesPositivas >= 5 && fornecedor.mediaNota >= 4.5;
    const isContaVerificada = fornecedor.verificado === true;

    return temHistoricoBom && isContaVerificada;
  },

  processarCadastro: (fornecedor: any) => {
    if (AutoPubService.devePublicarAutomaticamente(fornecedor)) {
      return { ...fornecedor, status: "publicado", dataPublicacao: new Date().toISOString() };
    }
    return { ...fornecedor, status: "pendente" }; // Requer supervisão do Admin Master
  }
};