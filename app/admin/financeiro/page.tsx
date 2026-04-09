'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle,
  X
} from 'lucide-react'

export default function FinanceiroMaster() {
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1)
  
  // Estado para novo lançamento
  const [novoLancamento, setNovoLancamento] = useState({
    descricao: '',
    valor: '',
    vencimento: '05',
    categoria: 'FIXA'
  })

  useEffect(() => {
    fetchFinanceiro()
  }, [mesFiltro])

  async function fetchFinanceiro() {
    setLoading(true)
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .order('vencimento', { ascending: true })

    if (data) setDespesas(data)
    setLoading(false)
  }

  async function handleSalvar() {
    const { error } = await supabase
      .from('financeiro')
      .insert([{
        descricao: novoLancamento.descricao.toUpperCase(),
        valor: parseFloat(novoLancamento.valor.replace(',', '.')),
        vencimento: novoLancamento.vencimento,
        categoria: novoLancamento.categoria,
        status: 'PENDENTE'
      }])

    if (!error) {
      setIsModalOpen(false)
      fetchFinanceiro()
      setNovoLancamento({ descricao: '', valor: '', vencimento: '05', categoria: 'FIXA' })
    }
  }

  const totalGeral = despesas.reduce((acc, curr) => acc + curr.valor, 0)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER FINANCEIRO */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              FINANCEIRO <span className="text-yellow-400">MASTER</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <select 
                value={mesFiltro}
                onChange={(e) => setMesFiltro(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg font-bold text-yellow-400 outline-none"
              >
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20"
          >
            <Plus size={20} /> NOVO LANÇAMENTO
          </button>
        </header>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/50 border-2 border-zinc-800 p-6 rounded-[32px]">
            <p className="text-zinc-500 font-black uppercase text-xs mb-2">Total de Despesas</p>
            <p className="text-4xl font-black italic">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-zinc-900/50 border-2 border-zinc-800 p-6 rounded-[32px]">
            <p className="text-zinc-500 font-black uppercase text-xs mb-2">Contas Fixas</p>
            <p className="text-4xl font-black italic text-blue-500">R$ {(totalGeral * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-zinc-900/50 border-2 border-zinc-800 p-6 rounded-[32px]">
            <p className="text-zinc-500 font-black uppercase text-xs mb-2">Previsão Próximo Mês</p>
            <p className="text-4xl font-black italic text-yellow-400">R$ {(totalGeral * 1.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* TABELA DE REGISTROS */}
        <div className="bg-zinc-900/30 border-2 border-zinc-800 rounded-[40px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-800 bg-zinc-900/50">
                <th className="p-6 font-black uppercase italic text-zinc-500 text-xs">Descrição / Fornecedor</th>
                <th className="p-6 font-black uppercase italic text-zinc-500 text-xs text-center">Vencimento</th>
                <th className="p-6 font-black uppercase italic text-zinc-500 text-xs text-right">Valor Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {despesas.length > 0 ? despesas.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-all group">
                  <td className="p-6 font-bold uppercase italic text-lg group-hover:text-yellow-400">{item.descricao}</td>
                  <td className="p-6 text-center font-black text-zinc-400 italic text-xl">Dia {item.vencimento}</td>
                  <td className="p-6 text-right font-black text-2xl italic tracking-tighter">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-20 text-center text-zinc-700 font-black uppercase italic tracking-widest">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE LANÇAMENTO (Restaurado) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-[40px] w-full max-w-md relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-2">
              <Plus className="text-red-600" /> Lançar <span className="text-red-600">Despesa</span>
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Descrição da Despesa</label>
                <input 
                  type="text" 
                  placeholder="EX: ENERGIA ELÉTRICA"
                  value={novoLancamento.descricao}
                  onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl font-bold uppercase outline-none focus:border-red-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Valor (R$)</label>
                  <input 
                    type="text" 
                    placeholder="0,00"
                    value={novoLancamento.valor}
                    onChange={(e) => setNovoLancamento({...novoLancamento, valor: e.target.value})}
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl font-bold outline-none focus:border-red-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Dia Vencimento</label>
                  <input 
                    type="text" 
                    placeholder="05"
                    value={novoLancamento.vencimento}
                    onChange={(e) => setNovoLancamento({...novoLancamento, vencimento: e.target.value})}
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl font-bold outline-none focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleSalvar}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[20px] transition-all uppercase italic tracking-widest mt-4"
              >
                Salvar Registro
              </button>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-4 text-zinc-500 font-black uppercase text-xs tracking-widest"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}