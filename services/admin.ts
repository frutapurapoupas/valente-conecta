// c:\valente_conecta\services\admin.ts

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
      description: `Novo usuário: ${u.name}`,
      userId: u.id,
      userName: u.name,
      timestamp: u.createdAt
    })
  })

  newCompanies.data?.forEach(c => {
    activities.push({
      id: c.id,
      type: 'company_register',
      description: `Nova empresa: ${c.nomeFantasia}`,
      userId: c.id,
      userName: c.nomeFantasia,
      timestamp: c.createdAt
    })
  })

  pendingProductsList.data?.forEach(p => {
    activities.push({
      id: p.id,
      type: 'product_pending',
      description: `Produto pendente: ${p.name} (${p.status === 'pending_completion' ? 'complementação' : 'sincronização'})`,
      timestamp: p.createdAt
    })
  })

  newOffers.data?.forEach(o => {
    activities.push({
      id: o.id,
      type: 'offer_created',
      description: `Nova oferta aguardando moderação: ${o.title}`,
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
    .ilike('name', `%${search}%`)
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
  console.log(`Notificando usuário ${userId} sobre ${type}`, extra)
  
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
