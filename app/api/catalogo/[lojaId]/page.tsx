'use client'
export default function VitrineLoja({ params }: { params: { lojaId: string } }) {
  return (
    <div className="min-h-screen bg-white text-black p-10 font-mono">
      <header className="border-b-8 border-black pb-10 mb-10">
        <h1 className="text-7xl font-black uppercase italic">Catálogo Oficial</h1>
        <p className="text-3xl font-bold bg-black text-white inline-block px-4">LOJA ID: {params.lojaId}</p>
      </header>
      <div className="grid gap-8">
        <div className="p-10 border-8 border-black rounded-60 bg-zinc-50 flex justify-between items-center">
          <span className="text-5xl font-black uppercase">Fruta Pura Premium</span>
          <button className="bg-black text-white p-10 rounded-60 text-4xl font-black uppercase italic">Pedir</button>
        </div>
      </div>
    </div>
  );
}