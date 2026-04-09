'use client'
import { useState } from 'react'

export default function FinanceiroMaster() {
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [despesas] = useState([
    { id: 1, nome: 'PRÓ-LABORE', categoria: 'PESSOAL', valor: 3500, venc: '05', status: 'PAGO', forn: 'DIRETORIA' },
    { id: 2, nome: 'ALUGUEL ESCRITÓRIO', categoria: 'FIXO', valor: 1200, venc: '10', status: 'PAGO', forn: 'COWORKING' },
    { id: 3, nome: 'SUPABASE / DB', categoria: 'SOFTWARE', valor: 200, venc: '15', status: 'PENDENTE', forn: 'SUPABASE' },
    { id: 4, nome: 'EMBALAGENS FRUTA PURA', categoria: 'LOGÍSTICA', valor: 850.50, venc: '20', status: 'AGUARDANDO', forn: 'VALENTE PLAST' },
  ])

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-yellow-400 font-sans">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; scale: 1 !important; }
        }
      `}</style>

      <div className="origin-top-left scale-[0.6] w-[166.6%] p-10">
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
          </div>
          <button onClick={() => setShowAddExpense(true)} className="bg-red-600 text-white px-16 py-8 rounded-25 text-5xl font-black uppercase italic shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:bg-white hover:text-red-600 transition-all active:scale-95">
            + Novo Lançamento
          </button>
        </header>

        <div className="grid grid-cols-4 gap-8 mb-16">
          <StatCard title="Entrada Total" value="R$ 12.450" color="text-white" />
          <StatCard title="Saídas Total" value="R$ 5.750,50" color="text-red-500" />
          <StatCard title="Saldo Atual" value="R$ 6.699,50" color="text-green-500" />
          <StatCard title="Projeção" value="R$ 18.200" color="text-yellow-400" />
        </div>

        <section className="bg-white text-black p-12 rounded-60 shadow-2xl print-area overflow-hidden">
          <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-6">
            <div>
              <h2 className="text-7xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">Fluxo de Caixa Detalhado</h2>
              <p className="text-2xl font-bold uppercase text-zinc-400 tracking-[0.3em] mt-2">Auditoria Mensal - Registro Ativo</p>
            </div>
            <button onClick={() => window.print()} className="bg-black text-white px-12 py-5 rounded-20 font-black text-3xl uppercase hover:bg-zinc-800 transition-all">🖨️ Imprimir</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                <th className="p-6">Descrição / Origem</th>
                <th className="p-6 text-center">Categoria</th>
                <th className="p-6 text-center">Venc.</th>
                <th className="p-6 text-center">Valor</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-4xl font-black uppercase italic tracking-tighter">
              {despesas.map(d => (
                <tr key={d.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="p-6">
                    {d.nome}
                    <div className="text-xl text-zinc-400 not-italic font-bold tracking-widest uppercase mt-1">{d.forn}</div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-15 text-2xl font-black inline-block shadow-sm">
                      {d.categoria}
                    </span>
                  </td>
                  <td className="p-6 text-center text-zinc-400 font-mono">{d.venc}</td>
                  <td className="p-6 text-center text-red-600 font-black">
                    R$ {d.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </td>
                  <td className="p-6 text-right font-black border-l-2 border-zinc-50 tracking-tighter">
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-40 hover:border-zinc-700 transition-all">
      <p className="text-zinc-500 font-black uppercase text-xl mb-2 tracking-widest italic">{title}</p>
      <p className={`text-6xl font-black ${color} italic tracking-tighter leading-none`}>{value}</p>
    </div>
  )
}