'use client'
import { useState } from 'react'

export default function Financeiro() {
  const [selectedMonth, setSelectedMonth] = useState('04')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  const [despesas, setDespesas] = useState([
    { id: 1, nome: 'Pró-labore', valor: 3500, venc: '05', doc: 'DOC-001', status: 'pago', forn: 'Diretoria', obs: 'Retirada mensal sócios' },
    { id: 2, nome: 'Aluguel Escritório', valor: 100, venc: '10', doc: 'AL-99', status: 'pago', forn: 'Coworking', obs: '' },
    { id: 4, nome: 'Supabase / DB', valor: 200, venc: '15', doc: 'SUPA-1', status: 'pendente', forn: 'Supabase', obs: 'Hospedagem banco de dados' },
  ])

  const [newExp, setNewExp] = useState({
    nome: '', valor: '', forn: '', venc: '', doc: '', parc: '1', obs: ''
  })

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* CSS DE IMPRESSÃO REFINADO: SÓ O EXTRATO BRANCO APARECE */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            scale: 1 !important; 
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="origin-top-left scale-50 w-[200%] p-12">
        
        {/* HEADER COM FILTROS ATIVOS */}
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

        {/* CARDS SUPERIORES REATIVADOS (ESCONDER NA IMPRESSÃO) */}
        <div className="grid grid-cols-4 gap-8 mb-12 no-print">
          <StatCard title="Faturamento Total" value="R$ 12.450" color="text-white" link="/admin/financeiro/vendas" />
          <StatCard title="Saídas Total" value="R$ 8.400" color="text-red-500" link="/admin/financeiro/despesas" />
          <StatCard title="Saldo Atual" value="R$ 4.050" color="text-green-500" link="/admin/financeiro/fluxo" />
          <StatCard title="Projeção Próx. Mês" value="R$ 18.200" color="text-yellow-400" link="/admin/financeiro/metas" />
        </div>

        {/* ÁREA CENTRAL: FATURAMENTO E CUSTOS RÁPIDOS (ESCONDER NA IMPRESSÃO) */}
        <div className="grid grid-cols-2 gap-10 mb-12 no-print">
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60">
            <h3 className="text-4xl font-black uppercase italic mb-10 text-yellow-400 border-b-4 border-zinc-800 pb-6">Faturamento por Categoria</h3>
            <FaturamentoRow label="Assinaturas" valor="6.800,00" perc="55%" />
          </section>

          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60">
            <div className="flex justify-between items-center mb-10 border-b-4 border-zinc-800 pb-6">
                <h3 className="text-4xl font-black uppercase italic text-red-500">Custos Reais</h3>
                <button onClick={() => setShowAddExpense(true)} className="bg-red-600 text-white px-8 py-4 rounded-20 font-black text-2xl uppercase animate-bounce">+ Incluir Despesa</button>
            </div>
            <div className="h-[250px] overflow-y-auto space-y-4">
                {despesas.map(d => (
                    <div key={d.id} className="flex justify-between p-4 bg-black/50 rounded-15 border border-zinc-800">
                        <span className="text-2xl font-black italic uppercase">{d.nome}</span>
                        <span className="text-3xl font-black">R$ {d.valor.toFixed(2)}</span>
                    </div>
                ))}
            </div>
          </section>
        </div>

        {/* EXTRATO FLUXO DE CAIXA DETALHADO (A ÚNICA PARTE QUE SAI NO PAPEL) */}
        <section className="bg-white border-4 border-zinc-200 p-12 rounded-60 shadow-2xl text-black print-only">
            <header className="flex justify-between items-center mb-10 border-b-4 border-zinc-100 pb-8">
                <div>
                    <h3 className="text-6xl font-black uppercase italic tracking-tighter">Fluxo de Caixa Detalhado</h3>
                    <p className="text-zinc-400 font-bold text-2xl uppercase italic">Extrato Mensal: {selectedMonth}/{selectedYear}</p>
                </div>
                <div className="flex gap-4 no-print">
                    <button onClick={() => window.print()} className="bg-zinc-100 border-2 border-zinc-400 text-black px-8 py-4 rounded-15 font-black text-2xl uppercase">🖨️ Imprimir Apenas Extrato</button>
                    <button className="bg-green-600 text-white px-8 py-4 rounded-15 font-black text-2xl uppercase">📊 Excel</button>
                </div>
            </header>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-4 border-zinc-100 text-zinc-400 font-black uppercase text-2xl">
                        <th className="p-6">Descrição</th>
                        <th className="p-6">Fornecedor</th>
                        <th className="p-6">Doc. Origem</th>
                        <th className="p-6">Valor</th>
                        <th className="p-6 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-4xl font-black uppercase italic tracking-tighter">
                    {despesas.map(d => (
                        <tr key={d.id} className="border-b-2 border-zinc-50">
                            <td className="p-6">{d.nome}</td>
                            <td className="p-6 text-zinc-400 text-2xl">{d.forn}</td>
                            <td className="p-6 text-zinc-400 text-2xl">{d.doc}</td>
                            <td className="p-6 text-red-600">R$ {d.valor.toFixed(2)}</td>
                            <td className="p-6 text-right uppercase text-3xl">{d.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        {/* MODAL DE INCLUSÃO COM OBSERVAÇÃO EDITÁVEL E FONTE GIGANTE */}
        {showAddExpense && (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-10 no-print">
                <div className="bg-white border-[12px] border-red-600 w-[1400px] rounded-60 p-16 text-black relative">
                    <button onClick={() => setShowAddExpense(false)} className="absolute top-8 right-8 text-7xl text-zinc-300 hover:text-black">✕</button>
                    <h2 className="text-7xl font-black uppercase italic mb-12 text-red-600">Novo Lançamento</h2>
                    
                    <div className="grid grid-cols-2 gap-12 text-left">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Descrição</label>
                                <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                            </div>
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Valor (R$)</label>
                                <input value={newExp.valor} onChange={e => setNewExp({...newExp, valor: e.target.value})} type="number" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black text-red-600" />
                            </div>
                            {/* CAMPO OBSERVAÇÃO SENDO EDITÁVEL E TRIPLO DO TAMANHO */}
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4 text-zinc-500">Observações Privadas</label>
                                <textarea 
                                  value={newExp.obs} 
                                  onChange={e => setNewExp({...newExp, obs: e.target.value})} 
                                  rows={4} 
                                  className="w-full bg-zinc-100 border-4 border-zinc-300 p-8 rounded-30 text-5xl font-black uppercase outline-none focus:border-yellow-500 focus:bg-white transition-all" 
                                  placeholder="DIGITE AQUI AS NOTAS DESTA DESPESA..."
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
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
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Documento / NF</label>
                                <input value={newExp.doc} onChange={e => setNewExp({...newExp, doc: e.target.value})} type="text" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase" />
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-14 bg-red-600 p-12 rounded-40 text-5xl font-black uppercase italic text-white shadow-2xl hover:bg-black transition-all">Salvar e Registrar no Extrato</button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color, link }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-50 shadow-xl flex flex-col justify-between hover:border-zinc-500 transition-all">
      <p className="text-zinc-500 font-black uppercase mb-4 text-xl tracking-tighter">{title}</p>
      <p className={`text-6xl font-black ${color} tracking-tighter italic leading-none mb-6`}>{value}</p>
      <button onClick={() => window.location.href = link} className="text-sm font-black uppercase text-zinc-600 hover:text-white border-t border-zinc-800 pt-4 text-left">
        Ver Detalhes →
      </button>
    </div>
  )
}

function FaturamentoRow({ label, valor, perc }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between font-black uppercase italic items-end">
        <span className="text-3xl text-zinc-300">{label}</span>
        <span className="text-5xl text-yellow-400 tracking-tighter">R$ {valor}</span>
      </div>
      <div className="w-full bg-zinc-800 h-6 rounded-full overflow-hidden border border-zinc-700">
        <div className="bg-yellow-400 h-full rounded-full" style={{ width: perc }}></div>
      </div>
    </div>
  )
}