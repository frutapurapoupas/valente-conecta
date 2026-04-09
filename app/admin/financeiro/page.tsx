'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Financeiro() {
  const [viewDetail, setViewDetail] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('2026-04')
  const [prolabore, setProlabore] = useState(3500)

  // Exemplo de despesas variáveis com lógica de alerta (Simulação de 5 dias)
  const despesasVariaveis = [
    { id: 1, nome: 'Energia Co-working', valor: 250, vencimento: '2026-04-15', status: 'pendente' },
    { id: 2, nome: 'Impostos Simples', valor: 450, vencimento: '2026-04-10', status: 'alerta' },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <div className="origin-top-left scale-50 w-[200%] p-12">
        
        {/* HEADER COM FILTRO GLOBAL */}
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-xl font-bold uppercase tracking-[0.3em]">Gestão de Fluxo Valente Conecta</p>
          </div>
          <div className="flex gap-4 items-center">
             <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-zinc-900 border-2 border-yellow-400 p-4 rounded-20 text-xl font-black uppercase outline-none"
             />
             <div className="flex gap-2">
                <button className="bg-zinc-800 p-4 rounded-xl hover:bg-zinc-700 transition-all">🖨️</button>
                <button className="bg-zinc-800 p-4 rounded-xl hover:bg-zinc-700 transition-all text-green-400 font-bold">XLS</button>
                <button className="bg-zinc-800 p-4 rounded-xl hover:bg-zinc-700 transition-all text-red-400 font-bold">PDF</button>
             </div>
          </div>
        </header>

        {/* 3 CARDS SUPERIORES COM BOTÃO DETALHAR */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <StatCard 
            title="Entradas (Mês)" 
            value="R$ 12.450,00" 
            color="text-white" 
            onDetail={() => setViewDetail('entradas')} 
          />
          <StatCard 
            title="Saídas (Mês)" 
            value="R$ 6.850,00" 
            color="text-red-500" 
            onDetail={() => setViewDetail('saidas')} 
          />
          <StatCard 
            title="Projeção Próximo Mês" 
            value="R$ 18.200,00" 
            color="text-yellow-400" 
            onDetail={() => setViewDetail('projecao')} 
          />
        </div>

        {/* FLUXO DE CAIXA SINTÉTICO (CATEGORIZADO) */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <section className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60">
            <h3 className="text-3xl font-black uppercase italic mb-8 text-yellow-400 border-b-2 border-zinc-800 pb-4">Recebimentos por Tipo</h3>
            <div className="space-y-6">
              <FaturamentoRow label="Desbloqueios de Contato" valor="4.200,00" perc="35%" />
              <FaturamentoRow label="Planos de Assinatura" valor="6.800,00" perc="55%" />
              <FaturamentoRow label="Publicidade e Banners" valor="1.450,00" perc="10%" />
            </div>
          </section>

          {/* GESTÃO DE DESPESAS FIXAS E VARIÁVEIS */}
          <section className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60">
            <h3 className="text-3xl font-black uppercase italic mb-8 text-red-500 border-b-2 border-zinc-800 pb-4">Centro de Custos</h3>
            
            <div className="mb-8">
               <h4 className="text-zinc-500 font-black uppercase text-sm mb-4">Despesas Fixas (Recorrentes)</h4>
               <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-20 mb-3">
                  <span className="font-bold">Prolabore Admin Master</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">R$</span>
                    <input 
                      type="number" 
                      value={prolabore} 
                      onChange={(e) => setProlabore(Number(e.target.value))}
                      className="bg-black border border-zinc-700 rounded-lg p-1 w-24 text-center text-yellow-400 font-bold"
                    />
                  </div>
               </div>
            </div>

            <div>
               <h4 className="text-zinc-500 font-black uppercase text-sm mb-4">Despesas Variáveis (Mês Atual)</h4>
               {despesasVariaveis.map(d => (
                 <div key={d.id} className={`flex items-center justify-between p-4 rounded-20 mb-3 border-2 ${d.status === 'alerta' ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-800'}`}>
                    <div>
                      <p className="font-black uppercase text-sm">{d.nome}</p>
                      <p className="text-[10px] text-zinc-500">Vence em: {d.vencimento}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">R$ {d.valor},00</p>
                      {d.status === 'alerta' && <span className="text-[9px] font-black text-red-500 animate-pulse uppercase tracking-tighter">Atualizar Valor!</span>}
                    </div>
                 </div>
               ))}
               <button className="w-full mt-4 border-2 border-dashed border-zinc-700 p-4 rounded-20 text-zinc-500 font-black uppercase hover:border-yellow-400 hover:text-yellow-400 transition-all">+ Incluir Despesa</button>
            </div>
          </section>
        </div>

        {/* MODAL DE EXTRATO (ABRE AO CLICAR EM DETALHAR) */}
        {viewDetail && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-20">
            <div className="bg-zinc-900 border-8 border-yellow-400 w-full h-full rounded-60 p-20 overflow-y-auto relative">
              <button onClick={() => setViewDetail(null)} className="absolute top-10 right-10 text-5xl font-black text-zinc-500 hover:text-white">✕</button>
              <h2 className="text-6xl font-black uppercase italic mb-4">Extrato Detalhado: <span className="text-yellow-400">{viewDetail}</span></h2>
              <p className="text-zinc-500 text-2xl font-bold mb-12 uppercase tracking-widest">Consulta de meses anteriores e futuros</p>
              
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex justify-between p-8 bg-zinc-800 rounded-30 border-l-8 border-yellow-400">
                    <span className="text-3xl font-black">Item de Origem #{i}</span>
                    <span className="text-3xl font-black text-green-400">+ R$ 2.400,00</span>
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
    <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60 flex flex-col justify-between group hover:border-zinc-600 transition-all">
      <div>
        <p className="text-zinc-500 font-black uppercase mb-4 text-xl tracking-tighter">{title}</p>
        <p className={`text-6xl font-black ${color} tracking-tighter`}>{value}</p>
      </div>
      <button 
        onClick={onDetail}
        className="mt-8 w-full bg-zinc-800 hover:bg-yellow-400 hover:text-black p-4 rounded-20 font-black uppercase text-sm transition-all shadow-lg"
      >
        Ver Detalhes / Estrato
      </button>
    </div>
  )
}

function FaturamentoRow({ label, valor, perc }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between font-black uppercase italic text-sm">
        <span>{label}</span>
        <span className="text-yellow-400">R$ {valor} ({perc})</span>
      </div>
      <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden border border-zinc-700">
        <div className="bg-yellow-400 h-full rounded-full" style={{ width: perc }}></div>
      </div>
    </div>
  )
}