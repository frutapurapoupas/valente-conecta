'use client'

export default function Configuracoes() {
  return (
    <div className="min-h-screen bg-black text-white p-12 flex justify-center">
      <div className="w-full max-w-[1200px] origin-top scale-[0.6]">
        <h1 className="text-6xl font-black uppercase italic mb-16 text-center">Configurações do <span className="text-yellow-400">Sistema</span></h1>
        
        <div className="space-y-12">
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60">
            <h2 className="text-3xl font-black uppercase italic mb-8 border-b-4 border-yellow-400 inline-block">Perfil Master</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-zinc-500 font-black uppercase text-sm ml-4">Nome da Plataforma</label>
                <input type="text" defaultValue="Valente Conecta" className="w-full bg-zinc-800 p-6 rounded-30 text-2xl font-bold outline-none border-2 border-transparent focus:border-yellow-400" />
              </div>
              <div className="space-y-4">
                <label className="block text-zinc-500 font-black uppercase text-sm ml-4">E-mail de Suporte</label>
                <input type="email" defaultValue="contato@valente.com" className="w-full bg-zinc-800 p-6 rounded-30 text-2xl font-bold outline-none border-2 border-transparent focus:border-yellow-400" />
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60">
            <h2 className="text-3xl font-black uppercase italic mb-8 border-b-4 border-red-500 inline-block text-red-500">Segurança</h2>
            <button className="w-full bg-zinc-800 p-8 rounded-30 text-2xl font-black uppercase hover:bg-zinc-700 transition-all">Alterar Senha Master</button>
            <button className="w-full mt-4 bg-red-500/10 text-red-500 border-2 border-red-500/20 p-8 rounded-30 text-2xl font-black uppercase hover:bg-red-500 hover:text-white transition-all">Limpar Cache do Servidor</button>
          </section>
        </div>
      </div>
    </div>
  )
}