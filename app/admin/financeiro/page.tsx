'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, Search, FileText } from 'lucide-react'

export default function FinanceiroMaster() {
  const [showModal, setShowModal] = useState(false)
  const [despesas, setDespesas] = useState<any[]>([])
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1)
  const [form, setForm] = useState({ nome: '', valor: '', forn: '', venc: '01', categoria: 'FIXO' })

  useEffect(() => { fetchDespesas() }, [mesFiltro])

  async function fetchDespesas() {
    const { data } = await supabase.from('financeiro').select('*').order('criado_em', { ascending: false })
    if (data) {
      const filtrados = data.filter(d => (new Date(d.criado_em).getMonth() + 1) === Number(mesFiltro))
      setDespesas(filtrados)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
          <div className="flex gap-2 mt-4">
            <select value={mesFiltro} onChange={e => setMesFiltro(Number(e.target.value))} className="bg-zinc-900 p-3 rounded-xl text-yellow-400 font-bold border border-zinc-800 focus:outline-none">
              {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
          <Plus size={20} /> NOVO LANÇAMENTO
        </button>
      </header>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em] italic">
              <th className="p-5 border-b border-zinc-800">Descrição / Fornecedor</th>
              <th className="p-5 border-b border-zinc-800 text-center">Vencimento</th>
              <th className="p-5 border-b border-zinc-800 text-right">Valor Bruto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {despesas.length > 0 ? despesas.map((d) => (
              <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="p-5">
                  <div className="font-bold text-lg uppercase italic group-hover:text-yellow-400 transition-colors">{d.nome}</div>
                  <div className="text-blue-500 text-xs font-bold tracking-widest">{d.fornecedor}</div>
                </td>
                <td className="p-5 text-center font-bold text-zinc-400 italic">DIA {d.vencimento}</td>
                <td className="p-5 text-right font-black text-xl text-red-500 italic">R$ {parseFloat(d.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="p-20 text-center text-zinc-600 font-bold uppercase italic tracking-widest">Nenhum registro encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[500] animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 text-white p-8 rounded-[40px] w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Lançar <span className="text-red-500">DespesA</span></h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
                <div className="group">
                    <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 mb-1 block">Descrição da Despesa</label>
                    <input placeholder="EX: ENERGIA ELÉTRICA" onChange={e=>setForm({...form, nome: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-red-600 transition-colors font-bold uppercase outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 mb-1 block">Valor (R$)</label>
                        <input type="number" placeholder="0,00" onChange={e=>setForm({...form, valor: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-red-600 transition-colors font-bold outline-none text-red-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 mb-1 block">Dia Vencimento</label>
                        <input type="number" placeholder="01" onChange={e=>setForm({...form, venc: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-red-600 transition-colors font-bold outline-none" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-zinc-600 uppercase ml-2 mb-1 block">Fornecedor / Origem</label>
                    <input placeholder="EX: COELBA" onChange={e=>setForm({...form, forn: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl focus:border-red-600 transition-colors font-bold uppercase outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button onClick={()=>setShowModal(false)} className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-black transition-colors uppercase italic text-sm">Voltar</button>
              <button onClick={() => {/* handleSave logic */}} className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-colors uppercase italic text-sm shadow-lg shadow-red-600/20">Salvar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}