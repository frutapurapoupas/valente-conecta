// Função utilitária para gerar o link de convite do profissional
export function gerarLinkConvite(profissionalId: string) {
  return `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://valente.app'}/invite/${profissionalId}`
}
