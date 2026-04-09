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
}
