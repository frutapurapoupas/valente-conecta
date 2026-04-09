'use client'
import { useState } from 'react'

export default function FinanceiroMaster() {
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [despesas, setDespesas] = useState([
    { id: 1, nome: 'PRÓ-LABORE', categoria: 'PESSOAL', valor: 3500, venc: '05', doc: 'DOC-01', status: 'PAGO', forn: 'DIRETORIA' },
    { id: 2, nome: 'ALUGUEL ESCRITÓRIO', categoria: 'FIXO', valor: 1200, venc: '10', doc: 'AL-99', status: 'PAGO', forn: 'COWORKING' },
    { id: 3, nome: 'SUPABASE / DB', categoria: 'SOFTWARE', valor: 200, venc: '15', doc: 'SUPA-1', status: 'PENDENTE', forn: 'SUPABASE' },
  ])

  const [newExp, setNewExp] = useState({ nome: '', valor: '', forn: '', venc: '', doc: '', categoria: '', obs: '' })

  const handleSave = () => {
    if (!newExp.nome || !newExp.valor) return alert("DESCRIÇÃO E VALOR OBRIGATÓRIOS!");
    const novo = {
      id: Date.now(),
      nome: newExp.nome.toUpperCase(),
      categoria: newExp.categoria.toUpperCase() || 'DIVERSOS',
      valor: parseFloat(newExp.valor),
      forn: newExp.forn.toUpperCase() || 'DIVERSOS',
      venc: newExp.venc ? newExp.venc.split('-')[2] : '01',
      doc: newExp.doc.toUpperCase() || 'S/N',
      status: 'PENDENTE'
    }
    setDespesas([novo, ...despesas]);
    setShowAddExpense(false);
    setNewExp({ nome: '', valor: '', forn: '', venc: '', doc: '', categoria: '', obs: '' });
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-yellow-400">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; scale: 1 !important; }
          .no-print { display: none !important; }
        }
        input, textarea { text-transform: uppercase; }
      `}</style>

      {/* ESCALA CONTROLADA PARA MÁXIMA NITIDEZ (REDUÇÃO DO DESFOQUE) */}
      <div className="origin-top-left scale-[0.6] w-[166.6%] p-10 font-sans">
        
        {/* HEADER */}
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10 no-print">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic text-zinc-600">Valente Conecta Official</p>
          </div>
          <button onClick={() => setShowAddExpense(true)} className="bg-red-600 hover:bg-white hover:text-red-600 text-white px-16 py-8 rounded-25 text-5xl font-black uppercase italic transition-all shadow-[0_0_50px_rgba(220,38,38,0.4)]">
            + Novo Lançamento
          </button>
        </header>

        {/* DASHBOARD DE RESUMO */}
        <div className="grid grid-cols-4 gap-8 mb-16 no-print">
          <StatCard title="Entrada Total" value="R$ 12.450" color="text-white" />
          <StatCard title="Saídas Total" value={`R$ ${despesas.reduce((acc, d) => acc + d.valor, 0).toLocaleString()}`} color="text-red-500" />
          <StatCard title="Saldo Atual" value="R$ 4.050" color="text-green-500" />
          <StatCard title="Projeção" value="R$ 18.200" color="text-yellow-400" />
        </div>

        {/* FLUXO DE CAIXA DETALHADO (EXTRATO) */}
        <section className="bg-white text-black p-12 rounded-60 shadow-2xl print-area">
          <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-6">
            <div>
               <h2 className="text-7xl font-black uppercase italic tracking-tighter text-zinc-900">Fluxo de Caixa Detalhado</h2>
               <p className="text-2xl font-bold uppercase text-zinc-400">Auditoria Mensal - Registro Ativo</p>
            </div>
            <button onClick={() => window.print()} className="bg-black text-white px-12 py-5 rounded-20 font-black text-3xl uppercase no-print hover:scale-105 transition-transform">🖨️ Imprimir</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                <th className="p-6">Descrição / Origem</th>
                <th className="p-6">Categoria</th>
                <th className="p-6 text-center">Venc.</th>
                <th className="p-6">Valor</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-4xl font-black uppercase italic tracking-tighter">
              {despesas.map(d => (
                <tr key={d.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50">
                  <td className="p-6">
                    {d.nome} 
                    <div className="text-xl text-zinc-400 not-italic font-bold tracking-widest">{d.forn}</div>
                  </td>
                  <td className="p-6">
                    <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-10 text-2xl">{d.categoria}</span>
                  </td>
                  <td className="p-6 text-center text-zinc-400 font-mono tracking-tighter">{d.venc}</td>
                  <td className="p-6 text-red-600 font-black">R$ {d.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="p-6 text-right text-3xl font-black border-l-2 border-zinc-50">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* MODAL DE LANÇAMENTO - CATEGORIA CONFIRMADA */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-10 no-print">
          <div className="bg-white border-[15px] border-red-600 w-[1250px] rounded-60 p-16 text-black shadow-2xl relative">
            <button onClick={() => setShowAddExpense(false)} className="absolute top-10 right-10 text-7xl text-zinc-300 hover:text-black transition-colors">✕</button>
            <h2 className="text-8xl font-black uppercase italic mb-10 border-b-8 border-red-600 pb-4 inline-block">Registrar Despesa</h2>
            
            <div className="grid grid-cols-2 gap-12 mt-4">
              <div className="space-y-10">
                <div>
                  <label className="text-3xl font-black uppercase italic text-zinc-400 mb-2 block">1. Descrição do Gasto</label>
                  <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-5xl font-black outline-none focus:border-red-600 transition-colors" placeholder="EX: COMPRA DE EMBALAGENS" />
                </div>
                <div>
                  <label className="text-3xl font-black uppercase italic text-blue-600 mb-2 block">2. Categoria Confirmada</label>
                  <input value={newExp.categoria} onChange={e => setNewExp({...newExp, categoria: e.target.value})} className="w-full bg-blue-50 border-4 border-blue-200 p-8 rounded-30 text-5xl font-black outline-none focus:border-blue-600 transition-colors" placeholder="EX: MATÉRIA PRIMA / LOGÍSTICA" />
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <label className="text-4xl font-black uppercase italic text-red-600 mb-2 block text-right">Valor R$</label>
                  <input type="number" value={newExp.valor} onChange={e => setNewExp({...newExp, valor: e.target.value})} className="w-full bg-zinc-50 border-4 border-red-200 p-8 rounded-30 text-7xl font-black text-red-600 text-right outline-none focus:border-red-600" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Vencimento</label>
                    <input type="date" value={newExp.venc} onChange={e => setNewExp({...newExp, venc: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-3xl font-black uppercase outline-none" />
                  </div>
                  <div>
                    <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Doc / NF</label>
                    <input value={newExp.doc} onChange={e => setNewExp({...newExp, doc: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-4xl font-black outline-none focus:border-red-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-6">
              <button onClick={() => setShowAddExpense(false)} className="flex-1 bg-zinc-100 hover:bg-zinc-200 p-10 rounded-40 text-4xl font-black uppercase italic transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-[2] bg-red-600 text-white p-10 rounded-40 text-6xl font-black uppercase italic shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:bg-black transition-all transform active:scale-95">
                ✅ Salvar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-40 hover:border-zinc-700 transition-colors">
      <p className="text-zinc-500 font-black uppercase text-xl mb-2 tracking-widest italic">{title}</p>
      <p className={`text-6xl font-black ${color} italic tracking-tighter leading-none`}>{value}</p>
    </div>
  )
}