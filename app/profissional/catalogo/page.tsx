'use client'

import Link from 'next/link'
import {
  ArrowLeft, Save, Plus, Trash2, X, Globe, Star, Package,
  Building2, User, Clock, Bell, BellOff, Camera, Check, AlertTriangle
} from 'lucide-react'
import { usePerfilEmpresarial, TIPOS_PROFISSIONAL, CATEGORIAS_EMPRESA } from '@/hooks/usePerfilEmpresarial'

function SeletorTipo({ onSelect }: { onSelect: (t: 'empresa' | 'profissional') => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Como você quer aparecer?</h1>
          <p className="text-zinc-400 text-sm mt-2">Escolha o perfil que melhor descreve seu negócio</p>
        </div>

        <button
          onClick={() => onSelect('empresa')}
          className="w-full bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500 rounded-2xl p-6 flex items-center gap-4 transition-all"
        >
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-black text-lg text-white">Loja / Empresa</p>
            <p className="text-sm text-zinc-400">Mercado, farmácia, restaurante, salão, oficina…</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('profissional')}
          className="w-full bg-zinc-900 border-2 border-zinc-800 hover:border-purple-500 rounded-2xl p-6 flex items-center gap-4 transition-all"
        >
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-black text-lg text-white">Profissional Liberal</p>
            <p className="text-sm text-zinc-400">Pedreiro, manicure, barbeiro, eletricista…</p>
          </div>
        </button>
      </div>
    </div>
  )
}

export default function PerfilCatalogoPage() {
  const {
    tipoNegocio, setTipoNegocio,
    perfilSalvo,
    aba, setAba,
    formEmpresa, updateEmpresa,
    formProfissional, updateProfissional,
    horarios, updateHorario,
    statusAberto, toggleStatusAberto,
    avisoAtipicoAtivo, publicarAvisoAtipico,
    itensCatalogo,
    showAddItem, setShowAddItem,
    showCatalogoOnline, setShowCatalogoOnline,
    novoItem, setNovoItem,
    erroItem,
    handleFotoItem,
    adicionarItem,
    removerItem,
    salvarPerfil,
    nomePrincipal,
  } = usePerfilEmpresarial()

  if (!tipoNegocio) {
    return <SeletorTipo onSelect={setTipoNegocio} />
  }

  const isEmpresa = tipoNegocio === 'empresa'
  const gradFrom = isEmpresa ? 'from-blue-600' : 'from-purple-600'
  const gradTo = isEmpresa ? 'to-indigo-700' : 'to-violet-700'
  const ringColor = isEmpresa ? 'focus:ring-blue-400' : 'focus:ring-purple-400'

  const inputCls = mt-1 w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
  const selectCls = mt-1 w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 

  return (
    <div className="min-h-screen bg-zinc-950 pb-32">
      {/* Header */}
      <header className={g-gradient-to-r   text-white sticky top-0 z-20}>
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <Link href="/pdv/colaborativo" className="p-2 hover:bg-white/20 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">
              {nomePrincipal || (isEmpresa ? 'Perfil da Loja' : 'Perfil Profissional')}
            </h1>
            <p className="text-xs text-white/70">
              {isEmpresa ? 'Loja / Empresa' : 'Profissional Liberal'}
            </p>
          </div>
          <button
            onClick={() => setTipoNegocio(null)}
            className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
          >
            Trocar
          </button>
        </div>

        {perfilSalvo && (
          <div className="flex px-4 pb-1 gap-1 max-w-2xl mx-auto">
            {([
              { id: 'perfil', label: 'Perfil' },
              { id: 'catalogo', label: isEmpresa ? 'Produtos' : 'Serviços' },
              { id: 'horarios', label: 'Horários' },
            ] as { id: typeof aba; label: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setAba(tab.id)}
                className={px-4 py-1.5 rounded-full text-sm font-bold transition-all }
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* ── ABA PERFIL ── */}
        {aba === 'perfil' && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h2 className="font-bold text-zinc-300 flex items-center gap-2">
                {isEmpresa
                  ? <><Building2 className="w-5 h-5 text-blue-400" /> Dados da Empresa</>
                  : <><User className="w-5 h-5 text-purple-400" /> Dados Profissionais</>
                }
              </h2>

              {isEmpresa ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Nome Fantasia *</label>
                    <input value={formEmpresa.nomeFantasia} onChange={e => updateEmpresa('nomeFantasia', e.target.value)}
                      placeholder="Ex: Mercadinho São José" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Categoria</label>
                    <select value={formEmpresa.categoria} onChange={e => updateEmpresa('categoria', e.target.value)} className={selectCls}>
                      <option value="">Selecione…</option>
                      {CATEGORIAS_EMPRESA.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">CNPJ</label>
                    <input value={formEmpresa.cnpj} onChange={e => updateEmpresa('cnpj', e.target.value)}
                      placeholder="00.000.000/0001-00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Celular *</label>
                    <input value={formEmpresa.celular} onChange={e => updateEmpresa('celular', e.target.value)}
                      placeholder="(75) 99999-9999" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Endereço</label>
                    <input value={formEmpresa.endereco} onChange={e => updateEmpresa('endereco', e.target.value)}
                      placeholder="Rua, número, bairro — Valente, BA" className={inputCls} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Seu Nome *</label>
                    <input value={formProfissional.nome} onChange={e => updateProfissional('nome', e.target.value)}
                      placeholder="Nome completo" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Tipo de Serviço *</label>
                    <select value={formProfissional.tipoProfissional} onChange={e => updateProfissional('tipoProfissional', e.target.value)} className={selectCls}>
                      <option value="">Selecione…</option>
                      {TIPOS_PROFISSIONAL.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Celular *</label>
                    <input value={formProfissional.celular} onChange={e => updateProfissional('celular', e.target.value)}
                      placeholder="(75) 99999-9999" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Valor da Diária / Serviço (R$)</label>
                    <input type="number" value={formProfissional.valorServico} onChange={e => updateProfissional('valorServico', e.target.value)}
                      placeholder="0,00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase">Descrição resumida</label>
                    <textarea value={formProfissional.descricaoServico} onChange={e => updateProfissional('descricaoServico', e.target.value)}
                      placeholder="Ex: Pedreiro com 10 anos de experiência…"
                      rows={3}
                      className={${inputCls} resize-none} />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={salvarPerfil}
              className={w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all bg-gradient-to-r  }
            >
              <Save className="w-5 h-5" />
              {perfilSalvo ? 'Atualizar Perfil' : 'Salvar e Continuar'}
            </button>
          </>
        )}

        {/* ── ABA CATÁLOGO ── */}
        {aba === 'catalogo' && perfilSalvo && (
          <>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddItem(true)}
                className={lex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all bg-gradient-to-r  }
              >
                <Plus className="w-5 h-5" />
                {isEmpresa ? 'Adicionar Produto' : 'Adicionar Serviço'}
              </button>
              <button
                onClick={() => setShowCatalogoOnline(true)}
                className="flex-1 py-3 rounded-2xl font-bold text-zinc-300 border-2 border-zinc-700 flex items-center justify-center gap-2 bg-zinc-900 hover:border-blue-400 transition-all"
              >
                <Globe className="w-5 h-5 text-blue-400" />
                Ver online
              </button>
            </div>

            {itensCatalogo.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
                <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="font-bold text-zinc-400">Nenhum item no catálogo</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Adicione {isEmpresa ? 'produtos' : 'serviços'} para aparecer na busca
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {itensCatalogo.map(item => (
                  <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-800 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.foto
                        ? <img src={item.foto} className="w-full h-full object-cover" alt={item.nome} />
                        : <Package className="w-8 h-8 text-zinc-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.nome}</p>
                      <p className="text-green-400 font-bold">R$ {item.preco.toFixed(2)}</p>
                      {item.descricao && <p className="text-xs text-zinc-500 truncate">{item.descricao}</p>}
                    </div>
                    <button onClick={() => removerItem(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ABA HORÁRIOS ── */}
        {aba === 'horarios' && perfilSalvo && (
          <>
            <div className={ounded-2xl p-5 border-2 transition-all }>
              <div className="mb-3">
                <p className="font-bold text-white flex items-center gap-2">
                  <AlertTriangle className={w-5 h-5 } />
                  Horário Especial
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Aparece para todos na busca, mesmo sem plano pago
                </p>
              </div>
              <button
                onClick={publicarAvisoAtipico}
                className={w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 }
              >
                {avisoAtipicoAtivo
                  ? <><X className="w-6 h-6" /> REMOVER AVISO</>
                  : <><AlertTriangle className="w-6 h-6" /> ESTOU ABERTO — HORÁRIO ESPECIAL</>
                }
              </button>
              {avisoAtipicoAtivo && (
                <p className="text-xs text-amber-400 text-center mt-3 font-bold">
                  ⚠️ Aviso ativo — clientes estão sendo avisados na busca
                </p>
              )}
            </div>

            {isEmpresa && (
              <>
                <div className={ounded-2xl p-5 border-2 }>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">Status de Funcionamento</p>
                      <p className="text-xs text-zinc-500">Avisa clientes na busca em tempo real</p>
                    </div>
                    {statusAberto ? <Bell className="w-6 h-6 text-green-400" /> : <BellOff className="w-6 h-6 text-zinc-500" />}
                  </div>
                  <button
                    onClick={toggleStatusAberto}
                    className={w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 }
                  >
                    {statusAberto
                      ? <><Check className="w-6 h-6" /> ESTAMOS ABERTOS AGORA!</>
                      : <><Clock className="w-6 h-6" /> Anunciar que estou aberto</>
                    }
                  </button>
                  {statusAberto && (
                    <p className="text-xs text-green-400 text-center mt-2 font-bold">
                      ✅ Clientes que buscarem vão ver que você está aberto agora
                    </p>
                  )}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <h2 className="font-bold text-zinc-300 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" /> Horários de Funcionamento
                  </h2>
                  <p className="text-xs text-zinc-500">Fica visível para todos os clientes na busca.</p>

                  <div className="space-y-3">
                    {horarios.map(h => (
                      <div key={h.dia} className="flex items-center gap-3">
                        <button
                          onClick={() => updateHorario(h.dia, 'aberto', !h.aberto)}
                          className={w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all }
                        >
                          {h.aberto && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className="w-10 text-sm font-bold text-zinc-400 flex-shrink-0">{h.label}</span>
                        {h.aberto ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input type="time" value={h.abertura}
                              onChange={e => updateHorario(h.dia, 'abertura', e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="text-zinc-600 text-xs">até</span>
                            <input type="time" value={h.fechamento}
                              onChange={e => updateHorario(h.dia, 'fechamento', e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-600 italic">Fechado</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Save className="w-4 h-4" /> Salvar Horários
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* MODAL: Adicionar item */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center">
          <div className="bg-zinc-900 border-t border-zinc-800 w-full max-w-lg rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white">
                {isEmpresa ? 'Novo Produto' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setShowAddItem(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Nome *</label>
              <input value={novoItem.nome} onChange={e => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                placeholder={isEmpresa ? 'Ex: Arroz 5kg' : 'Ex: Corte masculino'}
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Preço (R$) *</label>
              <input type="number" value={novoItem.preco} onChange={e => setNovoItem(prev => ({ ...prev, preco: e.target.value }))}
                placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Descrição</label>
              <input value={novoItem.descricao} onChange={e => setNovoItem(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Detalhes adicionais…" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Foto</label>
              {novoItem.foto ? (
                <div className="relative mt-1">
                  <img src={novoItem.foto} className="w-full h-32 object-cover rounded-xl" alt="preview" />
                  <button onClick={() => setNovoItem(prev => ({ ...prev, foto: null }))}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-5 cursor-pointer hover:border-blue-400 transition-all">
                  <Camera className="w-6 h-6 text-zinc-500 mr-2" />
                  <span className="text-sm text-zinc-400">Adicionar foto</span>
                  <input type="file" accept="image/*" onChange={handleFotoItem} className="hidden" />
                </label>
              )}
            </div>

            {erroItem && <p className="text-red-400 text-sm font-bold">{erroItem}</p>}

            <button onClick={adicionarItem}
              className={w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 active:scale-95 transition-all bg-gradient-to-r  }>
              <Plus className="w-5 h-5" /> Adicionar ao Catálogo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Preview online */}
      {showCatalogoOnline && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center">
          <div className="bg-zinc-900 border-t border-zinc-800 w-full max-w-lg rounded-t-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" /> Como aparece na internet
                </h2>
                <p className="text-xs text-zinc-500">{itensCatalogo.length} item(s) público(s)</p>
              </div>
              <button onClick={() => setShowCatalogoOnline(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              <div className={g-gradient-to-r   rounded-2xl p-5 text-white text-center}>
                <div className="w-16 h-16 bg-white/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                  {isEmpresa ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
                </div>
                <p className="font-black text-xl">{nomePrincipal || 'Meu Negócio'}</p>
                <p className="text-white/80 text-sm mt-1">
                  {isEmpresa
                    ? (formEmpresa.categoria || 'Empresa') + ' · Valente, BA'
                    : (formProfissional.tipoProfissional || 'Profissional') + ' · Valente, BA'
                  }
                </p>
                {statusAberto && (
                  <span className="inline-block mt-2 bg-green-400 text-green-900 text-xs font-black px-3 py-1 rounded-full">
                    🟢 ABERTO AGORA
                  </span>
                )}
              </div>

              {itensCatalogo.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Nenhum item adicionado ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {itensCatalogo.map(item => (
                    <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3">
                      <div className="w-full h-24 bg-zinc-700 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                        {item.foto
                          ? <img src={item.foto} className="w-full h-full object-cover" alt={item.nome} />
                          : <Package className="w-8 h-8 text-zinc-500" />
                        }
                      </div>
                      <p className="font-semibold text-sm text-white leading-tight">{item.nome}</p>
                      <p className="text-green-400 font-bold text-sm mt-0.5">R$ {item.preco.toFixed(2)}</p>
                      <div className="flex mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-center text-xs text-zinc-600 pb-2">
                Preview de como os clientes veem seu perfil no app
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
