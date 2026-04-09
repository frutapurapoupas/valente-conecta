'use client'
import { useState } from 'react'

export default function Financeiro() {
  const [viewDetail, setViewDetail] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('2026-04')
  const [prolabore, setProlabore] = useState(3500)

  // Simulação de dados para visualização
  const despesasVariaveis = [
    { id: 1, nome: 'Energia Co-working', valor: 250, vencimento: '2026-04-15', status: 'pendente' },
    { id: 2, nome: 'Impostos Simples', valor: 450, vencimento: '2026-04-10', status: 'alerta' },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <div className="origin-top-left scale-50 w-[200%] p-12">
        
        {/* HEADER COM FILTRO */}
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white">
              Financeiro <span className="text-yellow-400">Master</span>
            </h1>
            <p className="text-zinc-500 text-xl font-bold uppercase tracking-[0.3em]">Gestão de Fluxo Valente Conecta</p>
          </div>
          <div className="flex gap-4 items-center">
             <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-zinc-900 border-4 border-yellow-400 p-6 rounded-25 text-2xl font-black uppercase outline-none text-yellow-400"
             />
             <div className="flex gap-3">
                <button className="bg-zinc-800 p-6 rounded-20 hover:bg-zinc-700 transition-all text-3xl">🖨️</button>
                <button className="bg-zinc-800 p-6 rounded-20 hover:bg-zinc-700 transition-all text-green-400 font-black text-xl">XLS</button>
                <button className="bg-zinc-800 p-6 rounded-20 hover:bg-zinc-700 transition-all text-red-400 font-black text-xl">PDF</button>
             </div>
          </div>
        </header>

        {/* 3 CARDS SUPERIORES */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <StatCard title="Entradas (Mês)" value="R$ 12.450,00" color="text-white" onDetail={() => setViewDetail('entradas')} />
          <StatCard title="Saídas (Mês)" value="R$ 6.850,00" color="text-red-500" onDetail={() => setViewDetail('saidas')} />
          <StatCard title="Projeção Próximo Mês" value="R$ 18.200,00" color="text-yellow-400" onDetail={() => setViewDetail('projecao')} />
        </div>

        <div className="grid grid-cols-2 gap-10 mb-12">
          
          {/* RECEBIMENTOS POR TIPO (TEXTOS MAXIMIZADOS) */}
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 shadow-2xl">
            <h3 className="text-4xl font-black uppercase italic mb-10 text-yellow-400 border-b-4 border-zinc-800 pb-6">Recebimentos por Tipo</h3>
            <div className="space-y-14">
              <FaturamentoRow label="Desbloqueios de Contato" valor="4.200,00" perc="35%" />
              <FaturamentoRow label="Planos de Assinatura" valor="6.800,00" perc="55%" />
              <FaturamentoRow label="Publicidade e Banners" valor="1.450,00" perc="10%" />
            </div>
          </section>

          {/* CENTRO DE CUSTOS (TEXTOS MAXIMIZADOS) */}
          <section className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 shadow-2xl">
            <h3 className="text-4xl font-black uppercase italic mb-10 text-red-500 border-b-4 border-zinc-800 pb-6">Centro de Custos</h3>
            
            <div className="mb-14">
               <h4 className="text-zinc-500 font-black uppercase text-3xl mb-8 italic tracking-tighter">Despesas Fixas (Recorrentes)</h4>
               <div className="flex items-center justify-between bg-zinc-800 p-8 rounded-30 border-2 border-zinc-700">
                  <span className="font-black text-3xl uppercase italic text-white">Prolabore Admin Master</span>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-zinc-600 italic">R$</span>
                    <input 
                      type="number" 
                      value={prolabore} 
                      onChange={(e) => setProlabore(Number(e.target.value))}
                      className="bg-black border-4 border-yellow-400 rounded-20 p-4 w-56 text-center text-4xl font-black text-yellow-400 outline-none"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <h4 className="text-zinc-500 font-black uppercase text-3xl mb-4 italic tracking-tighter">Despesas Variáveis (Mês Atual)</h4>
               
               {/* Energia */}
               <div className="flex items-center justify-between p-8 rounded-30 border-4 border-zinc-800 bg-zinc-800/50">
                  <div>
                    <p className="font-black uppercase text-3xl italic text-white mb-2">Energia Co-working</p>
                    <p className="text-xl text-zinc-500 font-bold uppercase tracking-widest">Vence em: 2026-04-15</p>
                  </div>
                  <p className="text-5xl font-black text-white tracking-tighter text-right">R$ 250,00</p>
               </div>

               {/* Impostos com Alerta */}
               <div className="flex items-center justify-between p-8 rounded-30 border-4 border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                  <div>
                    <p className="font-black uppercase text-3xl italic text-red-500 mb-2">Impostos Simples</p>
                    <p className="text-xl text-zinc-400 font-bold uppercase">Vence em: 2026-04-10</p>
                    <span className="text-2xl font-black text-red-500 animate-pulse uppercase block mt-3">⚠️ Atualizar Valor!</span>
                  </div>
                  <p className="text-5xl font-black text-red-500 tracking-tighter text-right">R$ 450,00</p>
               </div>

               <button className="w-full border-4 border-dashed border-zinc-700 p-8 rounded-30 text-zinc-500 font-black uppercase text-3xl hover:border-yellow-400 hover:text-yellow-400 transition-all bg-zinc-900/50">
                 + Incluir Despesa
               </button>
            </div>
          </section>
        </div>

        {/* MODAL DE EXTRATO */}
        {viewDetail && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-20">
            <div className="bg-zinc-900 border-[10px] border-yellow-400 w-full h-full rounded-60 p-24 overflow-y-auto relative shadow-[0_0_100px_rgba(250,204,21,0.2)]">
              <button onClick={() => setViewDetail(null)} className="absolute top-12 right-12 text-7xl font-black text-zinc-600 hover:text-white transition-colors">✕</button>
              <h2 className="text-7xl font-black uppercase italic mb-4">Extrato: <span className="text-yellow-400">{viewDetail}</span></h2>
              <p className="text-zinc-500 text-3xl font-bold mb-16 uppercase tracking-[0.2em]">Detalhamento de origem e filtros temporais</p>
              
              <div className="space-y-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex justify-between items-center p-10 bg-zinc-800 rounded-40 border-l-[15px] border-yellow-400 hover:bg-zinc-750 transition-all">
                    <div className="space-y-2">
                      <span className="text-4xl font-black uppercase italic">Item de Origem #{i}</span>
                      <p className="text-zinc-500 text-xl font-bold uppercase">Referência: ID-VALENTE-{i}2026</p>
                    </div>
                    <span className="text-5xl font-black text-green-400">+ R$ 2.400,00</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function StatCard({ title, value, color, onDetail }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-12 rounded-60 flex flex-col justify-between group hover:border-zinc-500 transition-all shadow-xl">
      <div>
        <p className="text-zinc-500 font-black uppercase mb-6 text-2xl tracking-tighter">{title}</p>
        <p className={`text-8xl font-black ${color} tracking-tighter italic mb-4`}>{value}</p>
      </div>
      <button 
        onClick={onDetail}
        className="mt-10 w-full bg-zinc-800 hover:bg-yellow-400 hover:text-black p-8 rounded-25 font-black uppercase text-2xl transition-all shadow-lg border-2 border-zinc-700 flex items-center justify-center gap-4 group-hover:scale-[1.02]"
      >
        <span>Ver Detalhes / Estrato</span>
        <span className="text-3xl">→</span>
      </button>
    </div>
  )
}

function FaturamentoRow({ label, valor, perc }: any) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between font-black uppercase italic items-end gap-4">
        <span className="text-3xl text-zinc-300 leading-none">{label}</span>
        <span className="text-5xl text-yellow-400 tracking-tighter leading-none">
          R$ {valor} <span className="text-2xl text-zinc-600 ml-2">({perc})</span>
        </span>
      </div>
      <div className="w-full bg-zinc-800 h-8 rounded-full overflow-hidden border-2 border-zinc-700 shadow-inner">
        <div className="bg-yellow-400 h-full rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all duration-1000" style={{ width: perc }}></div>
      </div>
    </div>
  )
}