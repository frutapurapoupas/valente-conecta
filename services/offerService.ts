import { supabase } from '@/lib/supabase'

export interface Offer {
  id: string
  user_id: string
  title: string       // Nome do produto/serviço/emprego/aluguel
  description?: string
  price: number
  address: string     // Deve ser validado com a cidade base
  city_base: string
  image_url: string   // Obrigatória 1 foto
  status: 'active' | 'pending' | 'sold'
}

export async function createOffer(offer: Omit<Offer, 'id'>) {
  // A lógica de validação: Endereço deve conter a cidade base
  if (!offer.address.toLowerCase().includes(offer.city_base.toLowerCase())) {
    throw new Error(`O endereço deve ser obrigatoriamente em ${offer.city_base}`)
  }

  const { data, error } = await supabase.from('offers').insert(offer)
  if (error) throw error
  return data
}