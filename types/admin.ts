export interface User {
  id: string
  name: string
  email?: string
  role?: string
  aprovado?: boolean
  bloqueado?: boolean
  saldo_conecta?: number
  referral_balance?: number
  created_at: string
}

export interface Company {
  id: string
  nome_fantasia: string
  plan?: string
  plano_validade?: string
  aprovado?: boolean
  created_at: string
  [key: string]: unknown
}

export interface Professional {
  id: string
  user_id: string
  is_online?: boolean
  daily_rate?: number
  created_at?: string
  [key: string]: unknown
}

export interface Product {
  id: string
  name: string
  status?: string
  created_at: string
  [key: string]: unknown
}

export interface Offer {
  id: string
  title: string
  status?: string
  created_at: string
  [key: string]: unknown
}

export interface Transaction {
  id: string
  amount: number
  created_at: string
  [key: string]: unknown
}

export interface AdminConfig {
  id?: string
  referral_rates?: Record<string, number>
  [key: string]: unknown
}

export interface DashboardData {
  totalUsers: number
  totalCompanies: number
  totalProducts: number
  pendingProducts: number
  totalOffers: number
  pendingOffers: number
  totalTransactionsMonth: number
  totalConectaCirculating: number
  recentActivities: Activity[]
}

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  userId?: string
  userName?: string
}
