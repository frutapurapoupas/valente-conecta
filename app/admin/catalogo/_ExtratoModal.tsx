'use client'

import { useEffect } from 'react'
import { X, Printer, Download } from 'lucide-react'
import { diasParaVencer, ProdutoCatalogo } from '@/hooks/useAdminCatalogo'

interface Props {
  produtos: ProdutoCatalogo[]
  escopoLabel: string
  onClose: () => void
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ExtratoModal({ produtos, escopoLabel, onClose }: Props) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const totalCusto = produtos.reduce((s, p) => s + p.precoCusto * p.estoque, 0)
  const totalVenda = produtos.reduce((s, p) => s + p.preco * p.estoque, 0)
  const totalUnidades = produtos.reduce((s, p) => s + p.estoque, 0)
  const margem = totalCusto > 0 ? ((totalVenda - totalCusto) / totalCusto) * 100 : 0

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const exportarCSV = () => {
    const cab = [
      'Produto', 'EAN', 'Empresa', 'Cidade', 'Bairro',
      'Preco Venda (R$)', 'Preco Custo (R$)', 'Estoque (un)',
      'Total Venda (R$)', 'Total Custo (R$)',
      'Estoque Atualizado', 'Fonte', 'Status', 'Vendas Totais', 'Validade',
    ]
    const linhas = produtos.map(p => [
      p.nome, p.ean, p.empresa, p.cidade, p.bairro,
      p.preco.toFixed(2).replace('.', ','),
      p.precoCusto.toFixed(2).replace('.', ','),
      p.estoque,
      (p.preco * p.estoque).toFixed(2).replace('.', ','),
      (p.precoCusto * p.estoque).toFixed(2).replace('.', ','),
      p.estoqueAtualizado ? 'Sim' : 'Nao',
      p.fonte, p.status, p.totalVendas, p.validade ?? '',
    ])
    const totais = [
      'TOTAL', '', '', '', '',
      '', '',
      totalUnidades,
      totalVenda.toFixed(2).replace('.', ','),
      totalCusto.toFixed(2).replace('.', ','),
      '', '', '', '', '',
    ]
    const csv = [cab, ...linhas, totais]
      .map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';'))
      .join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extrato-estoque-' + escopoLabel.replace(/[^a-zA-Z0-9]/g, '-') + '-' + hoje.replace(/\//g, '-') + '.csv'
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white text-zinc-900 rounded-2xl shadow-2xl my-4">

        {/* Cabeçalho do extrato */}
        <div className="px-8 pt-8 pb-5 border-b-2 border-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Extrato de Estoque</p>
              <h2 className="text-2xl font-black text-zinc-900 leading-tight">Valente Conecta</h2>
              <p className="text-lg text-zinc-600 mt-0.5">{escopoLabel}</p>
              <p className="text-sm text-zinc-400 mt-1">Emitido em {hoje}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-100 transition-all text-zinc-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Totalizadores */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="border border-zinc-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Itens</p>
              <p className="text-2xl font-black text-zinc-900">{produtos.length}</p>
            </div>
            <div className="border border-zinc-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Unidades</p>
              <p className="text-2xl font-black text-zinc-900">{totalUnidades.toLocaleString('pt-BR')}</p>
            </div>
            <div className="border border-emerald-300 rounded-xl p-3 text-center bg-emerald-50">
              <p className="text-xs font-bold uppercase text-emerald-600 mb-0.5">Valor Venda</p>
              <p className="text-xl font-black text-emerald-700">R$ {fmt(totalVenda)}</p>
            </div>
            <div className="border border-zinc-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Custo Total</p>
              <p className="text-xl font-black text-zinc-700">R$ {fmt(totalCusto)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
            <span className="text-sm text-zinc-500 font-medium">Margem bruta estimada</span>
            <span className="text-lg font-black text-violet-700">{margem.toFixed(1)}%</span>
            <span className="text-sm text-zinc-400">lucro bruto R$ {fmt(totalVenda - totalCusto)}</span>
          </div>
        </div>

        {/* Tabela estilo extrato bancário */}
        <div className="px-8 py-4">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-12 gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200 pb-2 mb-1">
            <span className="col-span-4">Produto / Empresa</span>
            <span className="col-span-2">Bairro / Cidade</span>
            <span className="col-span-1 text-right">Estoque</span>
            <span className="col-span-2 text-right">Custo unit.</span>
            <span className="col-span-2 text-right">Venda unit.</span>
            <span className="col-span-1 text-right">Status</span>
          </div>

          {/* Linhas */}
          {produtos.map((p, i) => {
            const aVencer = p.validade && diasParaVencer(p.validade) <= 5
            const vencido = p.validade && diasParaVencer(p.validade) < 0
            return (
              <div
                key={p.id}
                className={
                  'grid grid-cols-12 gap-2 py-2.5 border-b text-sm ' +
                  (vencido ? 'bg-red-50 border-red-100' :
                   aVencer ? 'bg-orange-50 border-orange-100' :
                   i % 2 === 0 ? 'bg-white border-zinc-100' : 'bg-zinc-50 border-zinc-100')
                }
              >
                <div className="col-span-4">
                  <p className="font-semibold text-zinc-900 leading-tight">{p.nome}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.empresa}</p>
                  {!p.eanOficial && (
                    <span className="inline-block text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 rounded mt-0.5">EAN nao oficial</span>
                  )}
                  {p.validade && (
                    <span className={'inline-block text-[10px] font-bold px-1.5 rounded ml-1 mt-0.5 ' + (vencido ? 'text-red-700 bg-red-100' : aVencer ? 'text-orange-700 bg-orange-100' : 'text-zinc-500 bg-zinc-100')}>
                      {p.validade}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-zinc-700">{p.bairro}</p>
                  <p className="text-xs text-zinc-400">{p.cidade}</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="font-bold text-zinc-900">{p.estoque}</p>
                  <p className="text-xs text-zinc-400">un.</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="font-semibold text-zinc-700">R$ {fmt(p.precoCusto)}</p>
                  <p className="text-xs text-zinc-400">tot. R$ {fmt(p.precoCusto * p.estoque)}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="font-semibold text-emerald-700">R$ {fmt(p.preco)}</p>
                  <p className="text-xs text-zinc-400">tot. R$ {fmt(p.preco * p.estoque)}</p>
                </div>
                <div className="col-span-1 text-right">
                  <span className={
                    'text-[10px] font-bold px-1.5 py-0.5 rounded ' +
                    (p.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' :
                     p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-red-100 text-red-700')
                  }>
                    {p.status === 'ativo' ? 'Ativo' : p.status === 'pendente' ? 'Pend.' : 'Bloq.'}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{p.fonte.toUpperCase()}</p>
                </div>
              </div>
            )
          })}

          {/* Linha de total */}
          <div className="grid grid-cols-12 gap-2 py-3 border-t-2 border-zinc-900 mt-1 bg-zinc-900 rounded-xl px-0 -mx-0">
            <div className="col-span-4 px-3">
              <p className="text-sm font-black text-white uppercase tracking-wide">TOTAL GERAL</p>
              <p className="text-xs text-zinc-400">{produtos.length} produtos · {totalUnidades} unidades</p>
            </div>
            <div className="col-span-2" />
            <div className="col-span-1 text-right px-1">
              <p className="font-black text-white">{totalUnidades}</p>
            </div>
            <div className="col-span-2 text-right px-1">
              <p className="font-black text-white">R$ {fmt(totalCusto)}</p>
            </div>
            <div className="col-span-2 text-right px-1">
              <p className="font-black text-emerald-300">R$ {fmt(totalVenda)}</p>
            </div>
            <div className="col-span-1 text-right px-2">
              <p className="text-sm font-black text-violet-300">{margem.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Rodapé com botões */}
        <div className="px-8 pb-8 pt-4 flex items-center gap-3 border-t border-zinc-100">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-base font-bold text-white transition-all"
          >
            <Download className="w-5 h-5" /> Exportar Excel / CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-base font-bold text-white transition-all"
          >
            <Printer className="w-5 h-5" /> Imprimir / PDF
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-5 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-base font-semibold text-zinc-700 transition-all"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Print styles — quando imprimir, mostra só o modal */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .fixed { position: static !important; background: none !important; padding: 0 !important; }
          .w-full.max-w-3xl { box-shadow: none !important; border: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  )
}
