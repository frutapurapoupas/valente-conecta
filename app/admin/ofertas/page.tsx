'use client'

export default function Ofertas() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="origin-top-left scale-50 w-[200%] p-12">
        <h1 className="text-7xl font-black uppercase italic mb-12">Gerenciar <span className="text-yellow-400">Ofertas</span></h1>
        
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-zinc-900 border-4 border-zinc-800 rounded-60 overflow-hidden group hover:border-yellow-400 transition-all">
              <div className="h-64 bg-zinc-800 relative">
                <span className="absolute top-6 right-6 bg-yellow-400 text-black font-black px-4 py-2 rounded-full text-xl">-30%</span>
              </div>
              <div className="p-8">
                <h3 className="text-3xl font-black uppercase italic mb-2">Produto Exemplo {i}</h3>
                <p className="text-zinc-500 text-xl font-bold mb-6 italic">Empresa Parceira Valente</p>
                <div className="flex justify-between items-center">
                  <span className="text-4xl font-black text-white text-line-through opacity-30">R$ 100</span>
                  <span className="text-5xl font-black text-yellow-400">R$ 70,00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}