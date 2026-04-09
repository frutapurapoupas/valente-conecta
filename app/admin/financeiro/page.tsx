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
    nome: '', valor: '', forn: '', venc: hoje, categoria: 'FIXO', obs: '', parcelas: '1' 
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
      nome: d.nome, valor: d.valor.toString(), forn: d.fornecedor || '',
      venc: `${anoFiltro}-${mesFiltro.toString().padStart(2,'0')}-${d.vencimento.padStart(2,'0')}`,
      categoria: d.categoria, obs: d.observacoes || '', parcelas: d.total_parcelas.toString()
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nome || !form.valor) return alert("PREENCHA OS CAMPOS!");
    const payload = {
      nome: form.nome.toUpperCase(), categoria: form.categoria, valor: parseFloat(form.valor),
      fornecedor: form.forn.toUpperCase() || 'DIVERSOS', vencimento: form.venc.split('-')[2],
      total_parcelas: parseInt(form.parcelas) || 1, observacoes: form.obs.toUpperCase(), status: 'PENDENTE'
    }
    const { error } = isEditing ? await supabase.from('financeiro').update(payload).eq('id', currentId) : await supabase.from('financeiro').insert([payload])
    if (!error) { setShowModal(false); fetchDespesas(); }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans p-4 md:p-0">
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          .no-print { display: none !important; }
          .print-area { position: absolute !important; left: 0; top: 0; width: 100%; scale: 1; background: white; color: black; }
        }
      `}</style>

      <div className="md:origin-top-left md:scale-[0.55] md:w-[181.8%] md:p-10 print-area">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b-4 border-zinc-900 pb-6 md:pb-10 no-print">
          <div>
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-lg md:text-3xl font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
          </div>
          <button onClick={() => { setIsEditing(false); setShowModal(true); }} className="w-full md:w-auto mt-6 md:mt-0 bg-red-600 text-white px-10 md:px-16 py-4 md:py-8 rounded-2xl md:rounded-25 text-2xl md:text-5xl font-black uppercase italic shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:bg-white hover:text-red-600 transition-all">+ Novo</button>
        </header>

        <div className="flex gap-4 mb-8 no-print overflow-x-auto pb-2">
          <select value={mesFiltro} onChange={(e) => setMesFiltro(Number(e.target.value))} className="bg-zinc-900 border-2 md:border-4 border-zinc-800 p-4 md:p-6 rounded-xl md:rounded-20 text-xl md:text-4xl font-black uppercase text-yellow-400 outline-none">
            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (<option key={i} value={i+1}>{m}</option>))}
          </select>
          <button onClick={() => window.print()} className="bg-white text-black px-6 md:px-12 py-4 md:py-5 rounded-xl md:rounded-20 font-black text-xl md:text-3xl uppercase no-print">🖨️ Print</button>
        </div>

        <section className="bg-white text-black p-4 md:p-12 rounded-3xl md:rounded-60 shadow-2xl">
          <table className="w-full text-left">
            <thead className="hidden md:table-header-group">
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                <th className="p-4">Inserção</th>
                <th className="p-4">Descrição / Fornecedor</th>
                <th className="p-4 text-center">Cat.</th>
                <th className="p-4 text-center">Venc.</th>
                <th className="p-4 text-center">Seq.</th>
                <th className="p-4 text-center">Valor</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
              {despesas.map((d) => (
                <tr key={d.id} onClick={() => handleOpenEdit(d)} className="border-b-2 border-zinc-100 hover:bg-zinc-50 flex flex-col md:table-row p-4 md:p-0 mb-4 md:mb-0 bg-zinc-50 md:bg-transparent rounded-2xl md:rounded-none">
                  <td className="md:p-4 text-zinc-300 text-sm md:text-xl font-mono mb-2 md:mb-0">{new Date(d.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td className="md:p-4 mb-2 md:mb-0">
                    <span className="text-zinc-900">{d.nome}</span>
                    <div className="text-xs md:text-xl text-blue-600 font-bold uppercase">{d.fornecedor || 'DIVERSOS'}</div>
                  </td>
                  <td className="md:p-4 text-center hidden md:table-cell"><span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-10 text-xl font-black uppercase">{d.categoria}</span></td>
                  <td className="md:p-4 text-center md:text-zinc-400 font-mono text-lg md:text-3xl">Dia {d.vencimento}</td>
                  <td className="md:p-4 text-center hidden md:table-cell">1/{d.total_parcelas}</td>
                  <td className="md:p-4 text-left md:text-center text-red-600 font-black text-3xl md:text-3xl">R$ {parseFloat(d.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="md:p-4 text-right hidden md:table-cell">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* MODAL RESPONSIVO */}
      {showModal && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-4 md:p-10 no-print overflow-y-auto">
          <div className="bg-white border-[8px] md:border-[15px] border-red-600 w-full md:w-[1300px] rounded-3xl md:rounded-60 p-6 md:p-16 text-black relative my-auto">
            <h2 className="text-4xl md:text-8xl font-black uppercase italic mb-6 md:mb-10 border-b-4 md:border-b-8 border-red-600 pb-2 md:pb-4 inline-block tracking-tighter">{isEditing ? 'Editar' : 'Novo'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              <div className="space-y-6">
                <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-4 md:p-8 rounded-xl md:rounded-30 text-xl md:text-4xl font-black uppercase" placeholder="DESCRIÇÃO" />
                <input value={form.forn} onChange={e => setForm({...form, forn: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-4 md:p-8 rounded-xl md:rounded-30 text-xl md:text-4xl font-black uppercase" placeholder="FORNECEDOR / ORIGEM" />
              </div>
              <div className="space-y-6">
                <input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full bg-zinc-50 border-4 border-red-200 p-4 md:p-8 rounded-xl md:rounded-30 text-4xl md:text-6xl font-black text-red-600" placeholder="VALOR R$" />
                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-100 p-4 md:p-10 rounded-xl md:rounded-40 text-xl md:text-4xl font-black uppercase text-zinc-400">Voltar</button>
                  <button onClick={handleSave} className="flex-[2] bg-red-600 text-white p-4 md:p-10 rounded-xl md:rounded-40 text-xl md:text-6xl font-black uppercase italic">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}