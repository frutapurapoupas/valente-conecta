'use client'

export default function Usuarios() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10">
          {/* Texto de destaque reduzido em 40% (de 5xl para 3xl) */}
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Gerenciar <span className="text-yellow-400">Usuários</span></h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Controle de acesso à plataforma</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-30">
            <p className="text-zinc-500 font-black uppercase text-[10px] mb-2">Total de Clientes</p>
            {/* Valor de destaque reduzido de 6xl para 3xl */}
            <p className="text-3xl font-black">1.420</p>
          </div>
          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-30">
            <p className="text-zinc-500 font-black uppercase text-[10px] mb-2">Ativos Agora</p>
            <p className="text-3xl font-black text-green-400">85</p>
          </div>
          <div className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-30">
            <p className="text-zinc-500 font-black uppercase text-[10px] mb-2">Novos (24h)</p>
            <p className="text-3xl font-black text-yellow-400">+12</p>
          </div>
        </div>

        <div className="bg-zinc-900 border-2 border-zinc-800 rounded-40 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="font-black uppercase italic text-sm text-zinc-400">Lista de Cadastros</h2>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase">Novo Usuário</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] font-black uppercase">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold">
              <tr className="border-b border-zinc-800/50">
                <td className="p-4">João Valente</td>
                <td className="p-4 text-zinc-400">joao@email.com</td>
                <td className="p-4"><span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-[9px]">ATIVO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}