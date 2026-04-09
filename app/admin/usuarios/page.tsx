'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroBairro, setFiltroBairro] = useState('TODOS')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetchUsuarios()
  }, [])

  async function fetchUsuarios() {
    setLoading(true)
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsuarios(data)
    setLoading(false)
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBairro = filtroBairro === 'TODOS' || u.bairro === filtroBairro
    const matchBusca = u.nome?.toLowerCase().includes(busca.toLowerCase()) || u.telefone?.includes(busca)
    return matchBairro && matchBusca
  })

  const enviarWhatsapp = (telefone: string, nome: string) => {
    const msg = `Olá ${nome}, aqui é o Admin do Valente Conecta. Seu acesso está liberado! Instale o app pelo link: https://valente-conecta.vercel.app`
    window.open(`https://wa.me/55${telefone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 antialiased font-sans">
      {/* ESCALA 0.55 NO DESKTOP / 100% NO MOBILE */}
      <div className="md:origin-top-left md:scale-[0.55] md:w-[181.8%]">
        <header className="mb-8 md:mb-12 border-b-4 border-zinc-900 pb-6 md:pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
              Usuários <span className="text-yellow-400">Master</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-4xl font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] mt-2 italic">Controle de Acessos Valente-BA</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <input 
              placeholder="BUSCAR NOME OU CELULAR..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-800 p-4 md:p-6 rounded-2xl text-xl md:text-3xl font-black uppercase outline-none focus:border-yellow-400 transition-all w-full md:w-[400px]"
            />
            <select 
              value={filtroBairro}
              onChange={e => setFiltroBairro(e.target.value)}
              className="bg-yellow-400 text-black border-4 border-yellow-500 p-4 md:p-6 rounded-2xl text-xl md:text-3xl font-black uppercase outline-none"
            >
              <option value="TODOS">TODOS OS BAIRROS</option>
              <option value="CENTRO">CENTRO</option>
              <option value="ARACI">ARACI</option>
              <option value="BRASILÂNDIA">BRASILÂNDIA</option>
              <option value="SANTA RITA">SANTA RITA</option>
            </select>
          </div>
        </header>

        <section className="bg-white text-black p-4 md:p-12 rounded-3xl md:rounded-60 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-xl md:text-2xl italic">
                  <th className="p-4">Cadastro</th>
                  <th className="p-4">Nome / Bairro</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="p-4 text-zinc-300 text-sm md:text-xl font-mono">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-900">{u.nome}</div>
                      <div className="text-xs md:text-xl text-blue-600 font-bold uppercase tracking-widest">{u.bairro || 'NÃO INFORMADO'}</div>
                    </td>
                    <td className="p-4 font-mono text-zinc-500">{u.telefone}</td>
                    <td className="p-4 text-center text-sm md:text-xl">
                      <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full border-2 border-green-200">ATIVO</span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => enviarWhatsapp(u.telefone, u.nome)}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl text-lg md:text-2xl font-black uppercase shadow-lg hover:bg-black transition-all"
                      >
                        Convite WP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-20 text-4xl font-black text-zinc-200 uppercase italic">Nenhum usuário encontrado.</div>
          )}
        </section>
      </div>
    </div>
  )
}