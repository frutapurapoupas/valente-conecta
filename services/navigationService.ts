// services/navigationService.ts
export const NavigationService = {
  // Simula a verificação se existem itens cadastrados naquela categoria
  verificarDisponibilidade: async (categoria: string): Promise<boolean> => {
    // Aqui você integrará com seu banco de dados ou localStorage
    const dados = JSON.parse(localStorage.getItem(`catalogo_${categoria}`) || "[]");
    return dados.length > 0;
  }
};


