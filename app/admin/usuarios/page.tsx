'use client'
import { useState } from 'react'

export default function GerenciarUsuarios() {
  const [filter, setFilter] = useState('ativos')
  const [showAddUser, setShowAddUser] = useState(false)
  
  const [usuarios, setUsuarios] = useState([
    { 
      id: 1, nome: 'JOÃO', nomeCompleto: 'JOÃO SILVA PINTO', whatsapp: '75 99999-0000', 
      cpf: '000.000.000-00', email: '', endereco: 'RUA CENTRAL, CENTRO, VALENTE-BA',
      plano: 'PRIME', vigente: true, status: 'ativo' 
    },
    { 
      id: 2, nome: 'MARIA', nomeCompleto: 'MARIA DAS DORES', whatsapp: '75 98888-1111', 
      cpf: '111.111.111-11', email: 'maria@email.com', endereco: 'AV. GETÚLIO VARGAS, ARACI-BA',
      plano: 'NENHUM', vigente: false, status: 'cancelado' 
    }
  ])

  const filteredUsers = usuarios.filter(u => {
    if (filter === 'ativos') return u.status === 'ativo' || u.status === 'pendente validação'
    return u.status === filter
  })

  return (
    <div className="min-h-screen bg-black text-white p-12 font-sans origin-top-left scale-50 w-[200%]">
      <header className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter">Gestão de <span className="text-yellow-400">Usuários</span></h1>
          <p className="text-zinc-500 text-2xl font-bold uppercase tracking-[0.3em]">Valente Conecta Base Real</p>
        </div>
        <button onClick={() => setShowAddUser(true)} className="bg-yellow-400 text-black px-12 py-6 rounded-25 font-black text-3xl uppercase hover:bg-white transition-all">+ Novo Usuário</button>
      </header>

      {/* FILTROS */}
      <div className="flex gap-6 mb-12">
        {['ativos', 'cancelados', 'desligados'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-10 py-4 rounded-full text-2xl font-black uppercase border-4 transition-all ${filter === f ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABELA DE DADOS COMPLETOS */}
      <div className="bg-zinc-900 rounded-60 border-4 border-zinc-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800 text-zinc-400 text-xl font-black uppercase">
              <th className="p-8">Identificação / CPF</th>
              <th className="p-8">Contato / WhatsApp</th>
              <th className="p-8">E-mail / Solicitação</th>
              <th className="p-8">Endereço / Bairro</th>
              <th className="p-8">Plano Vigente</th>
              <th className="p-8 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-3xl font-black uppercase italic">
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-b-2 border-zinc-800 hover:bg-black/50 transition-all">
                <td className="p-8">
                  <div className="text-white">{u.nome}</div>
                  <div className="text-zinc-500 text-sm font-bold lowercase">{u.nomeCompleto}</div>
                  <div className="text-yellow-400 text-lg mt-1 tracking-widest">{u.cpf}</div>
                </td>
                <td className="p-8 text-green-500">{u.whatsapp}</td>
                <td className="p-8">
                  {u.email ? (
                    <span className="text-zinc-300 text-xl">{u.email}</span>
                  ) : (
                    <button className="bg-zinc-800 text-xs px-4 py-2 rounded text-yellow-400 border border-yellow-400/30 animate-pulse">
                      📩 SOLICITAR ATUALIZAÇÃO (MENSAL)
                    </button>
                  )}
                </td>
                <td className="p-8">
                  <div className="text-zinc-400 text-lg leading-tight">{u.endereco}</div>
                </td>
                <td className="p-8">
                   <span className={u.vigente ? 'text-green-500' : 'text-zinc-600'}>
                     {u.plano} {u.vigente ? '✅' : '❌'}
                   </span>
                </td>
                <td className="p-8 text-right">
                  <select 
                    defaultValue={u.status} 
                    className={`bg-black border-2 p-3 rounded-15 text-xl font-black ${u.status === 'ativo' ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'}`}
                  >
                    <option value="ativo">ATIVO</option>
                    <option value="pendente validação">PENDENTE VALIDAÇÃO</option>
                    <option value="cancelado">CANCELADO</option>
                    <option value="desligado">DESLIGADO</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}