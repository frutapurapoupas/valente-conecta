'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useCatalogoProfissional, FORM_VAZIO } from '@/hooks/useCatalogoProfissional'
import {
  ArrowLeft, Package, Wrench, Plus, Trash2,
  ToggleLeft, ToggleRight, Loader2, ImagePlus, DollarSign,
  Lock, CheckCircle2, XCircle, Upload, Clock,
} from 'lucide-react'

function fmtPreco(v: number | null) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Admin sempre auto-aprova (passa autoAprovar=true)
const ADMIN_AUTO_APROVA = true

export default function CatalogoProfissionalAdminPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const {
    profissional, itens, loading, salvando, uploadandoId,
    fotosPendentes,
    form, setForm,
    mostrarForm, setMostrarForm,
    filtroTipo, setFiltroTipo,
    stats,
    adicionarItem, toggleAtivo, removerItem,
    uploadFoto, aprovarFoto, rejeitarFoto,
  } = useCatalogoProfissional(id)

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
    </div>
  )

  const prof = profissional!

  function triggerUpload(itemId: string) {
    fileRefs.current[itemId]?.click()
  }

  async function handleFileChange(itemId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFoto(itemId, file, ADMIN_AUTO_APROVA)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/admin/profissionais"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>

          {/* Avatar + nome */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
              {prof.foto_url
                ? <img src={prof.foto_url} alt={prof.nome} className="w-full h-full object-cover rounded-xl" />
                : '💼'
              }
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-white truncate leading-none">{prof.nome}</h1>
              <p className="text-sm text-zinc-500 capitalize">{prof.especialidade} · {prof.cidade}</p>
            </div>
          </div>

          {/* Plano badge */}
          <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-black uppercase border ${
            prof.tem_plano
              ? 'bg-violet-600/20 border-violet-500/30 text-violet-300'
              : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}>
            {prof.tem_plano ? 'Com plano' : 'Sem plano'}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4 pb-24">

        {/* STAT STRIP */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total',    value: stats.total,    color: 'text-white' },
            { label: 'Serviços', value: stats.servicos,  color: 'text-violet-300' },
            { label: 'Produtos', value: stats.produtos,  color: 'text-indigo-300' },
            { label: 'Ativos',   value: stats.ativos,    color: 'text-emerald-300' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-sm text-zinc-600 font-bold uppercase mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* FOTOS PENDENTES */}
        {fotosPendentes.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 space-y-3">
            <p className="text-base font-black text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {fotosPendentes.length} foto{fotosPendentes.length !== 1 ? 's' : ''} aguardando aprovação
            </p>
            {fotosPendentes.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-zinc-900/60 rounded-xl p-3">
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img src={item.foto_pendente_url!} alt={item.nome} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-white truncate">{item.nome}</p>
                  <p className="text-sm text-zinc-500">Foto enviada pelo profissional</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => aprovarFoto(item.id)}
                    className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-xl text-sm font-black uppercase transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprovar
                  </button>
                  <button
                    onClick={() => rejeitarFoto(item.id)}
                    className="flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 px-3 py-1.5 rounded-xl text-sm font-black uppercase transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INFO — plano sem plano */}
        {!prof.tem_plano && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-base text-amber-300">
              Profissional <strong>sem plano</strong> — preços e contatos ficam ocultos no catálogo público.
            </p>
          </div>
        )}

        {/* FILTRO + ADICIONAR */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-1 flex-wrap">
            {(['todos', 'servico', 'produto'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={`px-4 py-2 rounded-full text-sm font-black uppercase transition-all ${
                  filtroTipo === t
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {t === 'todos' ? 'Todos' : t === 'servico' ? 'Serviços' : 'Produtos'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMostrarForm(v => !v)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-base font-black uppercase transition-all ${
              mostrarForm ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        {/* FORM NOVO ITEM */}
        {mostrarForm && (
          <div className="bg-zinc-900 border border-violet-500/20 rounded-2xl p-5 space-y-4">
            <p className="text-base font-black text-violet-300 uppercase">Novo item</p>
            <div className="flex gap-2">
              {(['servico', 'produto'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, tipo: t }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-base font-black uppercase transition-all border ${
                    form.tipo === t
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  {t === 'servico' ? <Wrench className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  {t === 'servico' ? 'Serviço' : 'Produto'}
                </button>
              ))}
            </div>
            <input
              placeholder="Nome do serviço / produto *"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-violet-500 outline-none"
            />
            <textarea
              placeholder="Descrição (opcional)"
              rows={2}
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-violet-500 outline-none resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  placeholder="URL da foto"
                  value={form.foto_url}
                  onChange={e => setForm(f => ({ ...f, foto_url: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-3 text-base text-white placeholder:text-zinc-600 focus:border-violet-500 outline-none"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  placeholder="Preço (ex: 35,00)"
                  value={form.preco}
                  onChange={e => setForm(f => ({ ...f, preco: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-3 text-base text-white placeholder:text-zinc-600 focus:border-violet-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO) }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 py-3 rounded-xl text-base font-black uppercase transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarItem}
                disabled={!form.nome.trim() || salvando}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white py-3 rounded-xl text-base font-black uppercase flex items-center justify-center gap-2 transition-all"
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* LISTA DE ITENS */}
        {itens.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-base">
            Nenhum {filtroTipo === 'todos' ? 'item' : filtroTipo === 'servico' ? 'serviço' : 'produto'} cadastrado
          </div>
        )}

        <div className="space-y-3">
          {itens.map(item => {
            const uploading = uploadandoId === item.id
            return (
              <div
                key={item.id}
                className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
                  item.ativo ? 'border-zinc-800' : 'border-zinc-800 opacity-50'
                }`}
              >
                <div className="flex">
                  {/* FOTO — coluna esquerda */}
                  <div className="w-28 flex-shrink-0 bg-zinc-800 relative group cursor-pointer" onClick={() => triggerUpload(item.id)}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={el => { fileRefs.current[item.id] = el }}
                      onChange={e => handleFileChange(item.id, e)}
                    />
                    {uploading ? (
                      <div className="w-full min-h-[7rem] flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                      </div>
                    ) : item.foto_url ? (
                      <img
                        src={item.foto_url}
                        alt={item.nome}
                        className="w-full min-h-[7rem] h-full object-cover"
                      />
                    ) : (
                      <div className="w-full min-h-[7rem] flex flex-col items-center justify-center gap-1 text-zinc-600">
                        <span className="text-3xl">{item.tipo === 'servico' ? '🛠️' : '📦'}</span>
                        <span className="text-xs font-bold uppercase">sem foto</span>
                      </div>
                    )}
                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-white" />
                      <span className="text-xs font-black text-white uppercase">Upload</span>
                    </div>
                    {/* Pending dot */}
                    {item.foto_status === 'pendente' && (
                      <div className="absolute top-1 right-1 bg-amber-500 rounded-full w-3 h-3 border-2 border-zinc-900" />
                    )}
                  </div>

                  {/* INFO + AÇÕES */}
                  <div className="flex-1 min-w-0 p-4 flex gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-lg text-white truncate leading-tight">{item.nome}</p>
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                          item.tipo === 'servico'
                            ? 'bg-violet-600/20 text-violet-300'
                            : 'bg-indigo-600/20 text-indigo-300'
                        }`}>
                          {item.tipo === 'servico' ? 'Serviço' : 'Produto'}
                        </span>
                        {item.foto_status === 'pendente' && (
                          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
                            Foto pendente
                          </span>
                        )}
                      </div>
                      {item.descricao && (
                        <p className="text-sm text-zinc-500 line-clamp-2">{item.descricao}</p>
                      )}
                      <p className={`text-lg font-black ${item.preco != null ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {fmtPreco(item.preco)}
                      </p>
                      {item.foto_pendente_url && item.foto_status === 'pendente' && (
                        <div className="flex items-center gap-2 pt-1">
                          <img src={item.foto_pendente_url} alt="pendente" className="w-10 h-10 rounded-lg object-cover border border-amber-500/30" />
                          <div className="flex gap-1">
                            <button onClick={() => aprovarFoto(item.id)} className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-2 py-1 rounded-lg font-black uppercase transition-all">
                              ✓ Aprovar
                            </button>
                            <button onClick={() => rejeitarFoto(item.id)} className="text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 px-2 py-1 rounded-lg font-black uppercase transition-all">
                              ✗ Rejeitar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações verticais */}
                    <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                      <button
                        onClick={() => triggerUpload(item.id)}
                        title="Trocar foto"
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <ImagePlus className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => toggleAtivo(item.id)}
                        title={item.ativo ? 'Desativar' : 'Ativar'}
                        className="p-1.5 transition-colors"
                      >
                        {item.ativo
                          ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                          : <ToggleLeft className="w-6 h-6 text-zinc-600" />
                        }
                      </button>
                      <button
                        onClick={() => removerItem(item.id)}
                        title="Remover"
                        className="p-1.5 rounded-xl hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-zinc-600 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
