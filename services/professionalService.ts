export interface ProfessionalCatalog {
  userId: string
  daily_rate: number     // Valor da diária
  is_online: boolean     // "Em funcionamento" (Borracharia, Manicure...)
  gallery: string[]      // Fotos do serviço
  availability: string[] // Datas ocupadas nos próximos 120 dias
}

export async function updateProfessionalStatus(userId: string, status: boolean) {
  await supabase.from('professionals').update({ is_online: status }).eq('user_id', userId)
}