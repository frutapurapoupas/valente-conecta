'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FinanceiroMaster() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [despesas, setDespesas] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  // FILTROS DE DATA (ESTADO INICIAL: MÊS E ANO ATUAIS)
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1)
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear())

  const hoje = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ 
    nome: '', valor: '', forn: '', venc: hoje, 
    categoria: 'FIXO', obs: '', parcelas: '1' 
  })

  useEffect(() => {
    fetchDespesas()
  }, [mesFiltro, anoFiltro])

  async function fetchDespesas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .order('criado_em', { ascending: false })
    
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
    setIsEditing(true)
    setCurrentId(d.id)
    setForm({
      nome: d.nome,
      valor: d.valor.toString(),
      forn: d.fornecedor || '',
      venc: `${anoFiltro}-${mesFiltro.toString().padStart(2,'0')}-${d.vencimento.padStart(2,'0')}`,
      categoria: d.categoria,
      obs: d.observacoes || '',
      parcelas: d.total_parcelas.toString()
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.nome || !form.valor) return alert("PREENCHA OS CAMPOS OBRIGATÓRIOS!")
    
    const payload = {
      nome: form.nome.toUpperCase(),
      categoria: form.categoria,
      valor: parseFloat(form.valor),
      fornecedor: form.forn.toUpperCase() || 'DIVERSOS',
      vencimento: form.venc.split('-')[2],
      total_parcelas: parseInt(form.parcelas) || 1,
      observacoes: form.obs.toUpperCase(),
      status: 'PENDENTE'
    }

    const { error } = isEditing 
      ? await supabase.from('financeiro').update(payload).eq('id', currentId)
      : await supabase.from('financeiro').insert([payload])

    if (!error) {
      setShowModal(false)
      setIsEditing(false)
      setForm({ nome: '', valor: '', forn: '', venc: hoje, categoria: 'FIXO', obs: '', parcelas: '1' })
      fetchDespesas()
    } else {
      alert("Erro ao processar: " + error.message)
    }
  }

  const handleDelete = async () => {
    if(confirm("TEM CERTEZA QUE DESEJA EXCLUIR ESTE LANÇAMENTO?")) {
      const { error } = await supabase.from('financeiro').delete().eq('id', currentId)
      if(!error) {
        setShowModal(false)
        fetchDespesas()
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans overflow-x-hidden">
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { 
            position: absolute !important; left: 0 !important; top: 0 !important; 
            width: 100% !important; scale: 1 !important; transform: none !important;
            background: white !important; color: black !important;
          }
          .no-print { display: none !important; }
          tr { border-bottom: 1px solid #ddd !important; }
        }
      `}</style>

      {/* VIEWPORT COM ESCALA 0.55 FIXA */}
      <div className="origin-top-left scale-[0.55] w-[181.8%] p-10 print-area">
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10 no-print">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
          </div>
          <button onClick={() => { setIsEditing(false); setShowModal(true); setForm({...form, venc: hoje}); }} className="bg-red-600 text-white px-16 py-8 rounded-25 text-5xl font-black uppercase italic shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:bg-white hover:text-red-600 transition-all">+ Novo Lançamento</button>
        </header>

        {/* FILTROS DE TEMPO */}
        <div className="flex gap-6 mb-10 no-print">
          <select value={mesFiltro} onChange={(e) => setMesFiltro(Number(e.target.value))} className="bg-zinc-900 border-4 border-zinc-800 p-6 rounded-20 text-4xl font-black uppercase text-yellow-400 outline-none">
            {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
          <select value={anoFiltro} onChange={(e) => setAnoFiltro(Number(e.target.value))} className="bg-zinc-900 border-4 border-zinc-800 p-6 rounded-20 text-4xl font-black uppercase text-white outline-none">
            <option value="2025">2025</option><option value="2026">2026</option>
          </select>
        </div>

        {/* ÁREA DO EXTRATO (BRANCA) */}
        <section className="bg-white text-black p-12 rounded-60 shadow-2xl">
          <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-6">
            <h2 className="text-7xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">Fluxo de Caixa Detalhado</h2>
            <div className="flex gap-4 no-print">
              {loading && <span className="text-2xl font-black text-red-600 animate-pulse self-center mr-4 uppercase">Sincronizando...</span>}
              <button onClick={() => window.print()} className="bg-black text-white px-12 py-5 rounded-20 font-black text-3xl uppercase">🖨️ Imprimir</button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-zinc-200 text-zinc-400 font-black uppercase text-2xl italic">
                <th className="p-4">Inserção</th>
                <th className="p-4">Descrição / Fornecedor / Obs</th>
                <th className="p-4 text-center">Cat.</th>
                <th className="p-4 text-center">Venc.</th>
                <th className="p-4 text-center">Seq.</th>
                <th className="p-4 text-center">Valor</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-3xl font-black uppercase italic tracking-tighter">
              {despesas.map((d) => (
                <tr key={d.id} onClick={() => handleOpenEdit(d)} className="border-b-2 border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors">
                  <td className="p-4 text-zinc-300 text-xl font-mono">{new Date(d.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    {d.nome} {d.observacoes && <span className="text-lg opacity-40 not-italic ml-2">[{d.observacoes}]</span>}
                    <div className="text-xl text-blue-600 not-italic font-bold tracking-widest uppercase mt-1">{d.fornecedor || 'DIVERSOS'}</div>
                  </td>
                  <td className="p-4 text-center"><span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-10 text-xl font-black uppercase">{d.categoria}</span></td>
                  <td className="p-4 text-center text-zinc-400 font-mono">{d.vencimento}</td>
                  <td className="p-4 text-center text-zinc-400 font-mono">1/{d.total_parcelas}</td>
                  <td className="p-4 text-center text-red-600 font-black">R$ {parseFloat(d.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="p-4 text-right">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {despesas.length === 0 && !loading && (
            <div className="text-center py-20 text-4xl font-black text-zinc-200 uppercase italic">Nenhum registro para este período.</div>
          )}
        </section>
      </div>

      {/* MODAL DE REGISTRO / EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-10 no-print">
          <div className="bg-white border-[15px] border-red-600 w-[1300px] rounded-60 p-16 text-black shadow-2xl relative">
            <h2 className="text-8xl font-black uppercase italic mb-10 border-b-8 border-red-600 pb-4 inline-block tracking-tighter">
              {isEditing ? 'Editar Registro' : 'Registrar Despesa'}
            </h2>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-3xl font-black uppercase italic text-zinc-400 mb-2 block">1. Favorecido / Descrição</label>
                  <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-4xl font-black uppercase outline-none focus:border-red-600" />
                  <input value={form.obs} onChange={e => setForm({...form, obs: e.target.value})} className="w-full bg-zinc-50 border-2 border-zinc-100 p-4 rounded-20 text-2xl mt-4 font-bold uppercase outline-none" placeholder="OBSERVAÇÕES..." />
                </div>
                <div>
                  <label className="text-3xl font-black uppercase italic text-blue-600 mb-2 block">2. Categoria</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full bg-blue-50 border-4 border-blue-200 p-8 rounded-30 text-4xl font-black uppercase outline-none">
                    <option>FIXO</option><option>LOGÍSTICA</option><option>MATÉRIA PRIMA</option><option>PESSOAL</option><option>SOFTWARE</option>
                  </select>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="text-3xl font-black uppercase italic text-red-600 mb-2 block">Valor R$</label>
                    <input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full bg-zinc-50 border-4 border-red-200 p-8 rounded-30 text-6xl font-black text-red-600 outline-none" />
                  </div>
                  <div className="w-48">
                    <label className="text-3xl font-black uppercase italic text-zinc-400 mb-2 block">Parcelas</label>
                    <input type="number" value={form.parcelas} onChange={e => setForm({...form, parcelas: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-8 rounded-30 text-6xl font-black outline-none text-center" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Vencimento</label>
                    <input type="date" value={form.venc} onChange={e => setForm({...form, venc: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-3xl font-black outline-none" />
                  </div>
                  <div>
                    <label className="text-2xl font-black uppercase italic text-zinc-400 mb-2 block">Fornecedor / Origem</label>
                    <input value={form.forn} onChange={e => setForm({...form, forn: e.target.value})} className="w-full bg-zinc-50 border-4 border-zinc-200 p-6 rounded-20 text-3xl font-black uppercase outline-none" placeholder="Ex: SICOOB, DINHEIRO..." />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 flex gap-6">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-100 p-10 rounded-40 text-4xl font-black uppercase italic text-zinc-400 hover:bg-zinc-200 transition-colors">Cancelar</button>
              
              {isEditing && (
                <button onClick={handleDelete} className="bg-zinc-900 text-red-600 px-10 rounded-40 text-4xl font-black uppercase italic border-4 border-red-600/20 hover:bg-red-600 hover:text-white transition-all">Excluir</button>
              )}

              <button onClick={handleSave} className="flex-[2] bg-red-600 text-white p-10 rounded-40 text-6xl font-black uppercase italic shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:bg-black transition-all">
                {isEditing ? '✅ Atualizar' : '✅ Salvar Lançamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}