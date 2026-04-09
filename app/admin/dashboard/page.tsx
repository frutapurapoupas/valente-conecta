'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Store, 
  Coins, 
  AlertCircle, 
  ArrowUpRight, 
  Activity as ActivityIcon,
  LayoutDashboard,
  TrendingUp,
  Globe
} from 'lucide-react'

export default function DashboardMaster() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProducts: 0,
    pendingProducts: 0,
    conectaBalance: 0,
    recentActivities: [] as any[]
  })

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        // Consultas em paralelo ao Banco Mãe
        const [users, companies, products, pending] = await Promise.all([
          supabase.from('usuarios').select('*', { count: 'exact', head: true }),
          supabase.from('empresas').select('*', { count: 'exact', head: true }),
          supabase.from('produtos').select('*', { count: 'exact', head: true }),
          supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('status', 'PENDENTE')
        ])

        // Busca logs de atividade real do sistema
        const { data: activities } = await supabase
          .from('atividades')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        setData({
          totalUsers: users.count || 0,
          totalCompanies: companies.count || 0,
          totalProducts: products.count || 0,
          pendingProducts: pending.count || 0,
          conectaBalance: 12540, // Lógica a ser ligada ao financeiro global
          recentActivities: activities || []
        })
      } catch (err) {
        console.error("Erro na carga do Banco Mãe:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans antialiased selection:bg-yellow-400 selection:text-black">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER TITANIC */}
        <header className="mb-12 border-b-4 border-zinc-900 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-400 p-2 rounded-xl">
                <LayoutDashboard className="text-black w-6 h-6 md:w-10 md:h-10" />
              </div>
              <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-xs italic">Sovereign Control</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
              Master <span className="text-yellow-400">HUB</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-3xl font-bold uppercase tracking-[0.2em] italic mt-2 ml-1">
              Valente Conecta <span className="text-zinc-800">|</span> Operação Global
            </p>
          </div>
        </header>

        {/* MÉTRICAS DE REDE (As funcionalidades que voltaram) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="População Ativa" value={data.totalUsers} icon={<Users />} color="text-white" sub="Registros no Banco Mãe" />
          <StatCard title="Rede Comercial" value={data.totalCompanies} icon={<Store />} color="text-yellow-400" sub="Empresas & Autônomos" />
          <StatCard title="Moeda Conecta" value={`₵ ${data.conectaBalance}`} icon={<Coins />} color="text-green-500" sub="Circulação Local" />
          <StatCard title="Aprovações" value={data.pendingProducts} icon={<AlertCircle />} color="text-red-500" sub="Produtos em Espera" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* PAINEL CENTRAL - MONITORAMENTO TÉCNICO */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border-4 border-zinc-800 rounded-[45px] p-8 md:p-12 h-full min-h-[500px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-1 group-hover:text-yellow-400 transition-colors">Infraestrutura</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Globe size={12} /> Sincronização em tempo real ativa
                    </p>
                  </div>
                  <div className="bg-black/50 border border-zinc-800 px-4 py-2 rounded-2xl flex gap-3 items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Server: Valente-BA</span>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center py-10">
                   <div className="relative">
                      <p className="text-zinc-800 font-black text-8xl md:text-[180px] uppercase italic leading-none select-none tracking-tighter opacity-40">VALENTE</p>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                         <TrendingUp className="mx-auto text-yellow-400/20 w-32 h-32 md:w-64 md:h-64" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6 border-t-2 border-zinc-800 pt-10 mt-auto">
                  <DataNode label="Itens Catálogo" value={data.totalProducts} />
                  <DataNode label="Novas Ofertas" value="+14" highlight />
                  <DataNode label="Uptime Rede" value="99.9%" />
                </div>
              </div>
            </div>
          </div>

          {/* LOG DE ATIVIDADES (O que está acontecendo agora) */}
          <div className="bg-zinc-900 border-4 border-zinc-800 rounded-[45px] p-10 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black uppercase italic flex items-center gap-3">
                <ActivityIcon className="text-yellow-400" size={24} /> Radar <span className="text-zinc-700 font-light">Live</span>
              </h3>
              <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded italic">24H</span>
            </div>
            
            <div className="space-y-8 flex-1">
              {data.recentActivities.length > 0 ? data.recentActivities.map((act: any) => (
                <div key={act.id} className="relative pl-6 border-l-2 border-zinc-800 group cursor-pointer">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 bg-zinc-700 rounded-full group-hover:bg-yellow-400 transition-colors"></div>
                  <p className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-tighter">{new Date(act.created_at).toLocaleTimeString()}</p>
                  <p className="text-sm font-bold uppercase italic tracking-tight text-zinc-300 group-hover:text-white transition-colors">{act.description}</p>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10">
                  <ActivityIcon size={64} className="mb-4" />
                  <p className="font-black uppercase italic text-xs tracking-widest">Stand-by</p>
                </div>
              )}
            </div>

            <button className="w-full mt-12 py-6 bg-black border-2 border-zinc-800 rounded-3xl font-black uppercase italic text-[11px] tracking-[0.3em] text-zinc-500 hover:text-white hover:border-yellow-400/50 hover:bg-zinc-900 transition-all active:scale-95 shadow-lg">
              Ver Histórico Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, sub }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-[40px] hover:border-yellow-400/40 transition-all group relative overflow-hidden flex flex-col justify-between">
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-black rounded-[20px] text-zinc-500 group-hover:text-yellow-400 transition-colors shadow-inner">
          {icon}
        </div>
        <ArrowUpRight className="text-zinc-800 group-hover:text-yellow-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
      <div>
        <p className="text-zinc-500 font-black uppercase text-[10px] mb-2 tracking-[0.2em] italic">{title}</p>
        <p className={`text-5xl md:text-7xl font-black ${color} italic tracking-tighter leading-none mb-4`}>
          {value}
        </p>
        <div className="pt-4 border-t border-zinc-800">
           <p className="text-zinc-700 font-black text-[9px] uppercase tracking-[0.3em] group-hover:text-zinc-500 transition-colors italic">{sub}</p>
        </div>
      </div>
    </div>
  )
}

function DataNode({ label, value, highlight = false }: any) {
  return (
    <div className="text-center">
      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-2 italic">{label}</p>
      <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${highlight ? 'text-yellow-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}