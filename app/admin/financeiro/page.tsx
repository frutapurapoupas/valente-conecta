'use client'
import { useState } from 'react'

export default function FinanceiroMaster() {
  const [selectedMonth, setSelectedMonth] = useState('04')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  const [despesas, setDespesas] = useState([
    { id: 1, nome: 'PRÓ-LABORE', categoria: 'PESSOAL', valor: 3500, venc: '05', doc: 'DOC-001', status: 'pago', forn: 'DIRETORIA', obs: 'RETIRADA MENSAL' },
    { id: 2, nome: 'ALUGUEL ESCRITÓRIO', categoria: 'FIXO', valor: 100, venc: '10', doc: 'AL-99', status: 'pago', forn: 'COWORKING', obs: '' },
    { id: 3, nome: 'SUPABASE / DB', categoria: 'SOFTWARE', valor: 200, venc: '15', doc: 'SUPA-1', status: 'pendente', forn: 'SUPABASE', obs: 'HOSPEDAGEM BANCO' },
  ])

  const [newExp, setNewExp] = useState({
    nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', categoria: '', obs: ''
  })

  const handleSave = () => {
    if (!newExp.nome || !newExp.valor) {
      alert("PREENCHA DESCRIÇÃO E VALOR!");
      return;
    }
    const novoRegistro = {
      id: Date.now(),
      nome: newExp.nome.toUpperCase(),
      categoria: newExp.categoria.toUpperCase() || 'DIVERSOS',
      valor: parseFloat(newExp.valor),
      forn: newExp.forn.toUpperCase() || 'DIVERSOS',
      venc: newExp.venc ? newExp.venc.split('-')[2] : '01',
      doc: newExp.doc.toUpperCase() || 'S/N',
      status: 'pendente',
      obs: newExp.obs.toUpperCase()
    }
    setDespesas([novoRegistro, ...despesas]);
    setShowAddExpense(false);
    setNewExp({ nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', categoria: '', obs: '' });
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* CSS DE IMPRESSÃO - ISOLAMENTO TOTAL DO EXTRATO */}
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          body * { visibility: hidden; background: white !important; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            color: black !important;
            scale: 1 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="origin-top-left scale-50 w-[200%] p-12 no-print">
        {/* HEADER E CARDS (OCULTOS NA IMPRESSÃO) */}
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-2xl font-bold uppercase tracking-[0.3em]">Valente Conecta v3.9.3</p>
          </div>
          <div className="flex gap-4 items-center bg-zinc-900 p-6 rounded-30 border-2 border-zinc-800">
             <select value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)} className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400 uppercase">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400">
                {['2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-8 mb-12">
          <StatCard title="Faturamento Total" value="R$ 12.450" color="text-white" />
          <StatCard title="Saídas Total" value={`R$ ${despesas.reduce((acc, d) => acc + d.valor, 0).toLocaleString()}`} color="text-red-500" />
          <StatCard title="Saldo Atual" value="R$ 4.050" color="text-green-500" />
          <StatCard title="Projeção Próx. Mês" value="R$ 18.200" color="text-yellow-400" />
        </div>

        <div className="flex justify-center mb-12">
           <button onClick={() => setShowAddExpense(true)} className="bg-red-600 text-white w-full max-w-4xl py-12 rounded-40 text-5xl font-black uppercase italic animate-pulse shadow-2xl">
             + Novo Lançamento de Despesa
           </button>
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO: FLUXO DE CAIXA DETALHADO */}
      <div className="px-12 pb-24">
        <section className="bg-white border-4 border-zinc-200 p-12 rounded-60 shadow-2xl text-black print-area">
            <header className="flex justify-between items-center mb-10 border-b-8 border-black pb-8">
                <div>
                    <h3 className="text-7xl font-black uppercase italic tracking-tighter">Fluxo de Caixa Detalhado</h3>
                    <p className="text-zinc-500 font-bold text-3xl uppercase tracking-widest">Referência: {selectedMonth}/{selectedYear}</p>
                </div>
                <button onClick={() => window.print()} className="no-print bg-black text-white px-10 py-5 rounded-20 font-black text-2xl uppercase hover:bg-zinc-800 transition-all">
                  🖨️ Imprimir Extrato
                </button>
            </header>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                        <th className="p-6">Descrição</th>
                        <th className="p-6">Categoria</th>
                        <th className="p-6">Fornecedor</th>
                        <th className="p-6 text-center">Venc.</th>
                        <th className="p-6">Valor</th>
                        <th className="p-6 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-4xl font-black uppercase italic tracking-tighter">
                    {despesas.map(d => (
                        <tr key={d.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50">
                            <td className="p-6">{d.nome}</td>
                            <td className="p-6 text-blue-700 text-2xl font-bold">{d.categoria}</td>
                            <td className="p-6 text-zinc-500 text-2xl">{d.forn}</td>
                            <td className="p-6 text-center text-zinc-400">{d.venc}</td>
                            <td className="p-6 text-red-600 font-black">R$ {d.valor.toFixed(2)}</td>
                            <td className="p-6 text-right uppercase text-3xl font-bold">{d.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
      </div>

      {/* MODAL COM CATEGORIA CONFIRMADA */}
      {showAddExpense && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-10 no-print">
              <div className="bg-white border-[15px] border-red-600 w-[1400px] rounded-60 p-16 text-black relative shadow-[0_0_100px_rgba(220,38,38,0.5)]">
                  <button onClick={() => setShowAddExpense(false)} className="absolute top-8 right-8 text-8xl text-zinc-300 hover:text-black">✕</button>
                  <h2 className="text-8xl font-black uppercase italic mb-12 text-red-600 border-b-8 border-red-100 pb-4">Nova Despesa</h2>
                  
                  <div className="grid grid-cols-2 gap-16">
                      <div className="space-y-10">
                          <div>
                              <label className="block text-3xl font-black uppercase italic mb-2 text-zinc-400 tracking-widest">1. Descrição do Gasto</label>
                              <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-5xl font-black uppercase focus:border-red-600 outline-none" placeholder="EX: COMPRA DE POLPAS" />
                          </div>
                          <div>
                              <label className="block text-3xl font-black uppercase italic mb-2 text-blue-600 tracking-widest">2. Categoria (Confirmada)</label>
                              <input value={newExp.categoria} onChange={e => setNewExp({...newExp, categoria: e.target.value})} type="text" className="w-full bg-blue-50 border-4 border-blue-200 p-8 rounded-30 text-5xl font-black uppercase focus:border-blue-600 outline-none" placeholder="EX: MATÉRIA PRIMA / LOGÍSTICA" />
                          </div>
                          <div>
                              <label className="block text-3xl font-black uppercase italic mb-2 text-zinc-400">Observações de Auditoria</label>
                              <textarea value={newExp.obs} onChange={e => setNewExp({...newExp, obs: e.target.value})} rows={2} className="w-full bg-zinc-100 border-4 border-zinc-200 p-8 rounded-30 text-5xl font-black uppercase outline-none focus:border-yellow-500" placeholder="NOTAS INTERNAS..."></textarea>
                          </div>
                      </div>

                      <div className="space-y-10">
                          <div>
                              <label className="block text-4xl font-black uppercase italic mb-2 text-red-600">Valor R$</label>
                              <input value={newExp.valor} onChange={e => setNewExp({...newExp, valor: e.target.value})} type="number" className="w-full bg-zinc-50 border-4 border-zinc-200 p-10 rounded-30 text-7xl font-black text-red-600 outline-none focus:border-red-600" placeholder="0,00" />
                          </div>
                          <div>
                              <label className="block text-3xl font-black uppercase italic mb-2">Fornecedor / Origem</label>
                              <input value={newExp.forn} onChange={e => setNewExp({...newExp, forn: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                              <div>
                                  <label className="block text-2xl font-black uppercase italic mb-2 text-zinc-400">Vencimento</label>
                                  <input value={newExp.venc} onChange={e => setNewExp({...newExp, venc: e.target.value})} type="date" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-3xl font-black" />
                              </div>
                              <div>
                                  <label className="block text-2xl font-black uppercase italic mb-2 text-zinc-400">Doc / NF</label>
                                  <input value={newExp.doc} onChange={e => setNewExp({...newExp, doc: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase" />
                              </div>
                          </div>
                      </div>
                  </div>
                  <button onClick={handleSave} className="w-full mt-16 bg-red-600 p-14 rounded-40 text-7xl font-black uppercase italic text-white shadow-2xl hover:bg-black transition-all transform active:scale-95">
                     ✅ Salvar e Registrar no Extrato
                  </button>
              </div>
          </div>
      )}
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-40 flex flex-col justify-between">
      <p className="text-zinc-500 font-black uppercase text-xl">{title}</p>
      <p className={`text-6xl font-black ${color} tracking-tighter italic`}>{value}</p>
      <div className="border-t border-zinc-800 mt-4 pt-2 text-[10px] text-zinc-700 font-black uppercase">Origem Confirmada</div>
    </div>
  )
}