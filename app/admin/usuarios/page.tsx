'use client'
import { useState } from 'react'

export default function GerenciarUsuarios() {
  const [filter, setFilter] = useState('ativos')
  const [bairroSearch, setBairroSearch] = useState('')
  const [showInviteMenu, setShowInviteMenu] = useState(false)
  
  const [usuarios, setUsuarios] = useState([
    { 
      id: 1, nome: 'JOÃO SILVA PINTO', whatsapp: '75999990000', 
      cpf: '000.000.000-00', email: '', bairro: 'CENTRO', 
      endereco: 'RUA CENTRAL, 10, VALENTE-BA',
      plano: 'PRIME', status: 'ativo' 
    },
    { 
      id: 2, nome: 'MARIA DAS DORES', whatsapp: '75988881111', 
      cpf: '111.111.111-11', email: 'MARIA@EMAIL.COM', bairro: 'MERCADO', 
      endereco: 'AV. GETÚLIO VARGAS, VALENTE-BA',
      plano: 'NENHUM', status: 'cancelado' 
    }
  ])

  const sendWhatsAppInvite = () => {
    const msg = encodeURIComponent("OLÁ! VENHA FAZER PARTE DO VALENTE CONECTA. CADASTRE-SE PELO LINK: https://valenteconecta.com.br/cadastro");
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  const filteredUsers = usuarios.filter(u => {
    const matchesBairro = u.bairro.toUpperCase().includes(bairroSearch.toUpperCase());
    const matchesStatus = filter === 'todos' ? true : (filter === 'ativos' ? (u.status === 'ativo' || u.status === 'pendente') : u.status === filter);
    return matchesBairro && matchesStatus;
  })

  return (
    <div className="min-h-screen bg-black text-white p-12 font-sans origin-top-left scale-50 w-[200%]">
      
      <header className="flex justify-between items-center mb-16">
        <div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter">Gestão de <span className="text-yellow-400">Usuários</span></h1>
          <p className="text-zinc-500 text-2xl font-bold uppercase tracking-[0.3em]">Base de Dados Valente Conecta</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowInviteMenu(!showInviteMenu)}
            className="bg-yellow-400 text-black px-12 py-6 rounded-25 font-black text-3xl uppercase hover:bg-white transition-all shadow-2xl"
          >
            + Novo Usuário / Indicação
          </button>

          {showInviteMenu && (
            <div className="absolute right-0 mt-4 bg-zinc-900 border-4 border-zinc-800 p-6 rounded-30 w-[450px] z-50 shadow-2xl">
              <button onClick={sendWhatsAppInvite} className="w-full text-left p-6 hover:bg-zinc-800 text-green-500 font-black text-2xl uppercase border-b border-zinc-800">
                📱 Enviar Link via WhatsApp
              </button>
              <button onClick={() => alert('GERANDO QR CODE DE INDICAÇÃO...')} className="w-full text-left p-6 hover:bg-zinc-800 text-white font-black text-2xl uppercase">
                🔳 Abrir QR Code Indicação
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-8 mb-12">
        <div className="flex gap-6">
          {['ativos', 'cancelados', 'desligados', 'todos'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-10 py-4 rounded-full text-2xl font-black uppercase border-4 transition-all ${filter === f ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500'}`}>
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-6 bg-zinc-900 border-4 border-zinc-800 p-6 rounded-30 w-full max-w-3xl">
          <span className="text-4xl text-zinc-500 font-black">LOUPE</span>
          <input 
            type="text" 
            placeholder="BUSCAR POR BAIRRO (CENTRO, APARECIDA, ETC...)" 
            value={bairroSearch}
            onChange={(e) => setBairroSearch(e.target.value.toUpperCase())}
            className="bg-transparent w-full text-3xl font-black uppercase outline-none placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-60 border-4 border-zinc-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800 text-zinc-400 text-xl font-black uppercase italic">
              <th className="p-8">Identificação / CPF</th>
              <th className="p-8">Localização / Bairro</th>
              <th className="p-8">Contato / WhatsApp</th>
              <th className="p-8">E-mail / Atualização</th>
              <th className="p-8">Plano</th>
              <th className="p-8 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-3xl font-black uppercase italic tracking-tighter">
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-b-2 border-zinc-800 hover:bg-black/50 transition-colors">
                <td className="p-8">
                  <div className="text-white text-4xl">{u.nome}</div>
                  <div className="text-yellow-400 text-xl mt-1 tracking-[0.2em]">{u.cpf}</div>
                </td>
                <td className="p-8">
                  <div className="text-blue-400 text-2xl font-black mb-1">{u.bairro}</div>
                  <div className="text-zinc-500 text-lg font-bold">{u.endereco}</div>
                </td>
                <td className="p-8 text-green-500 font-mono tracking-widest">{u.whatsapp}</td>
                <td className="p-8">
                  {u.email ? (
                    <span className="text-zinc-400 text-xl font-bold">{u.email}</span>
                  ) : (
                    <button className="bg-zinc-800 text-[14px] px-6 py-3 rounded-15 text-yellow-400 border-2 border-yellow-400/30 animate-pulse">
                      📩 SOLICITAR ATUALIZAÇÃO (MENSAL)
                    </button>
                  )}
                </td>
                <td className="p-8">
                   <div className={u.plano !== 'NENHUM' ? 'text-green-500' : 'text-zinc-600'}>
                     {u.plano} {u.plano !== 'NENHUM' ? '✅' : '❌'}
                   </div>
                </td>
                <td className="p-8 text-right">
                  <select 
                    defaultValue={u.status} 
                    className={`bg-black border-4 p-4 rounded-20 text-2xl font-black uppercase outline-none 
                      ${u.status === 'ativo' ? 'border-green-600 text-green-500' : 
                        u.status === 'pendente' ? 'border-yellow-600 text-yellow-500' : 'border-red-600 text-red-500'}`}
                  >
                    <option value="ativo">ATIVO</option>
                    <option value="pendente">PENDENTE VALIDAÇÃO</option>
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