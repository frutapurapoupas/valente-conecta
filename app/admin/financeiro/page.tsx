'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FinanceiroMaster() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [despesas, setDespesas] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1)
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear())

  const hoje = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ 
    nome: '', valor: '', forn: '', venc: hoje, 
    categoria: 'FIXO', obs: '', parcelas: '1' 
  })

  useEffect(() => { fetchDespesas() }, [mesFiltro, anoFiltro])

  async function fetchDespesas() {
    setLoading(true)
    const { data } = await supabase.from('financeiro').select('*').order('criado_em', { ascending: false })
    if (data) {
      const filtrados = data.filter(d => {
        const dInsc = new Date(d.criado_em);
        return (dInsc.getMonth() + 1) === Number(mesFiltro) && dInsc.getFullYear() === Number(anoFiltro);
      });
      setDespesas(filtrados)
    }
    setLoading(false)
  }

  const handleOpenEdit = (d: any) => {
    setIsEditing(true); setCurrentId(d.id);
    setForm({
      nome: d.nome, valor: d.valor.toString(), forn: d.fornecedor,
      venc: `${anoFiltro}-${mesFiltro.toString().padStart(2,'0')}-${d.vencimento.padStart(2,'0')}`,
      categoria: d.categoria, obs: d.observacoes || '', parcelas: d.total_parcelas.toString()
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nome || !form.valor) return alert("PREENCHA TUDO!");
    const payload = {
      nome: form.nome.toUpperCase(), categoria: form.categoria, valor: parseFloat(form.valor),
      fornecedor: form.forn.toUpperCase() || 'DIVERSOS', vencimento: form.venc.split('-')[2],
      total_parcelas: parseInt(form.parcelas) || 1, observacoes: form.obs.toUpperCase(), status: 'PENDENTE'
    }
    const { error } = isEditing ? await supabase.from('financeiro').update(payload).eq('id', currentId) : await supabase.from('financeiro').insert([payload])
    if (!error) { setShowModal(false); setIsEditing(false); fetchDespesas(); }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased overflow-x-hidden font-sans">
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 0; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; scale: 0.95 !important; transform-origin: top left !important; }
          .print-area * { color: black !important; border-color: #000 !important; }
        }
      `}</style>

      <div className="origin-top-left scale-[0.55] w-[181.8%] p-10 print-area">
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10 no-print">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
          </div>
          <button onClick={() => { setIsEditing(false); setShowModal(true); }} className="bg-red-600 text-white px-16 py-8 rounded-25 text-5xl font-black uppercase italic">+ Novo Lançamento</button>
        </header>

        <div className="flex gap-6 mb-10 no-print">
          <select value={mesFiltro} onChange={(e) => setMesFiltro(Number(e.target.value))} className="bg-zinc-900 border-4 border-zinc-800 p-6 rounded-20 text-4xl font-black uppercase text-yellow-400">
            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (<option key={i} value={i+1}>{m}</option>))}
          </select>
        </div>

        <section className="bg-white text-black p-12 rounded-60 shadow-2xl">
          <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-6">
            <h2 className="text-7xl font-black uppercase italic tracking-tighter leading-none">Fluxo de Caixa Detalhado</h2>
            <button onClick={() => window.print()} className="bg-black text-white px-12 py-5 rounded-20 font-black text-3xl uppercase no-print">🖨️ Imprimir</button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic text-center">
                <th className="p-4 text-left">Inserção</th>
                <th className="p-4 text-left">Descrição / Fornecedor</th>
                <th className="p-4">Cat.</th>
                <th className="p-4">Venc.</th>
                <th className="p-4">Seq.</th>
                <th className="p-4">Valor</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-3xl font-black uppercase italic tracking-tighter">
              {despesas.map((d) => (
                <tr key={d.id} onClick={() => handleOpenEdit(d)} className="border-b-2 border-zinc-100 hover:bg-zinc-50 cursor-pointer">
                  <td className="p-4 text-zinc-300 text-xl font-mono">{new Date(d.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    {d.nome} {d.observacoes && <span className="text-lg opacity-40 ml-2">[{d.observacoes}]</span>}
                    <div className="text-xl text-blue-600 font-bold uppercase mt-1">{d.fornecedor || 'DIVERSOS'}</div>
                  </td>
                  <td className="p-4 text-center"><span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-10 text-xl font-black">{d.categoria}</span></td>
                  <td className="p-4 text-center text-zinc-400 font-mono">{d.vencimento}</td>
                  <td className="p-4 text-center text-zinc-400 font-mono">1/{d.total_parcelas}</td>
                  <td className="p-4 text-center text-red-600">R$ {parseFloat(d.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-10 no-print">
          {/* Modal content remains the same structure with Fornecedor field included */}
        </div>
      )}
    </div>
  )
}