import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface EconomicData {
  id: string
  city: string
  state: string
  year: number
  month?: number
  data_type: string
  metric_name: string
  metric_value: number
  metric_unit?: string
  source?: string
  created_at: string
  updated_at: string
}

export interface PaidReport {
  id: string
  user_id: string
  report_type: string
  report_name: string
  description: string
  price: number
  is_active: boolean
  access_granted: boolean
  granted_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface ReportAccess {
  id: string
  user_id: string
  report_id: string
  access_type: 'free' | 'paid' | 'trial'
  accessed_at: string
  ip_address?: string
  user_agent?: string
}

// Serviço para dados econômicos
export class EconomicDataService {
  // Buscar dados econômicos para admin
  static async getEconomicData(filters?: {
    city?: string
    year?: number
    data_type?: string
  }): Promise<EconomicData[]> {
    try {
      let query = supabase
        .from('economic_data')
        .select('*')
        .order('year', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters?.city) {
        query = query.eq('city', filters.city)
      }
      if (filters?.year) {
        query = query.eq('year', filters.year)
      }
      if (filters?.data_type) {
        query = query.eq('data_type', filters.data_type)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar dados econômicos:', error)
      throw error
    }
  }

  // Inserir novos dados econômicos (admin)
  static async insertEconomicData(data: Omit<EconomicData, 'id' | 'created_at' | 'updated_at'>): Promise<EconomicData> {
    try {
      const { data: result, error } = await supabase
        .from('economic_data')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Erro ao inserir dados econômicos:', error)
      throw error
    }
  }

  // Buscar relatórios disponíveis
  static async getAvailableReports(userId?: string): Promise<PaidReport[]> {
    try {
      let query = supabase
        .from('paid_reports')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (userId) {
        // Incluir informações de acesso do usuário
        query = query.select('*, report_access(id, access_type, accessed_at)')
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      throw error
    }
  }

  // Verificar acesso do usuário a um relatório
  static async checkReportAccess(userId: string, reportId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('paid_reports')
        .select('access_granted, expires_at')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single()

      if (error) return false

      if (!data.access_granted) return false

      // Verificar se não expirou
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao verificar acesso:', error)
      return false
    }
  }

  // Conceder acesso a relatório (após pagamento)
  static async grantReportAccess(userId: string, reportId: string, durationDays: number = 30): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + durationDays)

      await supabase
        .from('paid_reports')
        .update({
          access_granted: true,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', reportId)
        .eq('user_id', userId)

      // Registrar acesso
      await this.logReportAccess(userId, reportId, 'paid')
    } catch (error) {
      console.error('Erro ao conceder acesso:', error)
      throw error
    }
  }

  // Registrar acesso ao relatório
  static async logReportAccess(userId: string, reportId: string, accessType: 'free' | 'paid' | 'trial', ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      await supabase
        .from('report_access')
        .insert({
          user_id: userId,
          report_id: reportId,
          access_type: accessType,
          ip_address: ipAddress,
          user_agent: userAgent
        })
    } catch (error) {
      console.error('Erro ao registrar acesso:', error)
    }
  }

  // Buscar analytics para admin master
  static async getEconomicAnalytics(): Promise<{
    totalCompanies: number
    totalJobs: number
    totalGDP: number
    sectorDistribution: Record<string, number>
    growthTrend: Array<{ year: number; companies: number }>
    reportRevenue: number
    activeReports: number
  }> {
    try {
      // Buscar dados mais recentes
      const { data: companiesData } = await supabase
        .from('economic_data')
        .select('year, metric_value')
        .eq('data_type', 'companies')
        .eq('metric_name', 'Novas Empresas')
        .order('year', { ascending: false })
        .limit(5)

      const { data: jobsData } = await supabase
        .from('economic_data')
        .select('metric_value')
        .eq('data_type', 'employment')
        .eq('metric_name', 'Empregos Formais')
        .order('year', { ascending: false })
        .limit(1)

      const { data: gdpData } = await supabase
        .from('economic_data')
        .select('metric_value')
        .eq('data_type', 'economy')
        .eq('metric_name', 'PIB')
        .order('year', { ascending: false })
        .limit(1)

      const { data: sectorsData } = await supabase
        .from('economic_data')
        .select('metric_name, metric_value')
        .eq('data_type', 'sectors')
        .in('metric_name', ['Serviços', 'Comércio', 'Indústria', 'Construção Civil'])

      // Buscar dados de relatórios
      const { data: reportsData } = await supabase
        .from('paid_reports')
        .select('price, access_granted')

      const totalCompanies = companiesData?.reduce((sum, item) => sum + item.metric_value, 0) || 0
      const totalJobs = jobsData?.[0]?.metric_value || 0
      const totalGDP = gdpData?.[0]?.metric_value || 0

      const sectorDistribution: Record<string, number> = {}
      sectorsData?.forEach(item => {
        sectorDistribution[item.metric_name] = item.metric_value
      })

      const growthTrend = companiesData?.map(item => ({
        year: item.year,
        companies: item.metric_value
      })) || []

      const reportRevenue = reportsData?.filter(r => r.access_granted).reduce((sum, r) => sum + r.price, 0) || 0
      const activeReports = reportsData?.filter(r => r.access_granted).length || 0

      return {
        totalCompanies,
        totalJobs,
        totalGDP,
        sectorDistribution,
        growthTrend,
        reportRevenue,
        activeReports
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
      throw error
    }
  }

  // Gerar relatório de dados econômicos
  static async generateEconomicReport(city: string = 'Valente'): Promise<{
    summary: string
    data: EconomicData[]
    insights: string[]
  }> {
    try {
      const data = await this.getEconomicData({ city })
      
      const summary = `Panorama econômico de ${city}-${data[0]?.state || 'BA'}: ${
        data.filter(d => d.data_type === 'companies' && d.metric_name === 'Novas Empresas')
          .reduce((sum, d) => sum + d.metric_value, 0)
      } novas empresas registradas em ${Math.max(...data.map(d => d.year))}.`

      const insights = [
        `${data.find(d => d.metric_name === 'Estabelecimentos Fixos')?.metric_value || 0}% das empresas operam com estabelecimento fixo`,
        `Setor de Serviços representa ${data.find(d => d.metric_name === 'Serviços')?.metric_value || 0}% da economia`,
        `Potencial de digitalização estimado em ${data.find(d => d.metric_name === 'Potencial Digitalização')?.metric_value || 0}%`
      ]

      return {
        summary,
        data,
        insights
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      throw error
    }
  }
}
