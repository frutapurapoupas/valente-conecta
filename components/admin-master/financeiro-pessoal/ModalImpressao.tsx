'use client'
import { X, Printer } from 'lucide-react'
import {
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA,
  type Lancamento, type LancamentoTipo, type LancamentoStatus,
} from '@/hooks/useFinanceiroPessoal'

const TIPO_LABEL: Record<LancamentoTipo, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
  fatura:  'Fatura',
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function mesLabel(mes: string) {
  const [ano, m] = mes.split('-')
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${nomes[Number(m) - 1]} ${ano}`
}

interface ModalImpressaoProps {
  lancamentos: Lancamento[]
  filtroMes: string
  filtroTipo: LancamentoTipo | 'todos'
  filtroStatus: LancamentoStatus | 'todos'
  onFechar: () => void
}

export default function ModalImpressao({ lancamentos, filtroMes, filtroTipo, filtroStatus, onFechar }: ModalImpressaoProps) {
  const sorted = [...lancamentos].sort((a, b) => a.vencimento.localeCompare(b.vencimento))
  const totalReceitas = sorted.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = sorted.filter(l => l.tipo !== 'receita').reduce((s, l) => s + l.valor, 0)
  const saldo = totalReceitas - totalDespesas

  const tipoLabel = filtroTipo === 'todos' ? 'Todos os tipos' : TIPO_LABEL[filtroTipo]
  const statusLabel = filtroStatus === 'todos' ? 'Todos os status' : filtroStatus.charAt(0).toUpperCase() + filtroStatus.slice(1)

  return (
    <>
      <div className="fixed inset-0 z-50 bg-zinc-950/95 flex items-start justify-center overflow-y-auto p-4 print:hidden">
        <div className="bg-white rounded-2xl w-full max-w-2xl my-4 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 print:hidden">
            <p className="text-white font-black text-base">Pré-visualização de Impressão</p>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
              </button>
              <button onClick={onFechar} className="p-2 bg-zinc-800 rounded-xl">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          <div id="print-area" className="p-8 bg-white text-zinc-900">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-zinc-900">Finanças Pessoais</h1>
                <p className="text-zinc-500 text-sm mt-0.5">Relatório de lançamentos · Valente Conecta</p>
              </div>
              <div className="text-right text-sm text-zinc-500">
                <p className="font-bold text-zinc-700">{mesLabel(filtroMes)}</p>
                <p>{tipoLabel} · {statusLabel}</p>
                <p>Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-emerald-700 uppercase">Receitas</p>
                <p className="text-lg font-black text-emerald-700">{fmt(totalReceitas)}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-red-700 uppercase">Despesas</p>
                <p className="text-lg font-black text-red-700">{fmt(totalDespesas)}</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${
                saldo >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-xs font-bold uppercase ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Saldo</p>
                <p className={`text-lg font-black ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(saldo)}</p>
              </div>
            </div>

            {sorted.length === 0 ? (
              <p className="text-center text-zinc-400 py-8">Nenhum lançamento encontrado</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-zinc-300">
                    <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Descrição</th>
                    <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Categoria</th>
                    <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Vencimento</th>
                    <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Status</th>
                    <th className="text-right py-2 font-black text-zinc-700 text-xs uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((l, i) => {
                    const cat = [...CATEGORIAS_RECEITA, ...CATEGORIAS_DESPESA].find(c => c.value === l.categoria)
                    return (
                      <tr key={l.id} className={`border-b border-zinc-100 ${i % 2 === 0 ? '' : 'bg-zinc-50'}`}>
                        <td className="py-2 pr-3 font-semibold text-zinc-800">{l.descricao}</td>
                        <td className="py-2 pr-3 text-zinc-500">{cat?.emoji} {cat?.label}</td>
                        <td className="py-2 pr-3 text-zinc-500 font-mono text-xs">{l.vencimento}</td>
                        <td className="py-2 pr-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            l.status === 'pago'     ? 'bg-emerald-100 text-emerald-700' :
                            l.status === 'atrasado' ? 'bg-red-100 text-red-700' :
                            l.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                            'bg-zinc-100 text-zinc-500'
                          }`}>{l.status}</span>
                        </td>
                        <td className={`py-2 text-right font-black ${
                          l.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-300">
                    <td colSpan={4} className="pt-3 font-black text-zinc-700 text-sm">Total ({sorted.length} lançamentos)</td>
                    <td className={`pt-3 text-right font-black text-base ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(saldo)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            <p className="text-xs text-zinc-400 mt-8 text-center">Valente Conecta · Finanças Pessoais · Documento gerado automaticamente</p>
          </div>
        </div>
      </div>

      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-900">Finanças Pessoais</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Relatório de lançamentos · Valente Conecta</p>
          </div>
          <div className="text-right text-sm text-zinc-500">
            <p className="font-bold text-zinc-700">{mesLabel(filtroMes)}</p>
            <p>{tipoLabel} · {statusLabel}</p>
            <p>Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-emerald-300 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-emerald-700 uppercase">Receitas</p>
            <p className="text-lg font-black text-emerald-700">{fmt(totalReceitas)}</p>
          </div>
          <div className="border border-red-300 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-red-700 uppercase">Despesas</p>
            <p className="text-lg font-black text-red-700">{fmt(totalDespesas)}</p>
          </div>
          <div className="border rounded-xl p-3 text-center">
            <p className="text-xs font-bold uppercase text-zinc-700">Saldo</p>
            <p className={`text-lg font-black ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(saldo)}</p>
          </div>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-300">
              <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Descrição</th>
              <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Categoria</th>
              <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Vencimento</th>
              <th className="text-left py-2 pr-3 font-black text-zinc-700 text-xs uppercase">Status</th>
              <th className="text-right py-2 font-black text-zinc-700 text-xs uppercase">Valor</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l, i) => {
              const cat = [...CATEGORIAS_RECEITA, ...CATEGORIAS_DESPESA].find(c => c.value === l.categoria)
              return (
                <tr key={l.id} className={i % 2 === 0 ? '' : 'bg-zinc-50'}>
                  <td className="py-1.5 pr-3 font-semibold text-zinc-800">{l.descricao}</td>
                  <td className="py-1.5 pr-3 text-zinc-500">{cat?.emoji} {cat?.label}</td>
                  <td className="py-1.5 pr-3 text-zinc-500 font-mono text-xs">{l.vencimento}</td>
                  <td className="py-1.5 pr-3 text-zinc-500">{l.status}</td>
                  <td className={`py-1.5 text-right font-black ${l.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {l.tipo === 'receita' ? '+' : '-'}{fmt(l.valor)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-zinc-300">
              <td colSpan={4} className="pt-3 font-black text-zinc-700">Total ({sorted.length} lançamentos)</td>
              <td className={`pt-3 text-right font-black text-base ${saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(saldo)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-xs text-zinc-400 mt-8 text-center">Valente Conecta · Finanças Pessoais · Documento gerado automaticamente</p>
      </div>
    </>
  )
}
