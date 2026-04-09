// criar-admin-estrutura.js
const fs = require('fs');
const path = require('path');

const basePath = __dirname;

// Estrutura de pastas e arquivos
const estrutura = {
  'types': {
    'admin.ts': `// c:\\valente_conecta\\types\\admin.ts

export type UserRole = 'user' | 'professional' | 'company' | 'admin_master'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  cidadeBase: string
  cidadeAtual: string
  saldoConecta: number
  consultasGratisHoje: number
  createdAt: string
  approved: boolean
  blocked: boolean
  indicacoes: {
    codigo: string
    usuariosIndicados: number
    bonusRecebido: number
  }
  plano?: 'free' | 'basic' | 'premium'
  planoValidade?: string
}

export interface Company extends User {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  logomarca?: string
  planoContabilidade?: boolean
  planoFiscal?: boolean
  modoEspiao?: boolean
  pdvExistente?: string
}

export interface Professional extends User {
  cpf: string
  especialidade: string
  registro?: string
}

export interface Product {
  id: string
  ean?: string
  skuUniversal?: string
  name: string
  description?: string
  price: number
  stock?: number
  photos: string[]
  status: 'active' | 'pending_completion' | 'pending_sync' | 'rejected'
  createdBy: string
  createdAt: string
  updatedAt: string
  empresaId?: string
}

export interface Offer {
  id: string
  title: string
  description: string
  photos: string[]
  category: string
  location: {
    lat: number
    lng: number
    address: string
  }
  contactRevealed: boolean
  status: 'pending' | 'approved' | 'rejected'
  userId: string
  createdAt: string
}

export interface Transaction {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: 'purchase' | 'transfer' | 'bonus' | 'compensation'
  description: string
  cidade: string
  createdAt: string
  compensated: boolean
  compensationDate?: string
}

export interface AdminConfig {
  maxPhotosPerProduct: number
  extraConsultaValue: number
  unlockOtherCityValue: number
  carouselImages: string[]
  bonusIndicacaoUser: number
  bonusIndicacaoCompany: number
  freeDailyQueries: number
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
  type: 'user_register' | 'company_register' | 'product_pending' | 'offer_created' | 'transaction'
  description: string
  userId?: string
  userName?: string
  timestamp: string
}
`
  },
  'services': {
    'admin.ts': `// c:\\valente_conecta\\services\\admin.ts

import { supabase } from '@/lib/supabase'
import { 
  User, Company, Professional, Product, Offer, 
  Transaction, AdminConfig, DashboardData, Activity 
} from '@/types/admin'

// ==================== DASHBOARD ====================

export async function getDashboardData(): Promise<DashboardData> {
  const [
    { count: totalUsers },
    { count: totalCompanies },
    { count: totalProducts },
    { count: pendingProducts },
    { count: totalOffers },
    { count: pendingOffers },
    transactionsData,
    recentActivities
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true })
      .in('status', ['pending_completion', 'pending_sync']),
    supabase.from('offers').select('*', { count: 'exact', head: true }),
    supabase.from('offers').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    getTransactionsLastMonth(),
    getRecentActivities()
  ])

  const totalTransactionsMonth = transactionsData?.length || 0
  const totalConectaCirculating = transactionsData?.reduce((sum, t) => sum + t.amount, 0) || 0

  return {
    totalUsers: totalUsers || 0,
    totalCompanies: totalCompanies || 0,
    totalProducts: totalProducts || 0,
    pendingProducts: pendingProducts || 0,
    totalOffers: totalOffers || 0,
    pendingOffers: pendingOffers || 0,
    totalTransactionsMonth,
    totalConectaCirculating,
    recentActivities: recentActivities || []
  }
}

async function getTransactionsLastMonth(): Promise<Transaction[]> {
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .gte('createdAt', lastMonth.toISOString())
  
  return data || []
}

async function getRecentActivities(): Promise<Activity[]> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const [newUsers, newCompanies, pendingProductsList, newOffers] = await Promise.all([
    supabase.from('users').select('id, name, createdAt').gte('createdAt', yesterday.toISOString()).limit(10),
    supabase.from('companies').select('id, nomeFantasia, createdAt').gte('createdAt', yesterday.toISOString()).limit(10),
    supabase.from('products').select('id, name, createdAt, status').in('status', ['pending_completion', 'pending_sync']).limit(10),
    supabase.from('offers').select('id, title, createdAt, status').eq('status', 'pending').limit(10)
  ])

  const activities: Activity[] = []

  newUsers.data?.forEach(u => {
    activities.push({
      id: u.id,
      type: 'user_register',
      description: \`Novo usuário: \${u.name}\`,
      userId: u.id,
      userName: u.name,
      timestamp: u.createdAt
    })
  })

  newCompanies.data?.forEach(c => {
    activities.push({
      id: c.id,
      type: 'company_register',
      description: \`Nova empresa: \${c.nomeFantasia}\`,
      userId: c.id,
      userName: c.nomeFantasia,
      timestamp: c.createdAt
    })
  })

  pendingProductsList.data?.forEach(p => {
    activities.push({
      id: p.id,
      type: 'product_pending',
      description: \`Produto pendente: \${p.name} (\${p.status === 'pending_completion' ? 'complementação' : 'sincronização'})\`,
      timestamp: p.createdAt
    })
  })

  newOffers.data?.forEach(o => {
    activities.push({
      id: o.id,
      type: 'offer_created',
      description: \`Nova oferta aguardando moderação: \${o.title}\`,
      timestamp: o.createdAt
    })
  })

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20)
}

// ==================== USUÁRIOS ====================

export async function getUsers(filters?: { role?: string, approved?: boolean, blocked?: boolean }): Promise<User[]> {
  let query = supabase.from('users').select('*')
  
  if (filters?.role) query = query.eq('role', filters.role)
  if (filters?.approved !== undefined) query = query.eq('approved', filters.approved)
  if (filters?.blocked !== undefined) query = query.eq('blocked', filters.blocked)
  
  const { data, error } = await query.order('createdAt', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function approveUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ approved: true })
    .eq('id', userId)
  
  if (error) throw new Error(error.message)
  
  await notifyUser(userId, 'approved')
}

export async function blockUser(userId: string, blocked: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ blocked })
    .eq('id', userId)
  
  if (error) throw new Error(error.message)
}

export async function updateUserSaldo(userId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
  const { data: user } = await supabase
    .from('users')
    .select('saldoConecta')
    .eq('id', userId)
    .single()
  
  const newSaldo = operation === 'add' 
    ? (user?.saldoConecta || 0) + amount 
    : (user?.saldoConecta || 0) - amount
  
  const { error } = await supabase
    .from('users')
    .update({ saldoConecta: newSaldo })
    .eq('id', userId)
  
  if (error) throw new Error(error.message)
}

// ==================== EMPRESAS ====================

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('createdAt', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data || []
}

export async function createOrUpdateCompany(company: Partial<Company>): Promise<Company> {
  if (company.id) {
    const { data, error } = await supabase
      .from('companies')
      .update(company)
      .eq('id', company.id)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  } else {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    return data
  }
}

export async function approveCompany(companyId: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ approved: true })
    .eq('id', companyId)
  
  if (error) throw new Error(error.message)
  
  await notifyUser(companyId, 'company_approved')
}

export async function updateCompanyPlan(companyId: string, plano: string, validade: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .update({ plano, planoValidade: validade })
    .eq('id', companyId)
  
  if (error) throw new Error(error.message)
}

// ==================== CATÁLOGO (PRODUTOS) ====================

export async function getPendingProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, empresas(nomeFantasia)')
    .in('status', ['pending_completion', 'pending_sync'])
    .order('createdAt', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data || []
}

export async function approveProduct(productId: string, complementData?: Partial<Product>): Promise<void> {
  const updateData: Partial<Product> = { status: 'active' }
  
  if (complementData) {
    Object.assign(updateData, complementData)
  }
  
  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)
  
  if (error) throw new Error(error.message)
}

export async function rejectProduct(productId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'rejected' })
    .eq('id', productId)
  
  if (error) throw new Error(error.message)
  
  const { data: product } = await supabase
    .from('products')
    .select('createdBy')
    .eq('id', productId)
    .single()
  
  if (product?.createdBy) {
    await notifyUser(product.createdBy, 'product_rejected', { reason })
  }
}

export async function getPublicBankProducts(search: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('public_products_bank')
    .select('*')
    .ilike('name', \`%\${search}%\`)
    .limit(20)
  
  if (error) throw new Error(error.message)
  return data || []
}

// ==================== OFERTAS ====================

export async function getPendingOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*, users(name)')
    .eq('status', 'pending')
    .order('createdAt', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data || []
}

export async function approveOffer(offerId: string): Promise<void> {
  const { error } = await supabase
    .from('offers')
    .update({ status: 'approved' })
    .eq('id', offerId)
  
  if (error) throw new Error(error.message)
}

export async function rejectOffer(offerId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('id', offerId)
  
  if (error) throw new Error(error.message)
  
  const { data: offer } = await supabase
    .from('offers')
    .select('userId')
    .eq('id', offerId)
    .single()
  
  if (offer?.userId) {
    await notifyUser(offer.userId, 'offer_rejected', { reason })
  }
}

// ==================== FINANCEIRO ====================

export async function getTransactionsForCompensation(cidade?: string): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('compensated', false)
  
  if (cidade) query = query.eq('cidade', cidade)
  
  const { data, error } = await query.order('createdAt', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data || []
}

export async function compensateTransactions(transactionIds: string[]): Promise<void> {
  const now = new Date().toISOString()
  
  const { error } = await supabase
    .from('transactions')
    .update({ compensated: true, compensationDate: now })
    .in('id', transactionIds)
  
  if (error) throw new Error(error.message)
  
  await registerCompensationDREX(transactionIds)
}

async function registerCompensationDREX(transactionIds: string[]): Promise<void> {
  console.log('Registrando compensação no DREX para transações:', transactionIds)
}

// ==================== CONFIGURAÇÕES ====================

export async function getAdminConfig(): Promise<AdminConfig> {
  const { data, error } = await supabase
    .from('admin_config')
    .select('*')
    .single()
  
  if (error) {
    return {
      maxPhotosPerProduct: 2,
      extraConsultaValue: 1,
      unlockOtherCityValue: 30,
      carouselImages: [],
      bonusIndicacaoUser: 1,
      bonusIndicacaoCompany: 2,
      freeDailyQueries: 5
    }
  }
  
  return data
}

export async function updateAdminConfig(config: Partial<AdminConfig>): Promise<void> {
  const { error } = await supabase
    .from('admin_config')
    .update(config)
    .eq('id', 1)
  
  if (error) throw new Error(error.message)
}

// ==================== NOTIFICAÇÕES ====================

async function notifyUser(userId: string, type: string, extra?: any): Promise<void> {
  console.log(\`Notificando usuário \${userId} sobre \${type}\`, extra)
  
  await supabase.from('notifications').insert({
    userId,
    type,
    data: extra,
    read: false,
    createdAt: new Date().toISOString()
  })
}

// ==================== SUPORTE ====================

export async function getCidadesCadastradas(): Promise<string[]> {
  const { data, error } = await supabase
    .from('cidades')
    .select('nome')
  
  if (error) throw new Error(error.message)
  return data?.map(c => c.nome) || []
}

export async function unlockCityForUser(userId: string, cidade: string, days: number = 30): Promise<void> {
  const validade = new Date()
  validade.setDate(validade.getDate() + days)
  
  const { error } = await supabase
    .from('user_city_access')
    .upsert({
      userId,
      cidade,
      validade: validade.toISOString()
    })
  
  if (error) throw new Error(error.message)
}
`
  },
  'hooks': {
    'useAdmin.ts': `// c:\\valente_conecta\\hooks\\useAdmin.ts

import { useState, useEffect, useCallback } from 'react'
import { 
  getDashboardData, getUsers, getCompanies, getPendingProducts, 
  getPendingOffers, getAdminConfig, approveUser, blockUser, 
  approveProduct, rejectProduct, approveOffer, rejectOffer,
  compensateTransactions, updateAdminConfig, updateCompanyPlan,
  getTransactionsForCompensation
} from '@/services/admin'
import type { 
  DashboardData, User, Company, Product, Offer, 
  AdminConfig, Transaction 
} from '@/types/admin'

export function useAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getDashboardData()
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getUsers(filters)
      setUsers(result)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleApprove = async (userId: string) => {
    await approveUser(userId)
    await fetchUsers()
  }

  const handleBlock = async (userId: string, block: boolean) => {
    await blockUser(userId, block)
    await fetchUsers()
  }

  return { users, loading, filters, setFilters, handleApprove, handleBlock, refetch: fetchUsers }
}

export function usePendingProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getPendingProducts()
      setProducts(result)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleApprove = async (productId: string, complementData?: Partial<Product>) => {
    await approveProduct(productId, complementData)
    await fetchProducts()
  }

  const handleReject = async (productId: string, reason: string) => {
    await rejectProduct(productId, reason)
    await fetchProducts()
  }

  return { products, loading, handleApprove, handleReject, refetch: fetchProducts }
}

export function usePendingOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getPendingOffers()
      setOffers(result)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const handleApprove = async (offerId: string) => {
    await approveOffer(offerId)
    await fetchOffers()
  }

  const handleReject = async (offerId: string, reason: string) => {
    await rejectOffer(offerId, reason)
    await fetchOffers()
  }

  return { offers, loading, handleApprove, handleReject, refetch: fetchOffers }
}

export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getAdminConfig()
      setConfig(result)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = async (newConfig: Partial<AdminConfig>) => {
    await updateAdminConfig(newConfig)
    await fetchConfig()
  }

  return { config, loading, updateConfig, refetch: fetchConfig }
}

export function useMonthlyCompensation() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async (cidade?: string) => {
    try {
      setLoading(true)
      const result = await getTransactionsForCompensation(cidade)
      setTransactions(result)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCompensate = async (transactionIds: string[]) => {
    await compensateTransactions(transactionIds)
    await fetchTransactions()
  }

  return { transactions, loading, handleCompensate, refetch: fetchTransactions }
}
`
  },
  'app/admin/dashboard': {
    'page.tsx': `// c:\\valente_conecta\\app\\admin\\dashboard\\page.tsx

'use client'

import { useAdminDashboard } from '@/hooks/useAdmin'
import { 
  Users, Building2, Package, AlertCircle, 
  Megaphone, TrendingUp, Coins, Activity 
} from 'lucide-react'

export default function AdminDashboard() {
  const { data, loading, error } = useAdminDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-3xl text-gray-500">Carregando dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8">
        <p className="text-red-600 text-2xl">Erro ao carregar dados: {error}</p>
      </div>
    )
  }

  const cards = [
    { title: 'Usuários', value: data?.totalUsers || 0, icon: Users, bgLight: 'bg-blue-50', color: 'text-blue-500' },
    { title: 'Empresas', value: data?.totalCompanies || 0, icon: Building2, bgLight: 'bg-purple-50', color: 'text-purple-500' },
    { title: 'Produtos', value: data?.totalProducts || 0, icon: Package, bgLight: 'bg-orange-50', color: 'text-orange-500' },
    { title: 'Pendentes', value: data?.pendingProducts || 0, icon: AlertCircle, bgLight: 'bg-red-50', color: 'text-red-500' },
    { title: 'Ofertas', value: data?.totalOffers || 0, icon: Megaphone, bgLight: 'bg-pink-50', color: 'text-pink-500' },
    { title: 'Ofertas Pendentes', value: data?.pendingOffers || 0, icon: AlertCircle, bgLight: 'bg-yellow-50', color: 'text-yellow-500' },
    { title: 'Transações (mês)', value: data?.totalTransactionsMonth || 0, icon: TrendingUp, bgLight: 'bg-green-50', color: 'text-green-500' },
    { title: 'Conecta em circulação', value: \`R$ \${(data?.totalConectaCirculating || 0).toFixed(2)}\`, icon: Coins, bgLight: 'bg-emerald-50', color: 'text-emerald-500' }
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-5xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-2xl text-gray-500 mt-4">Visão geral do ecossistema Valente Conecta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className={\`p-5 rounded-xl \${card.bgLight}\`}>
                  <Icon className={\`w-12 h-12 \${card.color}\`} />
                </div>
              </div>
              <p className="text-3xl font-semibold text-gray-700">{card.value}</p>
              <p className="text-xl text-gray-500 mt-3">{card.title}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-10">
        <div className="flex items-center gap-4 mb-8">
          <Activity className="w-12 h-12 text-blue-500" />
          <h2 className="text-4xl font-bold">Atividades Recentes</h2>
        </div>
        
        {data?.recentActivities && data.recentActivities.length > 0 ? (
          <div className="space-y-6">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-6 p-6 border-b last:border-0">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-3"></div>
                <div>
                  <p className="text-2xl text-gray-800">{activity.description}</p>
                  <p className="text-lg text-gray-400 mt-2">
                    {new Date(activity.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-2xl text-gray-500 text-center py-12">Nenhuma atividade recente</p>
        )}
      </div>
    </div>
  )
}
`
  },
  'app/admin/usuarios': {
    'page.tsx': `// c:\\valente_conecta\\app\\admin\\usuarios\\page.tsx

'use client'

import { useState } from 'react'
import { useAdminUsers } from '@/hooks/useAdmin'
import { Users, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react'

export default function AdminUsers() {
  const { users, loading, filters, setFilters, handleApprove, handleBlock } = useAdminUsers()
  const [selectedUser, setSelectedUser] = useState<any>(null)

  if (loading) {
    return <div className="text-center text-3xl py-20">Carregando usuários...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-800">Usuários</h1>
          <p className="text-2xl text-gray-500 mt-4">Gerencie todos os usuários da plataforma</p>
        </div>
        <div className="flex gap-4">
          <select 
            className="px-6 py-4 border-2 rounded-xl text-xl"
            onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined })}
          >
            <option value="">Todos os tipos</option>
            <option value="user">Usuários comuns</option>
            <option value="professional">Profissionais</option>
            <option value="company">Empresas</option>
          </select>
          <select 
            className="px-6 py-4 border-2 rounded-xl text-xl"
            onChange={(e) => setFilters({ ...filters, approved: e.target.value === 'approved' ? true : e.target.value === 'pending' ? false : undefined })}
          >
            <option value="">Todos</option>
            <option value="approved">Aprovados</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 text-2xl font-semibold">Nome</th>
              <th className="text-left p-6 text-2xl font-semibold">Email</th>
              <th className="text-left p-6 text-2xl font-semibold">Tipo</th>
              <th className="text-left p-6 text-2xl font-semibold">Cidade</th>
              <th className="text-left p-6 text-2xl font-semibold">Saldo</th>
              <th className="text-left p-6 text-2xl font-semibold">Status</th>
              <th className="text-left p-6 text-2xl font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-6 text-xl">{user.name}</td>
                <td className="p-6 text-xl">{user.email}</td>
                <td className="p-6 text-xl">
                  {user.role === 'user' && 'Usuário'}
                  {user.role === 'professional' && 'Profissional'}
                  {user.role === 'company' && 'Empresa'}
                  {user.role === 'admin_master' && 'Admin'}
                </td>
                <td className="p-6 text-xl">{user.cidadeBase}</td>
                <td className="p-6 text-xl">R$ {user.saldoConecta.toFixed(2)}</td>
                <td className="p-6">
                  {user.approved ? (
                    <span className="flex items-center gap-2 text-green-600 text-xl">
                      <CheckCircle className="w-6 h-6" /> Aprovado
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-yellow-600 text-xl">
                      <XCircle className="w-6 h-6" /> Pendente
                    </span>
                  )}
                </td>
                <td className="p-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                    {!user.approved && (
                      <button 
                        onClick={() => handleApprove(user.id)}
                        className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleBlock(user.id, !user.blocked)}
                      className={\`p-3 rounded-xl text-white \${user.blocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}\`}
                    >
                      {user.blocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-12 max-w-3xl w-full">
            <h2 className="text-4xl font-bold mb-6">Detalhes do Usuário</h2>
            <div className="space-y-4">
              <p><strong className="text-xl">Nome:</strong> <span className="text-xl">{selectedUser.name}</span></p>
              <p><strong className="text-xl">Email:</strong> <span className="text-xl">{selectedUser.email}</span></p>
              <p><strong className="text-xl">Tipo:</strong> <span className="text-xl">{selectedUser.role}</span></p>
              <p><strong className="text-xl">Cidade Base:</strong> <span className="text-xl">{selectedUser.cidadeBase}</span></p>
              <p><strong className="text-xl">Saldo Conecta:</strong> <span className="text-xl">R$ {selectedUser.saldoConecta.toFixed(2)}</span></p>
              <p><strong className="text-xl">Consultas grátis hoje:</strong> <span className="text-xl">{selectedUser.consultasGratisHoje}/5</span></p>
              <p><strong className="text-xl">Indicações:</strong> <span className="text-xl">{selectedUser.indicacoes?.usuariosIndicados || 0} usuários</span></p>
            </div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="mt-8 px-8 py-4 bg-blue-500 text-white rounded-xl text-xl hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
`
  },
  'app/admin/empresas': {
    'page.tsx': `// c:\\valente_conecta\\app\\admin\\empresas\\page.tsx

'use client'

import { useState, useEffect } from 'react'
import { getCompanies, approveCompany, updateCompanyPlan } from '@/services/admin'
import { Building2, CheckCircle, XCircle, Eye, CreditCard } from 'lucide-react'

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  const loadCompanies = async () => {
    const data = await getCompanies()
    setCompanies(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleApprove = async (id: string) => {
    await approveCompany(id)
    await loadCompanies()
  }

  const handleUpdatePlan = async (id: string, plano: string) => {
    const validade = new Date()
    validade.setMonth(validade.getMonth() + 1)
    await updateCompanyPlan(id, plano, validade.toISOString())
    await loadCompanies()
  }

  if (loading) {
    return <div className="text-center text-3xl py-20">Carregando empresas...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-gray-800">Empresas</h1>
        <p className="text-2xl text-gray-500 mt-4">Gerencie empresas parceiras e seus planos</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 text-2xl font-semibold">Empresa</th>
              <th className="text-left p-6 text-2xl font-semibold">CNPJ</th>
              <th className="text-left p-6 text-2xl font-semibold">Plano</th>
              <th className="text-left p-6 text-2xl font-semibold">Status</th>
              <th className="text-left p-6 text-2xl font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b hover:bg-gray-50">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    {company.logomarca && (
                      <img src={company.logomarca} alt={company.nomeFantasia} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="text-2xl font-semibold">{company.nomeFantasia}</p>
                      <p className="text-lg text-gray-500">{company.razaoSocial}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-xl">{company.cnpj}</td>
                <td className="p-6">
                  <span className={\`px-4 py-2 rounded-xl text-xl font-semibold \${
                    company.plano === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                    company.plano === 'basic' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }\`}>
                    {company.plamo === 'premium' ? 'Premium' : company.plano === 'basic' ? 'Básico' : 'Gratuito'}
                  </span>
                </td>
                <td className="p-6">
                  {company.approved ? (
                    <span className="flex items-center gap-2 text-green-600 text-xl">
                      <CheckCircle className="w-6 h-6" /> Aprovada
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-yellow-600 text-xl">
                      <XCircle className="w-6 h-6" /> Pendente
                    </span>
                  )}
                </td>
                <td className="p-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedCompany(company)}
                      className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      <Eye className="w-6 h-6" />
                    </button>
                    {!company.approved && (
                      <button 
                        onClick={() => handleApprove(company.id)}
                        className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleUpdatePlan(company.id, company.plano === 'premium' ? 'basic' : 'premium')}
                      className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
                    >
                      <CreditCard className="w-6 h-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
`
  }
}

// Função para criar pastas e arquivos
function criarEstrutura(basePath, estrutura, pastaAtual = '') {
  for (const [nome, conteudo] of Object.entries(estrutura)) {
    const caminhoCompleto = path.join(basePath, pastaAtual, nome)
    
    if (typeof conteudo === 'string') {
      // É um arquivo
      const pasta = path.dirname(caminhoCompleto)
      if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true })
      }
      fs.writeFileSync(caminhoCompleto, conteudo, 'utf8')
      console.log(`✅ Criado: ${caminhoCompleto}`)
    } else {
      // É uma pasta
      if (!fs.existsSync(caminhoCompleto)) {
        fs.mkdirSync(caminhoCompleto, { recursive: true })
        console.log(`📁 Criada pasta: ${caminhoCompleto}`)
      }
      criarEstrutura(basePath, conteudo, path.join(pastaAtual, nome))
    }
  }
}

// Executar criação
console.log('🚀 Iniciando criação da estrutura Admin Master...\n')
criarEstrutura(basePath, estrutura)
console.log('\n✨ Estrutura criada com sucesso!')
console.log('\n📋 Próximos passos:')
console.log('1. Verifique se o arquivo @/lib/supabase existe e está configurado')
console.log('2. Execute "npm install lucide-react" se não tiver instalado')
console.log('3. Execute "npm run dev" para iniciar o servidor')
console.log('4. Acesse /admin/dashboard no navegador')