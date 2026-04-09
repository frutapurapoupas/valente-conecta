'use client'
import { useState } from 'react'

export default function FinanceiroMaster() {
  const [selectedMonth, setSelectedMonth] = useState('04')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  // Estado das despesas atualizável
  const [despesas, setDespesas] = useState([
    { id: 1, nome: 'PRÓ-LABORE', valor: 3500, venc: '05', doc: 'DOC-001', status: 'pago', forn: 'DIRETORIA', obs: 'RETIRADA MENSAL' },
    { id: 2, nome: 'ALUGUEL ESCRITÓRIO', valor: 100, venc: '10', doc: 'AL-99', status: 'pago', forn: 'COWORKING', obs: '' },
    { id: 3, nome: 'SUPABASE / DB', valor: 200, venc: '15', doc: 'SUPA-1', status: 'pendente', forn: 'SUPABASE', obs: 'HOSPEDAGEM BANCO' },
  ])

  // Estado do Formulário
  const [newExp, setNewExp] = useState({
    nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', obs: ''
  })

  // FUNÇÃO SALVAR ATIVA
  const handleSave = () => {
    if (!newExp.nome || !newExp.valor) {
      alert("PREENCHA DESCRIÇÃO E VALOR!");
      return;
    }
    const novoRegistro = {
      id: Date.now(),
      nome: newExp.nome.toUpperCase(),
      valor: parseFloat(newExp.valor),
      forn: newExp.forn.toUpperCase() || 'DIVERSOS',
      venc: newExp.venc ? newExp.venc.split('-')[2] : '01',
      doc: newExp.doc.toUpperCase() || 'S/N',
      status: 'pendente',
      obs: newExp.obs.toUpperCase()
    }
    setDespesas([novoRegistro, ...despesas]);
    setShowAddExpense(false);
    setNewExp({ nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', obs: '' });
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; scale: 1 !important; border: none !important; }
        }
      `}</style>

      <div className="origin-top-left scale-50 w-[200%] p-12">
        
        {/* HEADER */}
        <header className="mb-12 flex justify-between items-center no-print">
          <div>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-2xl font-bold uppercase tracking-[0.3em]">Valente Conecta v3.9</p>
          </div>
          <div className="flex gap-4 items-center bg-zinc-900 p-6 rounded-30 border-2 border-zinc-800">
             <select value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)} className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400">
                {['2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>
        </header>

        {/* CARDS SUPERIORES AJUSTADOS (TAMANHO CORRIGIDO) */}
        <div className="grid grid-cols-4 gap-8 mb-12 no-print">
          <StatCard title="Faturamento Total" value="R$ 12.450" color="text-white" />
          <StatCard title="Saídas Total" value={`R$ ${despesas.reduce((acc, d) => acc + d.valor, 0).toLocaleString()}`} color="text-red-500" />
          <StatCard title="Saldo Atual" value="R$ 4.050" color="text-green-500" />
          <StatCard title="Projeção Próx. Mês" value="R$ 18.200" color="text-yellow-400" />
        </div>

        {/* CUSTOS RÁPIDOS */}
        <div className="grid grid-cols-2 gap-10 mb-12 no-print">
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60">
            <h3 className="text-4xl font-black uppercase italic mb-10 text-yellow-400 border-b-4 border-zinc-800 pb-6">Despesas Recentes</h3>
            <div className="h-[250px] overflow-y-auto space-y-4">
                {despesas.slice(0, 4).map(d => (
                    <div key={d.id} className="flex justify-between p-4 bg-black/50 rounded-15 border border-zinc-800">
                        <span className="text-2xl font-black italic">{d.nome}</span>
                        <span className="text-3xl font-black text-red-500">R$ {d.valor.toFixed(2)}</span>
                    </div>
                ))}
            </div>
          </section>

          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 flex flex-col justify-center items-center">
             <h3 className="text-3xl font-black uppercase mb-8">Novo Lançamento</h3>
             <button onClick={() => setShowAddExpense(true)} className="bg-red-600 text-white w-full py-10 rounded-30 text-5xl font-black uppercase italic animate-pulse shadow-2xl hover:bg-white hover:text-red-600 transition-all">
               + Abrir Formulário
             </button>
          </section>
        </div>

        {/* EXTRATO (PRINT ONLY) */}
        <section className="bg-white border-4 border-zinc-200 p-12 rounded-60 shadow-2xl text-black print-only">
            <header className="flex justify-between items-center mb-10 border-b-4 border-zinc-100 pb-8">
                <div>
                    <h3 className="text-6xl font-black uppercase italic tracking-tighter text-zinc-900">Fluxo de Caixa Detalhado</h3>
                    <p className="text-zinc-400 font-bold text-2xl uppercase italic">Mês de Referência: {selectedMonth}/{selectedYear}</p>
                </div>
                <div className="flex gap-4 no-print">
                    <button onClick={() => window.print()} className="bg-zinc-100 border-2 border-zinc-400 text-black px-8 py-4 rounded-15 font-black text-2xl uppercase">🖨️ Imprimir</button>
                </div>
            </header>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b-4 border-zinc-100 text-zinc-400 font-black uppercase text-2xl">
                        <th className="p-6">Descrição</th>
                        <th className="p-6">Fornecedor</th>
                        <th className="p-6 text-center">Venc.</th>
                        <th className="p-6">Valor</th>
                        <th className="p-6 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-4xl font-black uppercase italic tracking-tighter">
                    {despesas.map(d => (
                        <tr key={d.id} className="border-b-2 border-zinc-50">
                            <td className="p-6">{d.nome}</td>
                            <td className="p-6 text-zinc-400 text-2xl">{d.forn}</td>
                            <td className="p-6 text-center text-zinc-400">{d.venc}</td>
                            <td className="p-6 text-red-600 font-black">R$ {d.valor.toFixed(2)}</td>
                            <td className="p-6 text-right uppercase text-3xl font-bold">{d.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* MODAL COM OBSERVAÇÃO GIGANTE EDITÁVEL */}
        {showAddExpense && (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-10 no-print">
                <div className="bg-white border-[12px] border-red-600 w-[1400px] rounded-60 p-16 text-black relative">
                    <button onClick={() => setShowAddExpense(false)} className="absolute top-8 right-8 text-7xl text-zinc-300 hover:text-black">✕</button>
                    <h2 className="text-7xl font-black uppercase italic mb-12 text-red-600 underline underline-offset-8">Registrar Despesa</h2>
                    
                    <div className="grid grid-cols-2 gap-12 text-left">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Descrição</label>
                                <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                            </div>
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Valor (R$)</label>
                                <input value={newExp.valor} onChange={e => setNewExp({...newExp, valor: e.target.value})} type="number" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black text-red-600 outline-none focus:border-red-600" />
                            </div>
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4 text-zinc-500">Observações Privadas (AUDITORIA)</label>
                                <textarea value={newExp.obs} onChange={e => setNewExp({...newExp, obs: e.target.value})} rows={3} className="w-full bg-zinc-100 border-4 border-zinc-300 p-8 rounded-30 text-5xl font-black uppercase outline-none focus:border-yellow-500" placeholder="DESCREVA AQUI..."></textarea>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Fornecedor</label>
                                <input value={newExp.forn} onChange={e => setNewExp({...newExp, forn: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4 text-zinc-400 underline">Vencimento</label>
                                    <input value={newExp.venc} onChange={e => setNewExp({...newExp, venc: e.target.value})} type="date" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-3xl font-black" />
                                </div>
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4 text-zinc-400">Doc / NF</label>
                                    <input value={newExp.doc} onChange={e => setNewExp({...newExp, doc: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full mt-14 bg-red-600 p-12 rounded-40 text-6xl font-black uppercase italic text-white shadow-2xl hover:bg-black transition-all">
                       Salvar e Atualizar Extrato
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-40 shadow-xl flex flex-col justify-between hover:border-zinc-600 transition-all">
      <p className="text-zinc-500 font-black uppercase mb-2 text-xl tracking-tighter">{title}</p>
      <p className={`text-5xl font-black ${color} tracking-tighter italic leading-none mb-4`}>{value}</p>
      <button className="text-[10px] font-black uppercase text-zinc-700 hover:text-white border-t border-zinc-800 pt-3 text-left">
        Ver Origem →
      </button>
    </div>
  )
}