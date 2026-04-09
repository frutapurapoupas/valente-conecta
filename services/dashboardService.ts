import { supabase } from '@/lib/supabase'
import { getPendingProductsCount } from './productService'

export interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  totalProducts: number
  pendingProducts: number
  totalOffers: number
  totalTransactions: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [usersRes, companiesRes, productsRes, offersRes, transactionsRes] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('offers').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
  ])

  const pendingProducts = await getPendingProductsCount()

  return {
    totalUsers: usersRes.count || 0,
    totalCompanies: companiesRes.count || 0,
    totalProducts: productsRes.count || 0,
    pendingProducts,
    totalOffers: offersRes.count || 0,
    totalTransactions: transactionsRes.count || 0,
  }
}
