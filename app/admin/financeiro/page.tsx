'use client'
import { useState } from 'react'

export default function Financeiro() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04')
  const [showAddExpense, setShowAddExpense] = useState(false)
  
  // Lista de Despesas Reais
  const [despesas, setDespesas] = useState([
    { id: 1, cat: 'Fixa', nome: 'Pró-labore', valor: 3500, venc: '05', doc: 'DOC-001', status: 'pago', forn: 'Diretoria' },
    { id: 2, cat: 'Fixa', nome: 'Aluguel Escritório', valor: 100, venc: '10', doc: 'AL-99', status: 'pago', forn: 'Coworking Central' },
    { id: 3, cat: 'Fixa', nome: 'Hospedagem / Servidor', valor: 300, venc: '15', doc: 'VRC-88', status: 'pendente', forn: 'Vercel' },
    { id: 4, cat: 'Fixa', nome: 'Banco de Dados (Supabase)', valor: 200, venc: '15', doc: 'SUPA-1', status: 'pendente', forn: 'Supabase Inc' },
    { id: 5, cat: 'Fixa', nome: 'Domínio + DNS', valor: 50, venc: '20', doc: 'REG-BA', status: 'pago', forn: 'Registro BR' },
    { id: 12, cat: 'Variável', nome: 'Taxas Transações', valor: 850, venc: '30', doc: 'GATE-7', status: 'alerta', forn: 'Pagar.me' },
    { id: 15, cat: 'Variável', nome: 'Tráfego Pago', valor: 1200, venc: '25', doc: 'FB-ADS', status: 'pendente', forn: 'Meta Ads', parc: '1/1' },
  ])

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="origin-top-left scale-50 w-[200%] p-12">
        
        {/* HEADER */}
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-2xl font-bold uppercase tracking-[0.3em]">Valente Conecta v3.6</p>
          </div>
          <div className="flex gap-6 items-center bg-zinc-900 p-6 rounded-30 border-2 border-zinc-800">
             <input 
                type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-black border-2 border-yellow-400 p-4 rounded-15 text-3xl font-black text-yellow-400 outline-none"
             />
          </div>
        </header>

        {/* CARDS SUPERIORES */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <StatCard title="Entradas (Mês)" value="R$ 12.450,00" color="text-white" />
          <StatCard title="Saídas (Mês)" value="R$ 8.400,00" color="text-red-500" />
          <StatCard title="Projeção Próximo Mês" value="R$ 18.200,00" color="text-yellow-400" />
        </div>

        <div className="grid grid-cols-2 gap-10 mb-12">
          {/* FATURAMENTO */}
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 shadow-2xl">
            <h3 className="text-4xl font-black uppercase italic mb-10 text-yellow-400 border-b-4 border-zinc-800 pb-6">Faturamento Sintético</h3>
            <div className="space-y-12">
              <FaturamentoRow label="Desbloqueios de Contato" valor="4.200,00" perc="35%" />
              <FaturamentoRow label="Planos de Assinatura" valor="6.800,00" perc="55%" />
              <FaturamentoRow label="Publicidade e Banners" valor="1.450,00" perc="10%" />
            </div>
          </section>

          {/* CENTRO DE CUSTOS RÁPIDO */}
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b-4 border-zinc-800 pb-6">
                <h3 className="text-4xl font-black uppercase italic text-red-500">Custos Reais</h3>
                <button onClick={() => setShowAddExpense(true)} className="bg-red-600 hover:bg-white hover:text-red-600 text-white px-8 py-4 rounded-20 font-black text-2xl uppercase transition-all animate-bounce">
                    + Incluir Despesa
                </button>
            </div>
            <div className="h-[400px] overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                {despesas.map(d => (
                    <div key={d.id} className="flex justify-between items-center bg-black/50 p-6 rounded-25 border-2 border-zinc-800">
                        <div>
                            <p className="text-2xl font-black uppercase italic mb-1">{d.nome}</p>
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{d.forn}</span>
                        </div>
                        <p className="text-4xl font-black text-white italic text-right">R$ {d.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                ))}
            </div>
          </section>
        </div>

        {/* FLUXO DE CAIXA DETALHADO (TELA BRANCA ESTILO EXTRATO) */}
        <section className="bg-white border-4 border-zinc-200 p-12 rounded-60 shadow-2xl text-black">
            <header className="flex justify-between items-center mb-10 border-b-4 border-zinc-100 pb-8">
                <div>
                    <h3 className="text-6xl font-black uppercase italic tracking-tighter">Fluxo de Caixa Detalhado</h3>
                    <p className="text-zinc-400 font-bold text-2xl uppercase italic">Extrato de Movimentações - Período Selecionado</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-zinc-100 border-2 border-zinc-300 text-zinc-600 px-8 py-4 rounded-15 font-black text-2xl uppercase hover:bg-black hover:text-white transition-all">🖨️ Impressora / PDF</button>
                    <button className="bg-green-100 border-2 border-green-300 text-green-700 px-8 py-4 rounded-15 font-black text-2xl uppercase hover:bg-green-600 hover:text-white transition-all">📊 Exportar Excel</button>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-4 border-zinc-100 text-zinc-400 font-black uppercase text-2xl">
                            <th className="p-6">Descrição / Despesa</th>
                            <th className="p-6">Fornecedor</th>
                            <th className="p-6">Doc. Origem</th>
                            <th className="p-6 text-center">Parc.</th>
                            <th className="p-6">Vencimento</th>
                            <th className="p-6">Valor</th>
                            <th className="p-6">Observação</th>
                            <th className="p-6 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-3xl font-black uppercase italic tracking-tighter">
                        {despesas.map(d => (
                            <tr key={d.id} className="border-b-2 border-zinc-50 hover:bg-zinc-50 transition-colors">
                                <td className="p-6 text-zinc-900">{d.nome}</td>
                                <td className="p-6 text-zinc-500 text-2xl italic">{d.forn}</td>
                                <td className="p-6"><input type="text" defaultValue={d.doc} className="bg-transparent border-b-2 border-zinc-200 outline-none focus:border-black w-full text-zinc-700 p-2" /></td>
                                <td className="p-6 text-center text-zinc-400">{d.parc || '1/1'}</td>
                                <td className="p-6 text-zinc-800">{d.venc}/{selectedMonth.split('-')[1]}</td>
                                <td className="p-6 text-red-600">R$ {d.valor.toFixed(2)}</td>
                                <td className="p-6">
                                    {/* Observação Triplicada */}
                                    <input type="text" placeholder="NOTAS ADICIONAIS..." className="bg-zinc-100 border-2 border-zinc-200 p-4 rounded-10 text-3xl outline-none focus:border-yellow-500 w-full font-black uppercase placeholder:text-zinc-300" />
                                </td>
                                <td className="p-6 text-right">
                                    {/* Status Triplicado */}
                                    <span className={`inline-block px-8 py-4 rounded-20 text-3xl font-black border-4 ${d.status === 'pago' ? 'bg-green-50 text-green-600 border-green-600' : 'bg-red-50 text-red-600 border-red-600'}`}>
                                        {d.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        {/* MODAL PARA INCLUIR DESPESA */}
        {showAddExpense && (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-10">
                <div className="bg-white border-[12px] border-red-600 w-[1400px] rounded-60 p-16 shadow-2xl relative text-black">
                    <button onClick={() => setShowAddExpense(false)} className="absolute top-8 right-8 text-7xl text-zinc-300 hover:text-black transition-all">✕</button>
                    <h2 className="text-7xl font-black uppercase italic mb-12 text-red-600">Novo Lançamento Financeiro</h2>
                    
                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Descrição da Despesa</label>
                                <input type="text" placeholder="Ex: API WhatsApp Business" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                            </div>
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4 text-zinc-500 underline">Fornecedor / Credor</label>
                                <input type="text" placeholder="Nome da empresa ou pessoa" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-black" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4">Valor Líquido (R$)</label>
                                    <input type="number" placeholder="0,00" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl text-red-600 font-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4 italic">Vencimento (📅)</label>
                                    <input type="date" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-3xl font-black outline-none focus:border-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-3xl font-black uppercase italic mb-4">Doc. Origem / Referência</label>
                                <input type="text" placeholder="Nº NF ou Identificador" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4">Parcelas / Recorrência</label>
                                    <input type="number" defaultValue="1" className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black outline-none" />
                                </div>
                                <div>
                                    <label className="block text-2xl font-black uppercase italic mb-4 italic text-zinc-500">Categoria</label>
                                    <select className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-3xl font-black uppercase outline-none">
                                        <option>Fixa</option>
                                        <option>Variável</option>
                                        <option>Investimento</option>
                                        <option>Impostos</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-2xl font-black uppercase italic mb-4">Observações Privadas</label>
                                <textarea rows={2} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-2xl font-bold outline-none"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <button className="w-full mt-14 bg-red-600 p-12 rounded-40 text-5xl font-black uppercase italic text-white hover:bg-black transition-all shadow-2xl">Salvar e Registrar Extrato</button>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 flex flex-col justify-between shadow-xl">
      <p className="text-zinc-500 font-black uppercase mb-6 text-2xl tracking-tighter">{title}</p>
      <p className={`text-8xl font-black ${color} tracking-tighter italic`}>{value}</p>
    </div>
  )
}

function FaturamentoRow({ label, valor, perc }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between font-black uppercase italic items-end">
        <span className="text-3xl text-zinc-300 leading-none">{label}</span>
        <span className="text-5xl text-yellow-400 tracking-tighter leading-none">R$ {valor} <span className="text-2xl opacity-40">({perc})</span></span>
      </div>
      <div className="w-full bg-zinc-800 h-8 rounded-full overflow-hidden border-2 border-zinc-700">
        <div className="bg-yellow-400 h-full rounded-full" style={{ width: perc }}></div>
      </div>
    </div>
  )
}