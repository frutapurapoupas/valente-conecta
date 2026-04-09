'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Store, 
  Package, 
  AlertCircle, 
  ArrowUpRight, 
  Coins, 
  Activity as ActivityIcon,
  LayoutDashboard
} from 'lucide-react'

export default function DashboardMaster() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalConectaCirculating: 12540, // Exemplo de valor da moeda
    recentActivities: [] as any[]
  })

  useEffect(() => {
    async function loadFullDashboard() {
      setLoading(true)
      try {
        // 1. Contagem de Usuários
        const { count: users } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
        
        // 2. Contagem de Empresas (Supondo flag ou tabela específica)
        const { count: companies } = await supabase.from('empresas').select('*', { count: 'exact', head: true })
        
        // 3. Produtos e Pendências (Regra do Banco Mãe)
        const { count: products } = await supabase.from('produtos').select('*', { count: 'exact', head: true })
        const { count: pending } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('status', 'PENDENTE')

        // 4. Atividades Recentes (Log de vendas/cadastros)
        const { data: activities } = await supabase
          .from('atividades')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setData({
          totalUsers: users || 0,
          totalCompanies: companies || 0,
          totalProducts: products || 0,
          pendingProducts: pending || 0,
          totalConectaCirculating: 12540, // Lógica de soma da moeda Conecta
          recentActivities: activities || []
        })
      } catch (error) {
        console.error("Erro ao carregar dados master:", error)
      } finally {
        setLoading(false)
      }
    }
    loadFullDashboard()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans antialiased">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER TITANIC */}
        <header className="mb-12 border-b-4 border-zinc-900 pb-10">
          <div className="flex items-center gap-4 mb-4">
            <LayoutDashboard className="text-yellow-400 w-8 h-8 md:w-12 md:h-12" />
            <h1 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
              Master <span className="text-yellow-400">HUB</span>
            </h1>
          </div>
          <p className="text-zinc-500 text-lg md:text-4xl font-bold uppercase tracking-[0.3em] italic">Controlo Total Valente Conecta</p>
        </header>

        {/* GRID DE MÉTRICAS OPERACIONAIS (Funcionalidades Restauradas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Utilizadores" value={data.totalUsers} icon={<Users />} color="text-white" origin="Rede Ativa" />
          <StatCard title="Empresas" value={data.totalCompanies} icon={<Store />} color="text-yellow-400" origin="Parceiros" />
          <StatCard title="Moeda Conecta" value={`₵ ${data.totalConectaCirculating}`} icon={<Coins />} color="text-green-500" origin="Em Circulação" />
          <StatCard title="Pendentes" value={data.pendingProducts} icon={<AlertCircle />} color="text-red-500" origin="Aprovação Manual" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GRÁFICO / ÁREA CENTRAL (Visual Espião) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border-4 border-zinc-800 rounded-[40px] p-10 h-[500px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Fluxo de Dados <span className="text-zinc-600">Real-Time</span></h2>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black text-green-500 uppercase">Servidor Valente OK</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-zinc-700 font-black text-8xl md:text-[120px] uppercase italic leading-none opacity-20">Banco Mãe</p>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-6">
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs font-black uppercase mb-1">Total Produtos</p>
                    <p className="text-3xl font-black italic">{data.totalProducts}</p>
                  </div>
                  <div className="text-center border-x border-zinc-800 px-10">
                    <p className="text-zinc-500 text-xs font-black uppercase mb-1">Novas Ofertas</p>
                    <p className="text-3xl font-black italic text-yellow-400">+12</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs font-black uppercase mb-1">Transactions (24h)</p>
                    <p className="text-3xl font-black italic text-green-500">248</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LOG DE ATIVIDADES (Funcionalidade Restaurada) */}
          <div className="bg-zinc-900 border-4 border-zinc-800 rounded-[40px] p-8">
            <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
              <ActivityIcon className="text-yellow-400" /> Atividade Recente
            </h3>
            <div className="space-y-6">
              {data.recentActivities.length > 0 ? data.recentActivities.map((act: any) => (
                <div key={act.id} className="border-l-4 border-yellow-400 pl-4 py-1 group hover:bg-zinc-800 transition-colors cursor-pointer">
                  <p className="text-[10px] text-zinc-500 font-black uppercase">{new Date(act.created_at).toLocaleTimeString()}</p>
                  <p className="text-sm font-bold uppercase italic tracking-tight">{act.description}</p>
                </div>
              )) : (
                <div className="text-zinc-700 font-black uppercase italic text-center py-20">
                  <p>A aguardar dados...</p>
                </div>
              )}
            </div>
            <button className="w-full mt-10 py-4 border-2 border-zinc-800 rounded-2xl font-black uppercase italic text-xs text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
              Ver Log Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, origin }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-[35px] hover:border-yellow-400 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-black rounded-2xl text-zinc-500 group-hover:text-yellow-400 transition-colors">
          {icon}
        </div>
        <ArrowUpRight className="text-zinc-800 group-hover:text-yellow-400 transition-colors" />
      </div>
      <p className="text-zinc-500 font-black uppercase text-xs mb-1 tracking-widest italic">{title}</p>
      <p className={`text-4xl md:text-6xl font-black ${color} italic tracking-tighter leading-none mb-6`}>{value}</p>
      <p className="text-zinc-700 font-black text-[10px] uppercase tracking-[0.2em] border-t border-zinc-800 pt-4">{origin}</p>
    </div>
  )
}