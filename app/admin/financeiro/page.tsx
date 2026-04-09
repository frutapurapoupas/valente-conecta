'use client'
import { useState } from 'react'

export default function FinanceiroMaster() {
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [despesas, setDespesas] = useState([
    { id: 1, nome: 'PRÓ-LABORE', categoria: 'PESSOAL', valor: 3500, venc: '05', status: 'PAGO', forn: 'DIRETORIA', parc: '1/1', obs: 'RETIRADA MENSAL' },
    { id: 2, nome: 'ALUGUEL ESCRITÓRIO', categoria: 'FIXO', valor: 1200, venc: '10', status: 'PAGO', forn: 'COWORKING', parc: '1/1', obs: 'SALA 04' },
  ])

  const [newExp, setNewExp] = useState({ 
    nome: '', valor: '', forn: '', venc: '', doc: '', 
    categoria: 'MATÉRIA PRIMA', obs: '', parcelas: '1' 
  })

  const handleSave = () => {
    if (!newExp.nome || !newExp.valor) return alert("DESCRIÇÃO E VALOR OBRIGATÓRIOS!");
    const totalParcelas = parseInt(newExp.parcelas) || 1;
    
    const novo = {
      id: Date.now(),
      nome: newExp.nome.toUpperCase(),
      categoria: newExp.categoria,
      valor: parseFloat(newExp.valor),
      forn: newExp.forn.toUpperCase() || 'DIVERSOS',
      venc: newExp.venc ? newExp.venc.split('-')[2] : '01',
      status: 'PENDENTE',
      parc: `1/${totalParcelas}`,
      obs: newExp.obs.toUpperCase()
    }
    setDespesas([novo, ...despesas]);
    setShowAddExpense(false);
    setNewExp({ nome: '', valor: '', forn: '', venc: '', doc: '', categoria: 'MATÉRIA PRIMA', obs: '', parcelas: '1' });
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-yellow-400 font-sans">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { 
            position: absolute !important; left: 0 !important; top: 0 !important; 
            width: 100% !important; scale: 1 !important; border:none !important; 
          }
        }
      `}</style>

      {/* ESCALA REDUZIDA PARA 0.55 CONFORME SOLICITADO */}
      <div className="origin-top-left scale-[0.55] w-[181.8%] p-10">
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10 no-print">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
          </div>
          <button onClick={() => setShowAddExpense(true)} className="bg-red-600 text-white px-16 py-8 rounded-25 text-5xl font-black uppercase italic shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:bg-white hover:text-red-600 transition-all">+ Novo Lançamento</button>
        </header>

        {/* CARDS COM ORIGEM DOS DADOS REATIVADA */}
        <div className="grid grid-cols-4 gap-8 mb-16 no-print">
          <StatCard title="Entrada Total" value="R$ 12.450" color="text-white" origin="VALENTE-BA" />
          <StatCard title="Saídas Total" value={`R$ ${despesas.reduce((acc, d) => acc + d.valor, 0).toLocaleString()}`} color="text-red-500" origin="DESPESAS REAIS" />
          <StatCard title="Saldo Atual" value="R$ 4.050" color="text-green-500" origin="BÔNUS" />
          <StatCard title="Projeção" value="R$ 18.200" color="text-yellow-400" origin="METAS 2026" />
        </div>

        {/* ÁREA DE IMPRESSÃO - ENQUADRAMENTO APENAS NA PARTE BRANCA */}
        <section className="bg-white text-black p-12 rounded-60 shadow-2xl print-area">
          <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-6">
            <div>
              <h2 className="text-7xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">Fluxo de Caixa Detalhado</h2>
              <p className="text-2xl font-bold uppercase text-zinc-400 tracking-[0.3em] mt-2 italic">Auditoria Mensal - Registro Ativo</p>
            </div>
            <button onClick={() => window.print()} className="bg-black text-white px-12 py-5 rounded-20 font-black text-3xl uppercase no-print">🖨️ Imprimir</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                <th className="p-6">Descrição / Origem / Obs</th>
                <th className="p-6 text-center">Categoria</th>
                <th className="p-6 text-center">Sequência</th>
                <th className="p-6 text-center">Valor</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-4xl font-black uppercase italic tracking-tighter">
              {despesas.map(d => (
                <tr key={d.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50">
                  <td className="p-6">
                    {d.nome} {d.obs && <span className="text-xl opacity-40 not-italic ml-2">[{d.obs}]</span>}
                    <div className="text-xl text-zinc-400 not-italic font-bold tracking-widest uppercase mt-1">{d.forn}</div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-15 text-2xl font-black uppercase">{d.categoria}</span>
                  </td>
                  <td className="p-6 text-center text-zinc-400 font-mono text-3xl">{d.parc}</td>
                  <td className="p-6 text-center text-red-600 font-black">R$ {d.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="p-6 text-right font-black border-l-2 border-zinc-50">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* MODAL COM CAMPO OBSERVAÇÕES E PARCELAS ATUALIZADO */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-10 no-print">
          <div className="bg-white border-[15px] border-red-600 w-[1300px] rounded-60 p-16 text-black shadow-2xl relative">
            <button onClick={() => setShowAddExpense(false)} className="absolute top-10 right-10 text-7xl text-zinc-300 hover:text-black">✕</button>
            <h2 className="text-8xl font-black uppercase italic mb-10 border-b-8 border-red-600 pb-4 inline-block tracking-tighter">Registrar Despesa</h2>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-3xl font-black uppercase italic text-zinc-400 mb-2 block">1. Descrição / Favorecido</label>
                  <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                  <input value={newExp.obs} onChange={e => setNewExp({...newExp, obs: e.target.value})} className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 rounded-20 text-2xl mt-4 font-bold uppercase outline-none" placeholder="OBSERVAÇÕES (EX: REFERENTE A CARGA X)..." />
                </div>
                <div>
                  <label className="text-3xl font-black uppercase italic text-blue-600 mb-2 block">2. Categoria</label>
                  <select value={newExp.categoria} onChange={e => setNewExp({...newExp, categoria: e.target.value})} className="w-full bg-blue-50 border-4 border-blue-200 p-8 rounded-30 text-4xl font-black uppercase outline-none">
                    <option>MATÉRIA PRIMA</option>
                    <option>LOGÍSTICA</option>
                    <option>PESSOAL</option>
                    <option>FIXO</option>
                    <option>SOFTWARE</option>
                    <option>MARKETING</option>
                    <option>DIVERSOS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="text-3xl font-black uppercase italic text-red-600 mb-2 block">Valor R$</label>
                    <input type="number" value={newExp.valor} onChange={e => setNewExp({...newExp, valor: e.target.value})} className="w-full bg-zinc-50 border-4 border-red-200 p-8 rounded-30 text-6xl font-black text-red-600 outline-none" placeholder="0.00" />
                  </div>
                  <div className="w-48">
                    <label className="text-3xl font-black uppercase italic text-zinc-400 mb-2 block">Parcelas</label>
                    <input type="number" value={newExp.parcelas} onChange={e => setNewExp({...newExp, parcelas: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-6xl font-black outline-none text-center" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Vencimento</label>
                    <input type="date" value={newExp.venc} onChange={e => setNewExp({...newExp, venc: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-3xl font-black outline-none" />
                  </div>
                  <div>
                    <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Fornecedor / Origem</label>
                    <input value={newExp.forn} onChange={e => setNewExp({...newExp, forn: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-3xl font-black outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-6">
              <button onClick={() => setShowAddExpense(false)} className="flex-1 bg-zinc-100 hover:bg-zinc-200 p-10 rounded-40 text-4xl font-black uppercase italic">Cancelar</button>
              <button onClick={handleSave} className="flex-[2] bg-red-600 text-white p-10 rounded-40 text-6xl font-black uppercase italic shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:bg-black transition-all">✅ Salvar Lançamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, color, origin }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-40">
      <p className="text-zinc-500 font-black uppercase text-xl mb-2 tracking-widest italic">{title}</p>
      <p className={`text-6xl font-black ${color} italic tracking-tighter leading-none`}>{value}</p>
      <p className="text-zinc-700 font-black text-lg uppercase mt-4 tracking-[0.2em]">{origin}</p>
    </div>
  )
}