import { supabase } from '@/lib/supabase'

export interface Product {
  id: string
  name: string
  price: number
  status: string
  ean: string
  sku_universal: string
  created_at: string
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50)
  return data || []
}

export async function getPendingProductsCount(): Promise<number> {
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).in('status', ['pending_completion', 'pending_sync'])
  return count || 0
}

export async function getProductStats(): Promise<{ total: number; active: number; pending: number }> {
  const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: active } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const pending = await getPendingProductsCount()
  return { total: total || 0, active: active || 0, pending }
}
