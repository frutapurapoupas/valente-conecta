'use client'
import { useState, useEffect } from 'react'

export default function FinanceiroMaster() {
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  // 1. DESPESAS FIXAS ANTERIORES CARREGADAS
  const [despesas, setDespesas] = useState([
    { id: 1, nome: 'ALUGUEL SALA 04', categoria: 'FIXO', valor: 1200, venc: '10', status: 'PAGO', forn: 'COWORKING VALENTE', parc: '1/12', obs: 'CONTRATO ANUAL', criado_em: '01/04/2026' },
    { id: 2, nome: 'COELBA - ENERGIA', categoria: 'FIXO', valor: 450.80, venc: '15', status: 'PAGO', forn: 'COELBA', parc: '1/1', obs: 'MÊS REF MARÇO', criado_em: '02/04/2026' },
    { id: 3, nome: 'INTERNET FIBRA', categoria: 'FIXO', valor: 149.90, venc: '05', status: 'PAGO', forn: 'NET VALENTE', parc: '1/1', obs: 'PLANO EMPRESARIAL', criado_em: '03/04/2026' },
    { id: 4, nome: 'MENSALIDADE SUPABASE', categoria: 'SOFTWARE', valor: 135.00, venc: '20', status: 'PENDENTE', forn: 'SUPABASE INC', parc: '1/1', obs: 'DATABASE PRO', criado_em: '05/04/2026' },
  ])

  // DATA DE HOJE COMO PADRÃO PARA O FORMULÁRIO
  const hoje = new Date().toISOString().split('T')[0];

  const [newExp, setNewExp] = useState({ 
    nome: '', valor: '', forn: '', venc: hoje, doc: '', 
    categoria: 'FIXO', obs: '', parcelas: '1' 
  })

  const handleSave = () => {
    if (!newExp.nome || !newExp.valor) return alert("PREENCHA OS CAMPOS OBRIGATÓRIOS!");
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const novo = {
      id: Date.now(),
      nome: newExp.nome.toUpperCase(),
      categoria: newExp.categoria,
      valor: parseFloat(newExp.valor),
      forn: newExp.forn.toUpperCase() || 'DIVERSOS',
      venc: newExp.venc.split('-')[2], // Pega apenas o dia para o extrato
      status: 'PENDENTE',
      parc: `1/${newExp.parcelas}`,
      obs: newExp.obs.toUpperCase(),
      criado_em: dataAtual // DATA DA INSERÇÃO
    }
    setDespesas([novo, ...despesas]);
    setShowAddExpense(false);
    setNewExp({ nome: '', valor: '', forn: '', venc: hoje, doc: '', categoria: 'FIXO', obs: '', parcelas: '1' });
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-yellow-400 font-sans">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; scale: 1 !important; }
        }
      `}</style>

      <div className="origin-top-left scale-[0.55] w-[181.8%] p-10">
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10 no-print">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
          </div>
          <button onClick={() => setShowAddExpense(true)} className="bg-red-600 text-white px-16 py-8 rounded-25 text-5xl font-black uppercase italic shadow-[0_0_50px_rgba(220,38,38,0.4)]">+ Novo Lançamento</button>
        </header>

        <section className="bg-white text-black p-12 rounded-60 shadow-2xl print-area">
          <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-6">
            <h2 className="text-7xl font-black uppercase italic tracking-tighter text-zinc-900">Fluxo de Caixa Detalhado</h2>
            <button onClick={() => window.print()} className="bg-black text-white px-12 py-5 rounded-20 font-black text-3xl uppercase no-print">🖨️ Imprimir</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                <th className="p-4">Inserção</th>
                <th className="p-4">Descrição / Favorecido / Obs</th>
                <th className="p-4 text-center">Cat.</th>
                <th className="p-4 text-center">Venc.</th>
                <th className="p-4 text-center">Seq.</th>
                <th className="p-4 text-center">Valor</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-3xl font-black uppercase italic tracking-tighter">
              {despesas.map(d => (
                <tr key={d.id} className="border-b-2 border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <td className="p-4 text-zinc-300 text-xl font-mono">{d.criado_em}</td>
                  <td className="p-4">
                    {d.nome} <span className="text-lg opacity-40 not-italic">[{d.obs}]</span>
                    <div className="text-xl text-zinc-400 not-italic font-bold tracking-widest">{d.forn}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-10 text-xl font-black">{d.categoria}</span>
                  </td>
                  <td className="p-4 text-center text-zinc-400 font-mono">{d.venc}</td>
                  <td className="p-4 text-center text-zinc-400 font-mono">{d.parc}</td>
                  <td className="p-4 text-center text-red-600">R$ {d.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* FORMULÁRIO COM VENCIMENTO PADRÃO HOJE */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-10 no-print">
          <div className="bg-white border-[15px] border-red-600 w-[1300px] rounded-60 p-16 text-black shadow-2xl relative">
            <h2 className="text-8xl font-black uppercase italic mb-10 border-b-8 border-red-600 pb-4 inline-block tracking-tighter">Registrar Despesa</h2>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-3xl font-black uppercase italic text-zinc-400 mb-2 block">Favorecido / Descrição</label>
                  <input value={newExp.nome} onChange={e => setNewExp({...newExp, nome: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase" />
                  <input value={newExp.obs} onChange={e => setNewExp({...newExp, obs: e.target.value})} className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 rounded-20 text-2xl mt-4 font-bold uppercase" placeholder="OBSERVAÇÕES..." />
                </div>
                <div>
                  <label className="text-3xl font-black uppercase italic text-blue-600 mb-2 block">Categoria</label>
                  <select value={newExp.categoria} onChange={e => setNewExp({...newExp, categoria: e.target.value})} className="w-full bg-blue-50 border-4 border-blue-200 p-8 rounded-30 text-4xl font-black uppercase">
                    <option>FIXO</option><option>LOGÍSTICA</option><option>MATÉRIA PRIMA</option><option>PESSOAL</option><option>SOFTWARE</option>
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
                <div>
                  <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Vencimento (Padrão: Hoje)</label>
                  <input type="date" value={newExp.venc} onChange={e => setNewExp({...newExp, venc: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-3xl font-black outline-none" />
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-6">
              <button onClick={() => setShowAddExpense(false)} className="flex-1 bg-zinc-100 hover:bg-zinc-200 p-10 rounded-40 text-4xl font-black uppercase italic text-zinc-400">Cancelar</button>
              <button onClick={handleSave} className="flex-[2] bg-red-600 text-white p-10 rounded-40 text-6xl font-black uppercase italic shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:bg-black transition-all">✅ Salvar Lançamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}