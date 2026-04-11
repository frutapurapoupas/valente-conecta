'use client'

import { useAdminAcademia } from '@/hooks/useAdminAcademia'
import {
  Dumbbell, Users, Search, Bell, Megaphone, Settings2,
  ToggleLeft, ToggleRight, Send, Image as ImageIcon, CheckCircle2,
  AlertTriangle, Activity, RefreshCw,
  Building2, Zap, ImagePlus, X,
  MapPin, Phone, ExternalLink, DollarSign, Trash2, Plus, MessageCircle
} from 'lucide-react'

const PLANO_LABEL: Record<string, string> = { gratuito: 'Grátis', basico: 'Básico' }
const PLANO_COR: Record<string, string>   = { gratuito: 'bg-zinc-700 text-zinc-300', basico: 'bg-indigo-600/30 text-indigo-300' }

export default function AcademiaAdminPage() {
  const {
    aba, setAba,
    filtro, setFiltro,
    filtroPlano, setFiltroPlano,
    academias, toggleAcademia,
    alunos, alunosPoucoUso,
    stats,
    funcionalidades, toggleFuncionalidade,
    planosPrecos, atualizarPlanoPreco,
    carrossel, atualizarCarrossel,
    campanhas,
    novaCampanhaTitulo, setNovaCampanhaTitulo,
    novaCampanhaMensagem, setNovaCampanhaMensagem,
    enviarIncentivoAleatorio, enviarCampanha, enviandoPush,
    frasesIncentivo, novaFrase, setNovaFrase,
    adicionarFrase, editarFrase, removerFrase,
  } = useAdminAcademia()

  const ABAS = [
    { id: 'academias', label: 'Academias',  icon: <Building2  className="w-4 h-4" /> },
    { id: 'alunos',    label: 'Alunos',     icon: <Users      className="w-4 h-4" /> },
    { id: 'planos',    label: 'Planos',     icon: <Settings2  className="w-4 h-4" /> },
    { id: 'campanhas', label: 'Campanhas',  icon: <Megaphone  className="w-4 h-4" /> },
  ] as const

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-yellow-400" />
          <div>
            <h1 className="text-base font-black uppercase italic text-yellow-400 leading-none">Gym Control</h1>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Academia Admin</p>
          </div>
        </div>
        {/* Stats rápidas */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-center">
            <p className="text-xs text-zinc-500 font-bold uppercase leading-none">Total</p>
            <p className="text-base font-black text-white">{stats.totalAlunos}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-center">
            <p className="text-xs text-emerald-400/80 font-bold uppercase leading-none">Regulares</p>
            <p className="text-base font-black text-emerald-300">{stats.alunosRegulares}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-center">
            <p className="text-xs text-amber-400/80 font-bold uppercase leading-none">Pouco uso</p>
            <p className="text-base font-black text-amber-300">{stats.alunosPoucoUso}</p>
          </div>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="sticky top-[57px] z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 flex">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-bold uppercase transition-all ${
              aba === a.id ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {a.icon}{a.label}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-4 pb-20">

        {/* ══ ABA: ACADEMIAS ══════════════════════════════════════════════ */}
        {aba === 'academias' && (
          <>
            <section>
              <p className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-3">
                Unidades cadastradas ({academias.length})
              </p>
              <div className="space-y-3">
                {academias.map(ac => (
                  <div key={ac.id} className={`bg-zinc-900 border rounded-2xl p-4 space-y-3 ${ac.ativa ? 'border-zinc-800' : 'border-zinc-800 opacity-50'}`}>
                    {/* Cabeçalho: ícone + nome + toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${ac.ativa ? 'bg-yellow-400/15' : 'bg-zinc-800'}`}>
                          <Dumbbell className={`w-5 h-5 ${ac.ativa ? 'text-yellow-400' : 'text-zinc-600'}`} />
                        </div>
                        <div>
                          <p className="font-black text-base text-white">{ac.nome}</p>
                          <p className="text-sm text-zinc-500">{ac.cidade} · <span className="text-zinc-400">{ac.alunos} alunos</span></p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAcademia(ac.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex-shrink-0 ${
                          ac.ativa
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                      >
                        {ac.ativa ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {ac.ativa ? 'Ativa' : 'Inativa'}
                      </button>
                    </div>
                    {/* Detalhes */}
                    <div className="pl-14 space-y-1.5">
                      <p className="text-sm font-semibold text-zinc-300">Resp.: {ac.responsavel}</p>
                      {ac.contato && (
                        <a href={`tel:${ac.contato.replace(/\D/g,'')}`} className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 w-fit">
                          <Phone className="w-3.5 h-3.5" /> {ac.contato}
                        </a>
                      )}
                      {ac.endereco && (
                        <p className="flex items-start gap-1.5 text-sm text-zinc-500">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-600" /> {ac.endereco}
                        </p>
                      )}
                      {ac.localizador && (
                        <a href={ac.localizador} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 w-fit">
                          <ExternalLink className="w-3.5 h-3.5" /> Ver no mapa
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Carrossel de anúncios (apenas para plano gratuito) */}
            <section className="bg-zinc-900 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-indigo-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Carrossel de Publicidade
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Exibido apenas para usuários do plano <strong className="text-zinc-300">Grátis</strong></p>
                </div>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">3 slots</span>
              </div>
              <div className="space-y-3">
                {carrossel.map(slot => (
                  <div key={slot.slot} className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 bg-indigo-600 rounded-full text-[10px] font-black text-white flex items-center justify-center">{slot.slot}</span>
                      <p className="text-xs font-bold text-zinc-400 uppercase">Slot {slot.slot}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-10 bg-zinc-700 rounded-lg flex items-center justify-center border border-zinc-600 flex-shrink-0">
                        {slot.url
                          ? <img src={slot.url} alt="banner" className="w-full h-full object-cover rounded-lg" />
                          : <ImagePlus className="w-4 h-4 text-zinc-500" />
                        }
                      </div>
                      <input
                        placeholder="Título do banner"
                        value={slot.titulo}
                        onChange={e => atualizarCarrossel(slot.slot, 'titulo', e.target.value)}
                        className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <input
                      placeholder="URL de destino (ex: /academia)"
                      value={slot.destino}
                      onChange={e => atualizarCarrossel(slot.slot, 'destino', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500 outline-none"
                    />
                    <input
                      placeholder="URL da imagem (https://...)"
                      value={slot.url}
                      onChange={e => atualizarCarrossel(slot.slot, 'url', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                ))}
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all py-2.5 rounded-xl text-xs font-black uppercase text-white">
                Salvar Carrossel
              </button>
            </section>
          </>
        )}

        {/* ══ ABA: ALUNOS ═════════════════════════════════════════════════ */}
        {aba === 'alunos' && (
          <>
            {/* Composição por plano */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-sm text-zinc-500 font-bold uppercase mb-1">Plano Grátis</p>
                <p className="text-3xl font-black text-white">{stats.alunosGratuitos}</p>
                <p className="text-xs text-zinc-600 mt-1">{Math.round(stats.alunosGratuitos / stats.totalAlunos * 100)}% da base</p>
              </div>
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 text-center">
                <p className="text-sm text-indigo-400 font-bold uppercase mb-1">Plano Básico</p>
                <p className="text-3xl font-black text-white">{stats.alunosBasico}</p>
                <p className="text-xs text-zinc-600 mt-1">{Math.round(stats.alunosBasico / stats.totalAlunos * 100)}% da base</p>
              </div>
            </section>

            {/* Alerta pouco uso */}
            {alunosPoucoUso.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-black text-base text-amber-300">{alunosPoucoUso.length} alunos com pouco uso (&gt;7 dias sem treinar)</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{alunosPoucoUso.map(a => a.nome.split(' ')[0]).join(', ')}</p>
                </div>
                <button
                  onClick={enviarIncentivoAleatorio}
                  disabled={enviandoPush}
                  className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                >
                  {enviandoPush ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                  Push
                </button>
              </div>
            )}

            {/* Filtro por plano */}
            <div className="flex gap-2">
              {([['todos', 'Todos'], ['gratuito', 'Grátis'], ['basico', 'Pagantes']] as const).map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setFiltroPlano(val)}
                  className={`flex-1 py-2 rounded-xl text-sm font-black uppercase transition-all ${
                    filtroPlano === val
                      ? val === 'basico' ? 'bg-indigo-600 text-white' : 'bg-yellow-400 text-black'
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                placeholder="Buscar aluno ou academia..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/50 outline-none"
              />
            </div>

            {/* Lista alunos */}
            <section className="space-y-2">
              {alunos.map(aluno => (
                <div
                  key={aluno.id}
                  className={`bg-zinc-900 border rounded-2xl p-3 flex items-center gap-3 ${
                    aluno.diasSemUso > 14 ? 'border-red-500/20' :
                    aluno.diasSemUso > 7  ? 'border-amber-500/20' :
                    'border-zinc-800'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <span className="font-black text-base text-zinc-400">{aluno.nome.charAt(0)}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-base text-white truncate">{aluno.nome}</p>
                      <span className={`text-xs font-black uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${PLANO_COR[aluno.plano]}`}>
                        {PLANO_LABEL[aluno.plano]}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 truncate">{aluno.academia}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-zinc-600">{aluno.totalCheckins} check-ins</span>
                      {aluno.diasSemUso === 0
                        ? <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5"><Activity className="w-3 h-3" /> hoje</span>
                        : <span className={`text-xs font-bold ${aluno.diasSemUso > 14 ? 'text-red-400' : aluno.diasSemUso > 7 ? 'text-amber-400' : 'text-zinc-500'}`}>
                            {aluno.diasSemUso}d sem treinar
                          </span>
                      }
                      {aluno.whatsapp && (
                        <a
                          href={`https://wa.me/55${aluno.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-500 font-bold flex items-center gap-0.5 hover:text-emerald-400"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${aluno.ativo ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                </div>
              ))}
            </section>
          </>
        )}

        {/* ══ ABA: PLANOS ═════════════════════════════════════════════════ */}
        {aba === 'planos' && (
          <>
            {/* Preços editáveis */}
            <section className="space-y-3">
              <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">Preços dos Planos</p>
              <div className="grid grid-cols-2 gap-3">
                {planosPrecos.map(pp => (
                  <div
                    key={pp.plano}
                    className={`rounded-2xl p-4 space-y-2 border ${
                      pp.plano === 'basico'
                        ? 'bg-indigo-600/10 border-indigo-500/30'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className={`w-4 h-4 ${pp.plano === 'basico' ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <p className={`font-black text-sm uppercase ${pp.plano === 'basico' ? 'text-indigo-300' : 'text-zinc-400'}`}>{pp.label}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-sm font-bold">R$</span>
                      <input
                        value={pp.preco}
                        onChange={e => atualizarPlanoPreco(pp.plano, 'preco', e.target.value)}
                        className={`flex-1 bg-zinc-800 border rounded-lg px-3 py-1.5 text-base font-black text-white outline-none focus:border-yellow-400/60 ${
                          pp.plano === 'basico' ? 'border-indigo-500/30' : 'border-zinc-700'
                        }`}
                        placeholder="0,00"
                      />
                      <span className="text-zinc-500 text-xs">/mês</span>
                    </div>
                    <input
                      value={pp.descricao}
                      onChange={e => atualizarPlanoPreco(pp.plano, 'descricao', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-400 outline-none focus:border-yellow-400/60 placeholder:text-zinc-600"
                      placeholder="Descrição do plano"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 text-xs font-black uppercase tracking-wider bg-zinc-800/60 px-4 py-3">
                <span className="text-zinc-500">Funcionalidade</span>
                <span className="text-center text-zinc-500">Grátis</span>
                <span className="text-center text-indigo-400">Básico</span>
              </div>
              {funcionalidades.map((f, i) => (
                <div
                  key={f.id}
                  className={`grid grid-cols-3 px-4 py-3 items-center ${i < funcionalidades.length - 1 ? 'border-b border-zinc-800' : ''}`}
                >
                  <p className="text-sm text-zinc-300 font-medium pr-2 leading-tight">{f.label}</p>
                  {(['gratuito', 'basico'] as const).map(plano => (
                    <div key={plano} className="flex justify-center">
                      <button
                        onClick={() => toggleFuncionalidade(f.id, plano)}
                        className="transition-all"
                        title={f.planos[plano] ? 'Clique para desativar' : 'Clique para ativar'}
                      >
                        {f.planos[plano]
                          ? <ToggleRight className={`w-6 h-6 ${plano === 'basico' ? 'text-indigo-400' : 'text-emerald-400'}`} />
                          : <ToggleLeft className="w-6 h-6 text-zinc-700" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <p className="text-xs text-zinc-600 text-center px-4">
              Alterações nos planos refletem imediatamente no app. Funcionalidade "Ver anúncios" é mantida obrigatoriamente ativa no plano Grátis.
            </p>
          </>
        )}

        {/* ══ ABA: CAMPANHAS ══════════════════════════════════════════════ */}
        {aba === 'campanhas' && (
          <>
            {/* Gerenciar frases de incentivo */}
            <section className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-black text-base text-amber-300">Frases de Incentivo ({frasesIncentivo.length})</p>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Uma frase aleatória é enviada para <strong className="text-amber-400">{alunosPoucoUso.length} alunos</strong> com mais de 7 dias sem treinar.
                  </p>
                </div>
              </div>
              {/* Lista de frases editáveis */}
              <div className="space-y-2">
                {frasesIncentivo.map((frase, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={frase}
                      onChange={e => editarFrase(idx, e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 outline-none"
                    />
                    <button
                      onClick={() => removerFrase(idx)}
                      disabled={frasesIncentivo.length <= 1}
                      className="p-2 rounded-xl bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {/* Adicionar nova frase */}
              <div className="flex items-center gap-2">
                <input
                  placeholder="Nova frase de incentivo..."
                  value={novaFrase}
                  onChange={e => setNovaFrase(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && adicionarFrase()}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 outline-none"
                />
                <button
                  onClick={adicionarFrase}
                  disabled={!novaFrase.trim()}
                  className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={enviarIncentivoAleatorio}
                disabled={enviandoPush || alunosPoucoUso.length === 0}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 transition-all"
              >
                {enviandoPush
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enviando...</>
                  : <><Bell className="w-4 h-4" /> Disparar Incentivo Agora</>
                }
              </button>
            </section>

            {/* Campanha manual */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <p className="font-black text-base text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-400" /> Nova Campanha
              </p>
              <input
                placeholder="Título da campanha"
                value={novaCampanhaTitulo}
                onChange={e => setNovaCampanhaTitulo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 outline-none"
              />
              <textarea
                placeholder="Mensagem (aparece no push e no app)..."
                rows={3}
                value={novaCampanhaMensagem}
                onChange={e => setNovaCampanhaMensagem(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 outline-none resize-none"
              />
              <button
                onClick={enviarCampanha}
                disabled={!novaCampanhaTitulo.trim() || !novaCampanhaMensagem.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" /> Enviar para todos ({stats.totalAlunos})
              </button>
            </section>

            {/* Histórico de envios */}
            <section>
              <p className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-3">Histórico de Envios</p>
              <div className="space-y-2">
                {campanhas.map(c => (
                  <div key={c.id} className={`bg-zinc-900 border rounded-2xl p-4 ${c.tipo === 'incentivo' ? 'border-amber-500/20' : 'border-zinc-800'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {c.tipo === 'incentivo'
                          ? <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          : <Megaphone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        }
                        <p className="font-bold text-base text-white">{c.titulo}</p>
                      </div>
                      <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${c.tipo === 'incentivo' ? 'bg-amber-500/15 text-amber-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
                        {c.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-2 ml-6 italic">"{c.mensagem}"</p>
                    <div className="flex items-center gap-3 mt-2 ml-6">
                      <span className="text-xs text-zinc-600">{c.enviadoEm}</span>
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {c.destinatarios} destinatário{c.destinatarios !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  )
}
