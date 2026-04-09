'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function UsuariosMaster() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [filtro, setFiltro] = useState('TODOS')

  useEffect(() => { fetch() }, [])
  async function fetch() {
    const { data } = await supabase.from('usuarios').select('*')
    if (data) setUsuarios(data)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans">
      <header className="mb-10 border-b-4 border-zinc-900 pb-10">
        <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter">Usuários & <span className="text-yellow-400">Empresas</span></h1>
        <div className="flex gap-4 mt-6">
          {['TODOS','CENTRO','ARACI','BRASILÂNDIA'].map(b => (
            <button key={b} onClick={()=>setFiltro(b)} className={`px-4 py-2 rounded-lg font-bold ${filtro === b ? 'bg-yellow-400 text-black' : 'bg-zinc-800'}`}>{b}</button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.filter(u => filtro === 'TODOS' || u.bairro === filtro).map(u => (
          <div key={u.id} className="bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-800">
            <p className="text-zinc-500 font-bold text-xs uppercase">{u.bairro}</p>
            <h3 className="text-2xl font-black uppercase italic">{u.nome}</h3>
            <p className="text-yellow-400 font-mono mb-4">{u.telefone}</p>
            <button onClick={() => window.open(`https://wa.me/55${u.telefone.replace(/\D/g,'')}`)} className="w-full bg-green-600 p-3 rounded-xl font-black uppercase italic text-sm">WhatsApp</button>
          </div>
        ))}
      </div>
    </div>
  )
}