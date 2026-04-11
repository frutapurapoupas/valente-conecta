'use client'

export function usePDVColaborativo() {
  // Hub de navegação — sem estado próprio, apenas centraliza as rotas
  const menus = [
    {
      id: 'vendas',
      label: 'Vendas',
      descricao: 'Registrar vendas e atender clientes',
      href: '/pdv/venda-busca',
      emoji: '🛒',
      cor: 'from-blue-500 to-indigo-600',
      sombra: 'shadow-blue-200',
    },
    {
      id: 'estoque',
      label: 'Estoque',
      descricao: 'Gerenciar produtos e catálogo',
      href: '/pdv/estoque',
      emoji: '📦',
      cor: 'from-emerald-500 to-green-600',
      sombra: 'shadow-emerald-200',
    },
    {
      id: 'perfil',
      label: 'Perfil',
      descricao: 'Dados da loja e horários',
      href: '/profissional/catalogo',
      emoji: '🏪',
      cor: 'from-purple-500 to-violet-600',
      sombra: 'shadow-purple-200',
    },
    {
      id: 'planos',
      label: 'Planos',
      descricao: 'Assinatura e funcionalidades',
      href: '/admin/master/planos',
      emoji: '⭐',
      cor: 'from-amber-500 to-orange-500',
      sombra: 'shadow-amber-200',
    },
  ]

  return { menus }
}
