'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dumbbell, CheckCircle2, Clock } from 'lucide-react' // Ícones para o status

export default function UsuariosMaster() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [filtro, setFiltro] = useState('TODOS')

  useEffect(() => { fetch() }, [])
  
  async function fetch() {
    const { data } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false })
    if (data) setUsuarios(data)
  }

  // NOVA FUNÇÃO: Liberar/Bloquear acesso pontualmente
  async function alternarAcessoAcademia(id: string, statusAtual: string) {
    const novoStatus = statusAtual === 'liberado' ? 'pendente' : 'liberado'
    const { error } = await supabase
      .from('usuarios')
      .update({ status_academia: novoStatus })
      .eq('id', id)
    
    if (!error) fetch() // Atualiza a lista na tela
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans">
      <header className="mb-10 border-b-4 border-zinc-900 pb-10">
        <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter">
          Usuários & <span className="text-yellow-400">Empresas</span>
        </h1>
        {/* Filtros mantidos... */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.filter(u => filtro === 'TODOS' || u.bairro === filtro).map(u => (
          <div key={u.id} className="bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-zinc-500 font-bold text-xs uppercase">{u.bairro}</p>
                {/* Badge de Status da Academia */}
                {u.status_academia === 'liberado' ? (
                  <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> ACADEMIA OK
                  </span>
                ) : (
                  <span className="bg-zinc-800 text-zinc-500 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} /> PENDENTE
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black uppercase italic">{u.nome}</h3>
              <p className="text-yellow-400 font-mono mb-4">{u.telefone}</p>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => alternarAcessoAcademia(u.id, u.status_academia)}
                className={`w-full p-3 rounded-xl font-black uppercase italic text-sm flex items-center justify-center gap-2 transition ${
                  u.status_academia === 'liberado' ? 'bg-red-900/50 text-red-500 border border-red-500' : 'bg-white text-black'
                }`}
              >
                <Dumbbell size={16} />
                {u.status_academia === 'liberado' ? 'Bloquear Academia' : 'Liberar Academia'}
              </button>
              
              <button onClick={() => window.open(`https://wa.me/55${u.telefone.replace(/\D/g,'')}`)} className="w-full bg-green-600 p-3 rounded-xl font-black uppercase italic text-sm">
                WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}