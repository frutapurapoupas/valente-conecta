'use client'

export function useAdminBonus() {
  const metricasGerais = {
    usuariosValidados: 840,
    linksPendentes: 125,
    totalProvisãoResgate: 4250.00,
  }

  const relatorioBonus = [
    {
      id: 1, usuario: 'João Silva',
      bonusIndicacao: 50.00, outrosBonus: 15.00,
      linksEnviados: 12, linksValidados: 10,
      statusResgate: 'Disponível',
    },
    {
      id: 2, usuario: 'Maria Oliveira',
      bonusIndicacao: 120.00, outrosBonus: 40.00,
      linksEnviados: 35, linksValidados: 24,
      statusResgate: 'Processando',
    },
    {
      id: 3, usuario: 'Carlos Souza',
      bonusIndicacao: 10.00, outrosBonus: 0.00,
      linksEnviados: 5, linksValidados: 2,
      statusResgate: 'Abaixo do Mínimo',
    },
  ]

  return { metricasGerais, relatorioBonus }
}
