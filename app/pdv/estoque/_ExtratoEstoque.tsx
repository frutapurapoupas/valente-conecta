'use client'

import { useEffect } from 'react'
import { X, Printer, Download } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  codigo: string
  preco: number
  quantidade: number
  fornecedor?: string
  precoCompra?: number
  validade?: string
  emPromocao?: boolean
}

interface Props {
  produtos: Produto[]
  nomeEstabelecimento?: string
  onClose: () => void
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function diasParaVencer(validade: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(validade + 'T00:00:00')
  return Math.floor((venc.getTime() - hoje.getTime()) / 86_400_000)
}

export default function ExtratoEstoque({ produtos, nomeEstabelecimento = 'Meu Estabelecimento', onClose }: Props) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const totalUnidades   = produtos.reduce((s, p) => s + p.quantidade, 0)
  const totalVenda      = produtos.reduce((s, p) => s + p.preco * p.quantidade, 0)
  const totalCusto      = produtos.reduce((s, p) => s + (p.precoCompra ?? 0) * p.quantidade, 0)
  const margem          = totalCusto > 0 ? ((totalVenda - totalCusto) / totalCusto) * 100 : 0
  const temCusto        = produtos.some(p => p.precoCompra != null && p.precoCompra > 0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const exportarCSV = () => {
    const cab = [
      'Produto', 'Codigo', 'Fornecedor',
      'Preco Venda (R$)', 'Preco Custo (R$)', 'Estoque (un)',
      'Total Venda (R$)', 'Total Custo (R$)',
      'Em Promocao', 'Validade',
    ]
    const linhas = produtos.map(p => [
      p.nome, p.codigo, p.fornecedor ?? '',
      p.preco.toFixed(2).replace('.', ','),
      (p.precoCompra ?? 0).toFixed(2).replace('.', ','),
      p.quantidade,
      (p.preco * p.quantidade).toFixed(2).replace('.', ','),
      ((p.precoCompra ?? 0) * p.quantidade).toFixed(2).replace('.', ','),
      p.emPromocao ? 'Sim' : 'Nao',
      p.validade ?? '',
    ])
    const totais = [
      'TOTAL', '', '',
      '',
      '',
      totalUnidades,
      totalVenda.toFixed(2).replace('.', ','),
      totalCusto.toFixed(2).replace('.', ','),
      '', '',
    ]
    const csv = [cab, ...linhas, totais]
      .map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';'))
      .join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'extrato-estoque-' + hoje.replace(/\//g, '-') + '.csv'
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #extrato-lojista { display: block !important; position: static !important; }
          #extrato-lojista .no-print { display: none !important; }
        }
      `}</style>

      <div
        id="extrato-lojista"
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <div className="w-full max-w-2xl bg-white text-zinc-900 rounded-2xl shadow-2xl my-4">

          {/* Cabeçalho estilo extrato bancário */}
          <div className="px-6 pt-6 pb-4 border-b-2 border-zinc-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Extrato de Estoque</p>
                <h2 className="text-xl font-black text-zinc-900 leading-tight">{nomeEstabelecimento}</h2>
                <p className="text-sm text-zinc-400 mt-0.5">Emitido em {hoje} · {produtos.length} produto{produtos.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={onClose}
                className="no-print p-2 rounded-xl hover:bg-zinc-100 transition text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Totalizadores */}
            <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
              <div className="border border-zinc-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Itens</p>
                <p className="text-2xl font-black text-zinc-900">{produtos.length}</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Unidades</p>
                <p className="text-2xl font-black text-zinc-900">{totalUnidades.toLocaleString('pt-BR')}</p>
              </div>
              <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold uppercase text-emerald-600 mb-0.5">Valor Venda</p>
                <p className="text-lg font-black text-emerald-700">R$ {fmt(totalVenda)}</p>
              </div>
              {temCusto && (
                <div className="border border-zinc-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Custo Total</p>
                  <p className="text-lg font-black text-zinc-700">R$ {fmt(totalCusto)}</p>
                </div>
              )}
            </div>

            {temCusto && (
              <div className="flex items-center justify-between mt-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2">
                <span className="text-sm text-zinc-500">Margem bruta estimada</span>
                <span className="text-lg font-black text-violet-700">{margem.toFixed(1)}%</span>
                <span className="text-sm text-zinc-400">lucro R$ {fmt(totalVenda - totalCusto)}</span>
              </div>
            )}
          </div>

          {/* Tabela */}
          <div className="px-6 py-4">
            {/* Cabeçalho da tabela */}
            <div className={`grid gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-200 pb-2 mb-1 ${temCusto ? 'grid-cols-12' : 'grid-cols-10'}`}>
              <span className="col-span-4">Produto / Código</span>
              <span className="col-span-3">Fornecedor</span>
              <span className="col-span-1 text-right">Qtd</span>
              {temCusto && <span className="col-span-2 text-right">Custo un.</span>}
              <span className="col-span-2 text-right">Venda un.</span>
            </div>

            {/* Linhas */}
            {produtos.map((p, i) => {
              const dvencido  = p.validade ? diasParaVencer(p.validade) : null
              const aVencer   = dvencido !== null && dvencido >= 0 && dvencido <= 5
              const vencido   = dvencido !== null && dvencido < 0

              return (
                <div
                  key={p.id}
                  className={
                    `grid gap-2 py-2.5 border-b text-sm items-start ` +
                    `${temCusto ? 'grid-cols-12' : 'grid-cols-10'} ` +
                    (vencido  ? 'bg-red-50 border-red-100' :
                     aVencer  ? 'bg-orange-50 border-orange-100' :
                     i % 2 === 0 ? 'bg-white border-zinc-100' : 'bg-zinc-50 border-zinc-100')
                  }
                >
                  <div className="col-span-4">
                    <p className="font-semibold text-zinc-900 leading-tight">{p.nome}</p>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{p.codigo}</p>
                    {p.emPromocao && (
                      <span className="inline-block text-[10px] font-bold text-red-700 bg-red-100 px-1.5 rounded mt-0.5">Promoção</span>
                    )}
                    {p.validade && (
                      <span className={`inline-block text-[10px] font-bold px-1.5 rounded ml-1 mt-0.5 ${vencido ? 'text-red-700 bg-red-100' : aVencer ? 'text-orange-700 bg-orange-100' : 'text-zinc-500 bg-zinc-100'}`}>
                        {vencido
                          ? `Venceu ${Math.abs(dvencido!)}d atrás`
                          : dvencido === 0 ? 'Vence hoje'
                          : `Vence em ${dvencido}d`}
                      </span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="text-zinc-600 text-xs">{p.fornecedor ?? '—'}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="font-bold text-zinc-900">{p.quantidade}</p>
                    <p className="text-xs text-zinc-400">un.</p>
                  </div>
                  {temCusto && (
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-zinc-600">R$ {fmt(p.precoCompra ?? 0)}</p>
                      <p className="text-xs text-zinc-400">tot. R$ {fmt((p.precoCompra ?? 0) * p.quantidade)}</p>
                    </div>
                  )}
                  <div className="col-span-2 text-right">
                    <p className="font-semibold text-emerald-700">R$ {fmt(p.preco)}</p>
                    <p className="text-xs text-zinc-400">tot. R$ {fmt(p.preco * p.quantidade)}</p>
                  </div>
                </div>
              )
            })}

            {/* Linha de total */}
            <div className={`grid gap-2 py-3 border-t-2 border-zinc-900 mt-1 bg-zinc-900 rounded-xl px-3 ${temCusto ? 'grid-cols-12' : 'grid-cols-10'}`}>
              <div className="col-span-4">
                <p className="text-sm font-black text-white uppercase">TOTAL GERAL</p>
                <p className="text-xs text-zinc-400">{produtos.length} itens · {totalUnidades} un.</p>
              </div>
              <div className="col-span-3" />
              <div className="col-span-1 text-right">
                <p className="font-black text-white">{totalUnidades}</p>
              </div>
              {temCusto && (
                <div className="col-span-2 text-right">
                  <p className="font-black text-white text-sm">R$ {fmt(totalCusto)}</p>
                </div>
              )}
              <div className="col-span-2 text-right">
                <p className="font-black text-emerald-300 text-sm">R$ {fmt(totalVenda)}</p>
              </div>
            </div>
          </div>

          {/* Rodapé com botões */}
          <div className="no-print px-6 pb-6 pt-2 flex items-center gap-3 border-t border-zinc-100 flex-wrap">
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition"
            >
              <Download className="w-4 h-4" /> Exportar Excel / CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition"
            >
              <Printer className="w-4 h-4" /> Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
