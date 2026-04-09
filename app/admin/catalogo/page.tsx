'use client'

export default function Catalogo() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Inventário <span className="text-yellow-400">Global</span></h1>
          <div className="flex justify-center gap-2">
            <span className="bg-zinc-800 px-3 py-1 rounded-full text-[9px] font-black uppercase">Filtros</span>
            <span className="bg-zinc-800 px-3 py-1 rounded-full text-[9px] font-black uppercase">Categorias</span>
          </div>
        </header>

        <div className="bg-zinc-900 border-2 border-zinc-800 rounded-40 p-2">
           <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="bg-zinc-800/50 p-4 rounded-30 border border-transparent hover:border-zinc-700">
                  <div className="aspect-square bg-zinc-700 rounded-20 mb-3"></div>
                  {/* Nome do produto reduzido de xl para text-xs/sm */}
                  <h4 className="text-[11px] font-black uppercase leading-tight mb-1">Polpa de Fruta 1kg</h4>
                  {/* Preço de destaque reduzido de 2xl para lg */}
                  <p className="text-lg font-black text-yellow-400">R$ 18,90</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}