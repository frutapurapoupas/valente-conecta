export function calcularAgenda(servicos: any[]) {
  // Lógica de Escassez: Cliente só vê 60 dias à frente
  const diasVisiveis = 60;
  
  // Lógica 120/60: Adiciona 60min de gap em serviços longos
  const agendaProcessada = servicos.map(s => ({
    ...s,
    duracaoTotal: s.minutos >= 120 ? s.minutos + 60 : s.minutos
  }));

  return { agendaProcessada, diasVisiveis };
}