'use client'

import Link from 'next/link'
import {
  ArrowLeft, Save, Plus, Trash2, X, Globe, Star, Package,
  Building2, User, Clock, Bell, BellOff, Camera, Check, AlertTriangle
} from 'lucide-react'
import { usePerfilEmpresarial, TIPOS_PROFISSIONAL, CATEGORIAS_EMPRESA } from '@/hooks/usePerfilEmpresarial'

function SeletorTipo({ onSelect }: { onSelect: (t: 'empresa' | 'profissional') => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-800">Como você quer aparecer?</h1>
          <p className="text-gray-500 text-sm mt-2">Escolha o perfil que melhor descreve seu negócio</p>
        </div>

        <button
          onClick={() => onSelect('empresa')}
          className="w-full bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-blue-500 flex items-center gap-4 transition-all"
        >
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-black text-lg text-gray-800">Loja / Empresa</p>
            <p className="text-sm text-gray-500">Mercado, farmácia, restaurante, salão, oficina…</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('profissional')}
          className="w-full bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-purple-500 flex items-center gap-4 transition-all"
        >
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-black text-lg text-gray-800">Profissional Liberal</p>
            <p className="text-sm text-gray-500">Pedreiro, manicure, barbeiro, eletricista…</p>
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

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className={`bg-gradient-to-r ${gradFrom} ${gradTo} text-white sticky top-0 z-20`}>
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
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  aba === tab.id ? 'bg-white text-gray-800' : 'text-white/70 hover:text-white'
                }`}
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
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                {isEmpresa
                  ? <><Building2 className="w-5 h-5 text-blue-500" /> Dados da Empresa</>
                  : <><User className="w-5 h-5 text-purple-500" /> Dados Profissionais</>
                }
              </h2>

              {isEmpresa ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nome Fantasia *</label>
                    <input value={formEmpresa.nomeFantasia} onChange={e => updateEmpresa('nomeFantasia', e.target.value)}
                      placeholder="Ex: Mercadinho São José"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                    <select value={formEmpresa.categoria} onChange={e => updateEmpresa('categoria', e.target.value)}
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor} bg-white`}>
                      <option value="">Selecione…</option>
                      {CATEGORIAS_EMPRESA.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">CNPJ</label>
                    <input value={formEmpresa.cnpj} onChange={e => updateEmpresa('cnpj', e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Celular *</label>
                    <input value={formEmpresa.celular} onChange={e => updateEmpresa('celular', e.target.value)}
                      placeholder="(75) 99999-9999"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Endereço</label>
                    <input value={formEmpresa.endereco} onChange={e => updateEmpresa('endereco', e.target.value)}
                      placeholder="Rua, número, bairro — Valente, BA"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Seu Nome *</label>
                    <input value={formProfissional.nome} onChange={e => updateProfissional('nome', e.target.value)}
                      placeholder="Nome completo"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Serviço *</label>
                    <select value={formProfissional.tipoProfissional} onChange={e => updateProfissional('tipoProfissional', e.target.value)}
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor} bg-white`}>
                      <option value="">Selecione…</option>
                      {TIPOS_PROFISSIONAL.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Celular *</label>
                    <input value={formProfissional.celular} onChange={e => updateProfissional('celular', e.target.value)}
                      placeholder="(75) 99999-9999"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Valor da Diária / Serviço (R$)</label>
                    <input type="number" value={formProfissional.valorServico} onChange={e => updateProfissional('valorServico', e.target.value)}
                      placeholder="0,00"
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor}`} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Descrição resumida</label>
                    <textarea value={formProfissional.descricaoServico} onChange={e => updateProfissional('descricaoServico', e.target.value)}
                      placeholder="Ex: Pedreiro com 10 anos de experiência…"
                      rows={3}
                      className={`mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${ringColor} resize-none`} />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={salvarPerfil}
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all bg-gradient-to-r ${gradFrom} ${gradTo}`}
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
                className={`flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all bg-gradient-to-r ${gradFrom} ${gradTo}`}
              >
                <Plus className="w-5 h-5" />
                {isEmpresa ? 'Adicionar Produto' : 'Adicionar Serviço'}
              </button>
              <button
                onClick={() => setShowCatalogoOnline(true)}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-700 border-2 border-gray-200 flex items-center justify-center gap-2 bg-white hover:border-blue-400 transition-all"
              >
                <Globe className="w-5 h-5 text-blue-500" />
                Ver online
              </button>
            </div>

            {itensCatalogo.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-500">Nenhum item no catálogo</p>
                <p className="text-xs text-gray-400 mt-1">
                  Adicione {isEmpresa ? 'produtos' : 'serviços'} para aparecer na busca
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {itensCatalogo.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.foto
                        ? <img src={item.foto} className="w-full h-full object-cover" alt={item.nome} />
                        : <Package className="w-8 h-8 text-gray-300" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.nome}</p>
                      <p className="text-green-600 font-bold">R$ {item.preco.toFixed(2)}</p>
                      {item.descricao && <p className="text-xs text-gray-400 truncate">{item.descricao}</p>}
                    </div>
                    <button onClick={() => removerItem(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
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
            {/* Aviso de horário atípico — disponível para todos os negócios */}
            <div className={`rounded-2xl p-5 shadow-sm border-2 transition-all ${
              avisoAtipicoAtivo ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'
            }`}>
              <div className="mb-3">
                <p className="font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${avisoAtipicoAtivo ? 'text-amber-500' : 'text-gray-400'}`} />
                  Horário Especial
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Aparece para todos na busca, mesmo sem plano pago
                </p>
              </div>
              <button
                onClick={publicarAvisoAtipico}
                className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  avisoAtipicoAtivo
                    ? 'bg-amber-400 text-white shadow-lg shadow-amber-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {avisoAtipicoAtivo
                  ? <><X className="w-6 h-6" /> REMOVER AVISO</>
                  : <><AlertTriangle className="w-6 h-6" /> ESTOU ABERTO — HORÁRIO ESPECIAL</>
                }
              </button>
              {avisoAtipicoAtivo && (
                <p className="text-xs text-amber-700 text-center mt-3 font-bold">
                  ⚠️ Aviso ativo — clientes estão sendo avisados na busca
                </p>
              )}
            </div>

            {isEmpresa && (
              <>
                <div className={`rounded-2xl p-5 shadow-sm border-2 ${statusAberto ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">Status de Funcionamento</p>
                  <p className="text-xs text-gray-500">Avisa clientes na busca em tempo real</p>
                </div>
                {statusAberto ? <Bell className="w-6 h-6 text-green-600" /> : <BellOff className="w-6 h-6 text-gray-400" />}
              </div>
              <button
                onClick={toggleStatusAberto}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                  statusAberto
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusAberto
                  ? <><Check className="w-6 h-6" /> ESTAMOS ABERTOS AGORA!</>
                  : <><Clock className="w-6 h-6" /> Anunciar que estou aberto</>
                }
              </button>
              {statusAberto && (
                <p className="text-xs text-green-700 text-center mt-2 font-bold">
                  ✅ Clientes que buscarem vão ver que você está aberto agora
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Horários de Funcionamento
              </h2>
              <p className="text-xs text-gray-400">Fica visível para todos os clientes na busca.</p>

              <div className="space-y-3">
                {horarios.map(h => (
                  <div key={h.dia} className="flex items-center gap-3">
                    <button
                      onClick={() => updateHorario(h.dia, 'aberto', !h.aberto)}
                      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                        h.aberto ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {h.aberto && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="w-10 text-sm font-bold text-gray-600 flex-shrink-0">{h.label}</span>
                    {h.aberto ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={h.abertura}
                          onChange={e => updateHorario(h.dia, 'abertura', e.target.value)}
                          className="flex-1 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <span className="text-gray-400 text-xs">até</span>
                        <input type="time" value={h.fechamento}
                          onChange={e => updateHorario(h.dia, 'fechamento', e.target.value)}
                          className="flex-1 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Fechado</span>
                    )}
                  </div>
                ))}
              </div>

              <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-800">
                {isEmpresa ? 'Novo Produto' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setShowAddItem(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nome *</label>
              <input value={novoItem.nome} onChange={e => setNovoItem(prev => ({ ...prev, nome: e.target.value }))}
                placeholder={isEmpresa ? 'Ex: Arroz 5kg' : 'Ex: Corte masculino'}
                className="mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Preço (R$) *</label>
              <input type="number" value={novoItem.preco} onChange={e => setNovoItem(prev => ({ ...prev, preco: e.target.value }))}
                placeholder="0,00"
                className="mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
              <input value={novoItem.descricao} onChange={e => setNovoItem(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Detalhes adicionais…"
                className="mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Foto</label>
              {novoItem.foto ? (
                <div className="relative mt-1">
                  <img src={novoItem.foto} className="w-full h-32 object-cover rounded-xl" alt="preview" />
                  <button onClick={() => setNovoItem(prev => ({ ...prev, foto: null }))}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-blue-400 transition-all">
                  <Camera className="w-6 h-6 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Adicionar foto</span>
                  <input type="file" accept="image/*" onChange={handleFotoItem} className="hidden" />
                </label>
              )}
            </div>

            {erroItem && <p className="text-red-500 text-sm font-bold">{erroItem}</p>}

            <button onClick={adicionarItem}
              className={`w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 active:scale-95 transition-all bg-gradient-to-r ${gradFrom} ${gradTo}`}>
              <Plus className="w-5 h-5" /> Adicionar ao Catálogo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Preview online */}
      {showCatalogoOnline && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" /> Como aparece na internet
                </h2>
                <p className="text-xs text-gray-400">{itensCatalogo.length} item(s) público(s)</p>
              </div>
              <button onClick={() => setShowCatalogoOnline(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              <div className={`bg-gradient-to-r ${gradFrom} ${gradTo} rounded-2xl p-5 text-white text-center`}>
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
                <div className="text-center py-8 text-gray-400">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Nenhum item adicionado ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {itensCatalogo.map(item => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                      <div className="w-full h-24 bg-gray-100 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                        {item.foto
                          ? <img src={item.foto} className="w-full h-full object-cover" alt={item.nome} />
                          : <Package className="w-8 h-8 text-gray-300" />
                        }
                      </div>
                      <p className="font-semibold text-sm text-gray-800 leading-tight">{item.nome}</p>
                      <p className="text-green-600 font-bold text-sm mt-0.5">R$ {item.preco.toFixed(2)}</p>
                      <div className="flex mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-center text-xs text-gray-400 pb-2">
                Preview de como os clientes veem seu perfil no app
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}