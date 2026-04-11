'use client'

import { useState } from 'react'
import { useAdminCatalogo, FiltroTipo, diasParaVencer } from '@/hooks/useAdminCatalogo'
import ExtratoModal from './_ExtratoModal'
import {
  Search, Package, ShoppingCart, BarChart2, Store, MapPin, Barcode,
  Activity, Clock, AlertTriangle, DollarSign, TrendingUp, Building2, FileText,
} from 'lucide-react'

export default function CatalogoPage() {
  const [mostrarExtrato, setMostrarExtrato] = useState(false)

  const {
    cidadeSelecionada, setCidadeSelecionada,
    lojaSelecionada,   setLojaSelecionada,
    bairroSelecionado, setBairroSelecionado,
    cidades,
    lojasDaCidade,
    bairrosDaBase,
    filtroEmpresa, setFiltroEmpresa,
    filtroTipo,    setFiltroTipo,
    topNInput,     setTopNInput,
    diasVencimentoInput, setDiasVencimentoInput,
    diasAlerta,
    stats,
    valorTotalEstoque,
    valorPorLoja,
    valorPorBairro,
    topItens,
    intelItemIdx, setIntelItemIdx,
    intelItem,
    itensVencendo,
    produtosFiltrados,
  } = useAdminCatalogo()

  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fonteBadge = (fonte: string) => {
    if (fonte === 'pdv')    return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    if (fonte === 'leitor') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    return 'bg-zinc-700 text-zinc-300 border border-zinc-600'
  }
  const fonteLabel = (fonte: string) => fonte === 'pdv' ? 'PDV' : fonte === 'leitor' ? 'Leitor' : 'Manual'

  const statusBadge = (s: string) =>
    s === 'ativo'    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
    s === 'pendente' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                       'bg-red-500/20 text-red-300 border border-red-500/30'
  const statusLabel = (s: string) => s === 'ativo' ? 'Ativo' : s === 'pendente' ? 'Pendente' : 'Bloqueado'

  const vencBadge = (val: string) => {
    const d = diasParaVencer(val)
    return d < 0 || d <= 2 ? 'bg-red-500/25 text-red-300 border border-red-500/40' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
  }
  const vencLabel = (val: string) => {
    const d = diasParaVencer(val)
    if (d < 0) return 'Vencido'
    if (d === 0) return 'Vence hoje!'
    if (d === 1) return 'Vence amanha'
    return 'Vence em ' + d + 'd'
  }

  const pills: { key: FiltroTipo; label: string }[] = [
    { key: 'todos',              label: 'Todos' },
    { key: 'pdv',                label: 'PDV' },
    { key: 'estoque_atualizado', label: 'Estoque atualizado' },
    { key: 'ean_nao_oficial',    label: 'EAN nao oficial' },
    { key: 'a_vencer',           label: 'A vencer' },
  ]

  const escopoLabel =
    lojaSelecionada
      ? (bairroSelecionado ? lojaSelecionada + ' - ' + bairroSelecionado : lojaSelecionada)
      : bairroSelecionado
        ? (cidadeSelecionada !== 'todas' ? cidadeSelecionada + ' - Bairro ' + bairroSelecionado : 'Bairro: ' + bairroSelecionado)
        : cidadeSelecionada !== 'todas' ? cidadeSelecionada : 'Todas as cidades'
  const maxVendaLoja   = valorPorLoja.reduce((m, l) => Math.max(m, l.venda), 0)
  const maxVendaBairro = valorPorBairro.reduce((m, b) => Math.max(m, b.venda), 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {mostrarExtrato && (
        <ExtratoModal
          produtos={produtosFiltrados}
          escopoLabel={escopoLabel}
          onClose={() => setMostrarExtrato(false)}
        />
      )}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900">
        <div className="px-5 pt-5 pb-3">
          <h1 className="text-2xl font-bold text-white leading-none">Catalogo de Produtos</h1>
          <p className="text-zinc-400 text-sm mt-1">{escopoLabel}</p>
        </div>
        <div className="px-5 pb-2">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 pointer-events-none" />
            <select
              value={cidadeSelecionada}
              onChange={e => setCidadeSelecionada(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-white appearance-none focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="todas">Todas as cidades</option>
              {cidades.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">▾</span>
          </div>
        </div>
        {cidadeSelecionada !== 'todas' && (
          <div className="px-5 pb-2">
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
              <select
                value={lojaSelecionada ?? ''}
                onChange={e => setLojaSelecionada(e.target.value || null)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-white appearance-none focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Todas as lojas</option>
                {lojasDaCidade.map(loja => (
                  <option key={loja} value={loja}>{loja}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">▾</span>
            </div>
          </div>
        )}
        {bairrosDaBase.length > 0 && (
          <div className="px-5 pb-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
              <select
                value={bairroSelecionado ?? ''}
                onChange={e => setBairroSelecionado(e.target.value || null)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-white appearance-none focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="">Todos os bairros</option>
                {bairrosDaBase.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">▾</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5 pb-20">

        <div className="bg-gradient-to-r from-emerald-900/40 to-zinc-900 rounded-2xl border border-emerald-700/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-emerald-300 uppercase tracking-wide">Valor Total do Estoque</h2>
            <span className="text-xs text-zinc-500 ml-1 truncate">— {escopoLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/70 rounded-xl p-3 border border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Custo total</p>
              <p className="text-xl font-black text-white">R$ {fmt(valorTotalEstoque.custo)}</p>
              <p className="text-xs text-zinc-600 mt-0.5">aquisicao</p>
            </div>
            <div className="bg-zinc-900/70 rounded-xl p-3 border border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Valor de venda</p>
              <p className="text-xl font-black text-emerald-300">R$ {fmt(valorTotalEstoque.venda)}</p>
              <p className="text-xs text-zinc-600 mt-0.5">ao consumidor</p>
            </div>
            <div className="bg-zinc-900/70 rounded-xl p-3 border border-zinc-800">
              <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Margem bruta</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-black text-violet-300">{valorTotalEstoque.margem.toFixed(1)}%</p>
                <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <p className="text-[10px] text-zinc-600 mt-0.5">sobre o custo</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Store className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Estoque por Loja</h2>
            <span className="text-xs text-zinc-500 ml-1">— {cidadeSelecionada === 'todas' ? 'todas as cidades' : cidadeSelecionada}</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {valorPorLoja.map(loja => {
              const pct = maxVendaLoja > 0 ? (loja.venda / maxVendaLoja) * 100 : 0
              const isActive = lojaSelecionada === loja.empresa
              return (
                <button key={loja.empresa} onClick={() => { if (cidadeSelecionada !== 'todas') setLojaSelecionada(isActive ? null : loja.empresa) }} className={'w-full text-left p-4 transition-all ' + (isActive ? 'bg-emerald-900/20' : 'hover:bg-zinc-800/50')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={'text-base font-semibold truncate ' + (isActive ? 'text-emerald-300' : 'text-white')}>{loja.empresa}</p>
                        {isActive && <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Selecionada</span>}
                      </div>
                      {cidadeSelecionada === 'todas' && <p className="text-sm text-zinc-500 mb-1">{loja.cidade}</p>}
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                        <div className={'h-1 rounded-full ' + (isActive ? 'bg-emerald-500' : 'bg-blue-500')} style={{ width: pct + '%' }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-emerald-300">R$ {fmt(loja.venda)}</p>
                      <p className="text-sm text-zinc-500">custo R$ {fmt(loja.custo)}</p>
                      <p className="text-sm text-violet-400 mt-0.5">{loja.margem.toFixed(1)}% margem</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1.5 text-sm text-zinc-500">
                    <span>{loja.itens} itens</span>
                    <span>·</span>
                    <span>lucro R$ {fmt(loja.venda - loja.custo)}</span>
                  </div>
                </button>
              )
            })}
            {valorPorLoja.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">Nenhuma loja neste escopo.</p>}
          </div>
          {cidadeSelecionada === 'todas' && <p className="text-sm text-zinc-600 text-center py-2 border-t border-zinc-800">Selecione uma cidade para filtrar por loja</p>}
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Estoque por Bairro</h2>
            <span className="text-xs text-zinc-500 ml-1">— {escopoLabel}</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {valorPorBairro.map(b => {
              const pct = maxVendaBairro > 0 ? (b.venda / maxVendaBairro) * 100 : 0
              return (
                <button key={b.bairro} onClick={() => setBairroSelecionado(bairroSelecionado === b.bairro ? null : b.bairro)} className={'w-full text-left p-4 transition-all ' + (bairroSelecionado === b.bairro ? 'bg-orange-900/20' : 'hover:bg-zinc-800/50')}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={'text-base font-semibold ' + (bairroSelecionado === b.bairro ? 'text-orange-300' : 'text-white')}>{b.bairro}</p>
                        {bairroSelecionado === b.bairro && <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Selecionado</span>}
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                        <div className={'h-1.5 rounded-full ' + (bairroSelecionado === b.bairro ? 'bg-orange-500' : 'bg-emerald-500')} style={{ width: pct + '%' }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-emerald-300">R$ {fmt(b.venda)}</p>
                      <p className="text-sm text-zinc-500">custo R$ {fmt(b.custo)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500">{b.itens} itens · lucro R$ {fmt(b.venda - b.custo)}</p>
                </button>
              )
            })}
            {valorPorBairro.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">Nenhum bairro neste escopo.</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-zinc-400" /><span className="text-sm text-zinc-400">Total de Itens</span></div>
            <p className="text-3xl font-bold text-white">{stats.totalItens}</p>
            <p className="text-sm text-zinc-500 mt-1">no escopo atual</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2"><ShoppingCart className="w-4 h-4 text-blue-400" /><span className="text-sm text-zinc-400">Via PDV</span></div>
            <p className="text-3xl font-bold text-blue-400">{stats.itensPDV}</p>
            <p className="text-sm text-zinc-500 mt-1">capturados no caixa</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-emerald-400" /><span className="text-sm text-zinc-400">Estoque Atualizado</span></div>
            <p className="text-3xl font-bold text-emerald-400">{stats.estoqueAtualizado}</p>
            <p className="text-sm text-zinc-500 mt-1">atualizados recentemente</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2"><Barcode className="w-4 h-4 text-yellow-400" /><span className="text-sm text-zinc-400">EAN nao oficial</span></div>
            <p className="text-3xl font-bold text-yellow-400">{stats.eanNaoOficial}</p>
            <p className="text-sm text-zinc-500 mt-1">aguardando validacao</p>
          </div>
        </div>

        {itensVencendo.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-base font-bold text-red-300">{itensVencendo.length} {itensVencendo.length === 1 ? 'item' : 'itens'} com validade nos proximos {diasAlerta} dias</p>
            </div>
            <div className="space-y-2">
              {itensVencendo.map(p => {
                const dias = diasParaVencer(p.validade!)
                return (
                  <div key={p.id} className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-base font-semibold text-white">{p.nome}</p>
                      <p className="text-sm text-zinc-400">{p.empresa} · Estoque: {p.estoque} un.</p>
                    </div>
                    <div className="text-right">
                      <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (dias < 0 ? 'bg-red-600/30 text-red-300' : dias <= 2 ? 'bg-red-500/25 text-red-300' : 'bg-orange-500/20 text-orange-300')}>
                        {dias < 0 ? 'Vencido ha ' + Math.abs(dias) + 'd' : dias === 0 ? 'Vence hoje!' : dias + 'd restantes'}
                      </span>
                      <p className="text-sm text-zinc-500 mt-0.5">{p.validade}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800 flex-wrap">
            <BarChart2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <h2 className="text-base font-semibold text-white">Inteligencia Comercial</h2>
            <span className="text-sm text-zinc-500">— top</span>
            <input type="number" min="1" max="20" value={topNInput} onChange={e => setTopNInput(e.target.value)} className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-violet-500" />
            <span className="text-sm text-zinc-500">itens mais vendidos</span>
          </div>
          <div className="flex gap-2 p-4 overflow-x-auto">
            {topItens.map((item, idx) => (
              <button key={item.nome} onClick={() => setIntelItemIdx(idx)} className={'flex-shrink-0 rounded-xl px-4 py-3 text-left transition-all ' + (intelItemIdx === idx ? 'bg-violet-600 text-white border border-violet-500' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700')}>
                <p className="text-sm font-semibold truncate max-w-[150px]">{item.nome}</p>
                <p className="text-2xl font-bold mt-0.5">{item.totalVendas.toLocaleString('pt-BR')}</p>
                <p className="text-sm opacity-60">vendas totais</p>
              </button>
            ))}
            {topItens.length === 0 && <p className="text-xs text-zinc-600 py-4 px-2">Sem dados no escopo selecionado.</p>}
          </div>
          {intelItem && (
            <div className="grid grid-cols-1 gap-4 px-5 pb-5 lg:grid-cols-2">
              <div>
                <div className="flex items-center gap-1.5 mb-3"><Store className="w-4 h-4 text-blue-400" /><span className="text-xs font-semibold text-zinc-300">Lojas que vendem</span></div>
                <div className="space-y-2">
                  {intelItem.lojas.map(loja => {
                    const pct = Math.round((loja.vendas / intelItem.totalVendas) * 100)
                    return (
                      <div key={loja.empresa} className="bg-zinc-800 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-white">{loja.empresa}</span><span className="text-xs text-zinc-400">{loja.vendas} vendas</span></div>
                        <div className="w-full bg-zinc-700 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: pct + '%' }} /></div>
                        <div className="flex justify-between mt-1"><span className="text-xs text-zinc-500">{pct}% do total</span><span className="text-xs text-zinc-500">Estoque: {loja.estoque}</span></div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-3"><MapPin className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-zinc-300">Bairros com mais vendas</span></div>
                <div className="space-y-2">
                  {intelItem.bairros.map(b => {
                    const pct = Math.round((b.vendas / intelItem.totalVendas) * 100)
                    return (
                      <div key={b.bairro} className="bg-zinc-800 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-white">{b.bairro}</span><span className="text-xs text-zinc-400">{b.vendas} vendas</span></div>
                        <div className="w-full bg-zinc-700 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: pct + '%' }} /></div>
                        <p className="text-xs text-zinc-500 mt-1">{pct}% do total</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} placeholder="Buscar por empresa..." className="w-full bg-zinc-800 text-white text-base rounded-xl pl-10 pr-4 py-3 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-zinc-700" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pills.map(p => (
              <button key={p.key} onClick={() => setFiltroTipo(p.key)} className={'text-sm px-4 py-2 rounded-full font-medium transition-all ' + (filtroTipo === p.key ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700')}>
                {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              <Clock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <input type="number" min="1" max="60" value={diasVencimentoInput} onChange={e => setDiasVencimentoInput(e.target.value)} className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-orange-300 text-center focus:outline-none focus:border-orange-500" />
              <span className="text-sm text-zinc-500">dias</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">
            <span className="font-semibold text-white">{produtosFiltrados.length}</span>{' '}
            {produtosFiltrados.length === 1 ? 'item encontrado' : 'itens encontrados'}
            {filtroTipo === 'a_vencer' && <span className="text-orange-400 ml-2">— vencendo em ate {diasAlerta} {diasAlerta === 1 ? 'dia' : 'dias'}</span>}
          </p>
          <button
            onClick={() => setMostrarExtrato(true)}
            disabled={produtosFiltrados.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white transition-all"
          >
            <FileText className="w-4 h-4" /> Extrato / PDF
          </button>
        </div>

        <div className="space-y-2">
          {produtosFiltrados.map(prod => (
            <div key={prod.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base font-semibold text-white">{prod.nome}</span>
                    {!prod.eanOficial && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">EAN nao oficial</span>}
                    {prod.estoqueAtualizado && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Estoque ok</span>}
                    {prod.validade && diasParaVencer(prod.validade) <= diasAlerta && (
                      <span className={'text-xs px-1.5 py-0.5 rounded-full border ' + vencBadge(prod.validade)}>
                        <Clock className="w-3 h-3 inline mr-0.5" />{vencLabel(prod.validade)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" />{prod.empresa}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{prod.bairro}</span>
                    {cidadeSelecionada === 'todas' && <span className="flex items-center gap-1 text-zinc-600"><Building2 className="w-3.5 h-3.5" />{prod.cidade}</span>}
                    <span className="font-mono text-zinc-600 text-xs">{prod.ean}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-white">R$ {fmt(prod.preco)}</p>
                  <p className="text-xs text-zinc-600">custo R$ {fmt(prod.precoCusto)}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">Estoque: <span className="font-semibold text-white">{prod.estoque}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={'text-xs px-2 py-0.5 rounded-full ' + fonteBadge(prod.fonte)}>{fonteLabel(prod.fonte)}</span>
                <span className={'text-xs px-2 py-0.5 rounded-full ' + statusBadge(prod.status)}>{statusLabel(prod.status)}</span>
                <span className="text-sm text-zinc-500 ml-auto">{prod.totalVendas.toLocaleString('pt-BR')} vendas</span>
              </div>
            </div>
          ))}
          {produtosFiltrados.length === 0 && (
            <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
              <Package className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-base">Nenhum item encontrado para os filtros selecionados.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
