'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, AlertTriangle, Users, Building2, ShoppingBag, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DashboardMaster() {
  const [stats, setStats] = useState({ usuarios: 0, empresas: 0, transacoes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [u, e, t] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('transactions').select('amount').gte(
            'created_at',
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          ),
        ])
        const volMes = (t.data || []).reduce((s: number, r: { amount: number }) => s + r.amount, 0)
        setStats({ usuarios: u.count || 0, empresas: e.count || 0, transacoes: Math.round(volMes) })
      } catch (err) {
        console.error('DashboardMaster:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-6xl font-black italic mb-4 text-indigo-400 uppercase leading-none">Command Center</h1>
      <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-10">Admin Master · Valente Conecta</p>

      {loading ? (
        <div className="text-zinc-600 text-lg font-bold animate-pulse">Carregando dados...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 border border-indigo-500/30 rounded-2xl p-6">
            <Users className="w-8 h-8 text-indigo-400 mb-3" />
            <p className="text-4xl font-black text-white">{stats.usuarios.toLocaleString()}</p>
            <p className="text-zinc-400 font-bold mt-1">Usuários cadastrados</p>
          </div>
          <div className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-6">
            <Building2 className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-4xl font-black text-white">{stats.empresas.toLocaleString()}</p>
            <p className="text-zinc-400 font-bold mt-1">Empresas / Lojas</p>
          </div>
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-6">
            <ShoppingBag className="w-8 h-8 text-emerald-400 mb-3" />
            <p className="text-4xl font-black text-emerald-400">R$ {stats.transacoes.toLocaleString()}</p>
            <p className="text-zinc-400 font-bold mt-1">Volume transações / mês</p>
          </div>
        </div>
      )}

      {/* Acesso rápido — universo pessoal */}
      <a href="/admin-master/financeiro-pessoal" className="block mb-8">
        <div className="bg-gradient-to-r from-emerald-900/40 to-indigo-900/40 border border-emerald-500/30 rounded-2xl p-6 flex items-center gap-5 hover:border-emerald-400/50 transition-all group">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-all">
            <Wallet size={32} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase text-white">Finanças Pessoais</h2>
            <p className="text-emerald-400/70 text-sm font-bold mt-0.5">Pró-labore · Despesas · Faturas recorrentes · Controle PF</p>
          </div>
          <div className="ml-auto text-zinc-600 group-hover:text-zinc-400 transition-all text-3xl font-black">→</div>
        </div>
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <TrendingUp size={40} className="text-emerald-500 mb-4" />
          <h2 className="text-2xl font-black uppercase text-white">Mais Vendidos / Bairro</h2>
          <p className="text-zinc-500 mt-2 italic text-sm">Dados de inteligência comercial em tempo real em breve.</p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <AlertTriangle size={40} className="text-amber-500 mb-4" />
          <h2 className="text-2xl font-black uppercase text-white">Ajuste de Preço</h2>
          <p className="text-zinc-500 mt-2 italic text-sm">Análise de demanda e sugestão de pricing disponível no painel BI.</p>
        </div>
      </div>
    </div>
  )
}