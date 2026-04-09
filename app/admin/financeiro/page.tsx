'use client'
import { useState } from 'react'

export default function Financeiro() {
  const [selectedMonth, setSelectedMonth] = useState('04')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  // Estado das despesas (agora dinâmico para permitir inclusão)
  const [despesas, setDespesas] = useState([
    { id: 1, cat: 'Fixa', nome: 'Pró-labore', valor: 3500, venc: '05', doc: 'DOC-001', status: 'pago', forn: 'Diretoria', obs: '' },
    { id: 2, cat: 'Fixa', nome: 'Aluguel Escritório', valor: 100, venc: '10', doc: 'AL-99', status: 'pago', forn: 'Coworking Central', obs: '' },
    { id: 3, cat: 'Fixa', nome: 'Hospedagem / Servidor', valor: 300, venc: '15', doc: 'VRC-88', status: 'pendente', forn: 'Vercel', obs: '' },
    { id: 4, cat: 'Fixa', nome: 'Banco de Dados (Supabase)', valor: 200, venc: '15', doc: 'SUPA-1', status: 'pendente', forn: 'Supabase Inc', obs: '' },
    { id: 5, cat: 'Fixa', nome: 'Domínio + DNS', valor: 50, venc: '20', doc: 'REG-BA', status: 'pago', forn: 'Registro BR', obs: '' },
    { id: 12, cat: 'Variável', nome: 'Taxas Transações', valor: 850, venc: '30', doc: 'GATE-7', status: 'alerta', forn: 'Pagar.me', obs: '' },
    { id: 15, cat: 'Variável', nome: 'Tráfego Pago', valor: 1200, venc: '25', doc: 'FB-ADS', status: 'pendente', forn: 'Meta Ads', parc: '1/1', obs: '' },
  ])

  // Estado para o formulário
  const [newExp, setNewExp] = useState({
    nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', cat: 'Fixa', obs: ''
  })

  // FUNÇÃO: Salvar e Registrar
  const handleSave = () => {
    if (!newExp.nome || !newExp.valor) return alert("Preencha Nome e Valor!")
    
    const novaDespesa = {
      id: Date.now(),
      cat: newExp.cat,
      nome: newExp.nome,
      valor: parseFloat(newExp.valor),
      venc: newExp.venc ? newExp.venc.split('-')[2] : '01',
      doc: newExp.doc || '---',
      status: 'pendente',
      forn: newExp.forn || 'Diversos',
      parc: `${newExp.parc}/${newExp.parc}`,
      obs: newExp.obs
    }

    setDespesas([novaDespesa, ...despesas]) // Adiciona no topo da lista
    setShowAddExpense(false) // Fecha o modal
    setNewExp({ nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', cat: 'Fixa', obs: '' }) // Limpa campos
  }

  const exportToExcel = () => {
    const header = "Descricao;Fornecedor;Doc;Vencimento;Valor;Status\n";
    const rows = despesas.map(d => `${d.nome};${d.forn};${d.doc};${d.venc}/${selectedMonth};${d.valor};${d.status}`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `extrato_${selectedMonth}_${selectedYear}.csv`);
    link.click();
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { position: absolute; top: 0; left: 0; width: 100% !important; scale: 1 !important; margin: 0 !important; }
          .origin-top-left { scale: 1 !important; width: 100% !important; }
        }
      `}</style>

      <div className="origin-top-left scale-50 w-[200%] p-12">
        
        {/* HEADER */}
        <header className="mb-12 flex justify-between items-center no-print">
          <div>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-2xl font-bold uppercase tracking-[0.3em]">Valente Conecta v3.8</p>
          </div>
          
          <div className="flex gap-4 items-center bg-zinc-900 p-6 rounded-30 border-2 border-zinc-800">
             <select value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)} className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400">
                {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400">
                {['2024','2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
          </div>
        </header>

        {/* ESTRUTURA SUPERIOR (Cards e Centro de Custos) - no-print */}
        <div className="no-print grid grid-cols-2 gap-10 mb-12">
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60">
             <div className="flex justify-between items-center mb-10 border-b-4 border-zinc-800 pb-6">
                <h3 className="text-4xl font-black uppercase italic text-red-500">Resumo de Custos</h3>
                <button onClick={() => setShowAddExpense(true)} className="bg-red-600 px-8 py-4 rounded-20 font-black text-2xl uppercase animate-bounce">+ Incluir Despesa</button>
             </div>
             <div className="h-[300px] overflow-y-auto space-y-4 pr-4">
                {despesas.slice(0, 5).map(d => (
                    <div key={d.id} className="flex justify-between p-6 bg-black/50 rounded-25 border border-zinc-800">
                        <span className="text-2xl font-black italic">{d.nome}</span>
                        <span className="text-3xl font-black text-red-500">R$ {d.valor.toFixed(2)}</span>
                    </div>
                ))}
             </div>
          </section>
          <div className="grid grid-rows-2 gap-8">
            <StatCard title="Total Saídas" value={`R$ ${despesas.reduce((acc, d) => acc + d.valor, 0).toLocaleString()}`} color="text-red-500" />
            <StatCard title="Saldo Previsto" value="R$ 4.050,00" color="text-green-500" />
          </div>
        </div>

        {/* EXTRATO BRANCO (Foco da Impressão) */}
        <section className="bg-white border-4 border-zinc-200 p-12 rounded-60 shadow-2xl text-black print-only">
            <header className="flex justify-between items-center mb-10 border-b-4 border-zinc-100 pb-8">
                <div>
                    <h3 className="text-6xl font-black uppercase italic tracking-tighter">Fluxo de Caixa Detalhado</h3>
                    <p className="text-zinc-400 font-bold text-2xl uppercase italic">Relatório Oficial: {selectedMonth}/{selectedYear}</p>
                </div>
                <div className="flex gap-4 no-print">
                    <button onClick={() => window.print()} className="bg-zinc-100 border-2 border-zinc-300 text-zinc-600 px-8 py-4 rounded-15 font-black text-2xl uppercase">🖨️ Imprimir</button>
                    <button onClick={exportToExcel} className="bg-green-100 border-2 border-green-300 text-green-700 px-8 py-4 rounded-15 font-black text-2xl uppercase">📊 Excel</button>
                </div>
            </header>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-4 border-zinc-100 text-zinc-400 font-black uppercase text-2xl">
                        <th className="p-6">Descrição</th>
                        <th className="p-6">Fornecedor</th>
                        <th className="p-6">Vencimento</th>
                        <th className="p-6">Valor</th>
                        <th className="p-6 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-4xl font-black uppercase italic tracking-tighter">
                    {despesas.map(d => (
                        <tr key={d.id} className="border-b-2 border-zinc-50 hover:bg-zinc-50">
                            <td className="p-6 text-zinc-900">{d.nome}</td>
                            <td className="p-6 text-zinc-400 text-2xl">{d.forn}</td>
                            <td className="p-6 text-zinc-800">{d.venc}/{selectedMonth}</td>
                            <td className="p-6 text-red-600 font-black">R$ {d.valor.toFixed(2)}</td>
                            <td className="p-6 text-right font-black uppercase text-3xl">{d.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* MODAL DE INCLUSÃO (Ativo) */}
        {showAddExpense && (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-10 no-print">
                <div className="bg-white border-[12px] border-red-600 w-[1400px] rounded-60 p-16 text-black relative">
                    <button onClick={() => setShowAddExpense(false)} className="absolute top-8 right-8 text-7xl text-zinc-300 hover:text-black transition-all">✕</button>
                    <h2 className="text-7xl font-black uppercase italic mb-12 text-red-600 underline">Novo Lançamento</h2>
                    
                    <div className="grid grid-cols-2 gap-12 text-left">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Descrição</label>
                                <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase" />
                            </div>
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Valor (R$)</label>
                                <input value={newExp.valor} onChange={e => setNewExp({...newExp, valor: e.target.value})} type="number" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black text-red-600" />
                            </div>
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4 italic text-zinc-400">Observações Privadas</label>
                                <textarea value={newExp.obs} onChange={e => setNewExp({...newExp, obs: e.target.value})} rows={3} className="w-full bg-zinc-100 border-4 border-zinc-200 p-8 rounded-30 text-5xl font-black uppercase outline-none focus:border-red-600" placeholder="NOTAS DE AUDITORIA..."></textarea>
                            </div>
                        </div>

                        <div className="space-y-8 text-left">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4 underline">Fornecedor</label>
                                <input value={newExp.forn} onChange={e => setNewExp({...newExp, forn: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4 italic">Vencimento (📅)</label>
                                    <input value={newExp.venc} onChange={e => setNewExp({...newExp, venc: e.target.value})} type="date" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-3xl font-black" />
                                </div>
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4 italic text-zinc-400">Parcelas</label>
                                    <input value={newExp.parc} onChange={e => setNewExp({...newExp, parc: e.target.value})} type="number" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full mt-14 bg-red-600 p-12 rounded-40 text-5xl font-black uppercase italic text-white shadow-2xl hover:bg-black transition-all">Salvar e Registrar Extrato</button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 shadow-xl flex flex-col justify-between">
      <p className="text-zinc-500 font-black uppercase mb-6 text-2xl tracking-tighter">{title}</p>
      <p className={`text-8xl font-black ${color} tracking-tighter italic leading-none`}>{value}</p>
    </div>
  )
}