// services/cozinha/clientsService.ts
// Responsabilidade: Buscar clientes da API real
// NÃO contém cores, textos ou estilos

export interface Client {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  totalGasto: number;
  ultimoPedido: string;
  createdAt: string;
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const response = await fetch('/api/cozinha/clientes');
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

export async function getClientsStats(clients: Client[]) {
  const total = clients.length;
  const totalGasto = clients.reduce((sum, c) => sum + (c.totalGasto || 0), 0);
  const ticketMedioCliente = total > 0 ? totalGasto / total : 0;
  
  // Clientes que mais gastaram (top 5)
  const topClientes = [...clients]
    .sort((a, b) => (b.totalGasto || 0) - (a.totalGasto || 0))
    .slice(0, 5)
    .map(c => ({ nome: c.nome, totalGasto: c.totalGasto || 0, pedidos: 0 }));
  
  return { total, totalGasto, ticketMedioCliente, topClientes };
}
