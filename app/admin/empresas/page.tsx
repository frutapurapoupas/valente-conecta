'use client'

export default function Empresas() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Parceiros <span className="text-yellow-400">Comerciais</span></h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Base de dados de Valente-BA</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-30 group hover:border-yellow-400 transition-all">
              <div className="w-12 h-12 bg-zinc-800 rounded-20 mb-4 flex items-center justify-center font-black text-yellow-400">FP</div>
              {/* Título da empresa reduzido de 2xl para lg/xl */}
              <h3 className="text-lg font-black uppercase italic group-hover:text-yellow-400 transition-colors">Fruta Pura {i}</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase mb-4">Artisanal Sweets</p>
              <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                <span className="text-[10px] font-black text-green-400">PREMIUM</span>
                <span className="text-[10px] font-black text-zinc-500">12 PROD.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}