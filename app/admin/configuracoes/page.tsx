'use client'

import { useAdminConfiguracoes } from '@/hooks/useAdminConfiguracoes'
import type { ConfigGeral, ConfigEconomia, ConfigModeracao, ConfigIntegracoes } from '@/hooks/useAdminConfiguracoes'
import {
  Settings, DollarSign, ShieldCheck, Plug,
  ToggleLeft, ToggleRight, Save, Plus, Trash2,
  MapPin, Star, Bell, Link2, Phone,
  CheckCircle2, Palette, FileText, Building2,
  Package, Tag, Users, RefreshCw,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function InputField({
  value, onChange, placeholder, type = 'text', prefix, suffix,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      {prefix && <span className="text-zinc-500 text-sm font-bold flex-shrink-0">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 outline-none"
      />
      {suffix && <span className="text-zinc-500 text-sm font-bold flex-shrink-0">{suffix}</span>}
    </div>
  )
}

function SalvarBtn({ salvando, salvoOk, secao, onSalvar }: {
  salvando: boolean
  salvoOk: string | null
  secao: string
  onSalvar: () => void
}) {
  const ok = salvoOk === secao
  return (
    <button
      onClick={onSalvar}
      disabled={salvando}
      className={`w-full py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 transition-all ${
        ok
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-yellow-400 hover:bg-yellow-300 text-black disabled:opacity-50'
      }`}
    >
      {salvando
        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</>
        : ok
          ? <><CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!</>
          : <><Save className="w-4 h-4" /> Salvar alterações</>
      }
    </button>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const {
    aba, setAba,
    geral, updateGeral,
    economia, updateEconomia,
    cidades, toggleCidade, setCidadePadrao, adicionarCidade, removerCidade,
    novaCidade, setNovaCidade,
    moderacao, updateModeracao,
    integracoes, updateIntegracoes,
    salvando, salvoOk, salvar,
    testarWebhook, testandoWebhook, testeOk,
  } = useAdminConfiguracoes()

  const ABAS = [
    { id: 'geral',       label: 'Geral',       icon: <Settings    className="w-4 h-4" /> },
    { id: 'economia',    label: 'Economia',    icon: <DollarSign  className="w-4 h-4" /> },
    { id: 'moderacao',   label: 'Moderação',   icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'integracoes', label: 'Integrações', icon: <Plug        className="w-4 h-4" /> },
  ] as const

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-2">
        <Settings className="w-5 h-5 text-yellow-400" />
        <div>
          <h1 className="text-base font-black uppercase italic text-yellow-400 leading-none">Configurações</h1>
          <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Sistema · Master Admin</p>
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

        {/* ══ ABA: GERAL ══════════════════════════════════════════════════ */}
        {aba === 'geral' && (
          <>
            {/* Identidade */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-yellow-400" /> Identidade da Plataforma
              </p>
              <Campo label="Nome da plataforma">
                <InputField value={geral.nomePlataforma} onChange={v => updateGeral('nomePlataforma', v)} placeholder="Valente Conecta" />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Razão social">
                  <InputField value={geral.razaoSocial} onChange={v => updateGeral('razaoSocial', v)} placeholder="LTDA..." />
                </Campo>
                <Campo label="CNPJ">
                  <InputField value={geral.cnpjResponsavel} onChange={v => updateGeral('cnpjResponsavel', v)} placeholder="00.000.000/0001-00" />
                </Campo>
              </div>
              <Campo label="E-mail de suporte">
                <InputField value={geral.emailSuporte} onChange={v => updateGeral('emailSuporte', v)} type="email" placeholder="contato@valente.com" />
              </Campo>
            </section>

            {/* App & Visual */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" /> App & Visual
              </p>
              <Campo label="URL do logotipo">
                <InputField value={geral.urlLogo} onChange={v => updateGeral('urlLogo', v)} placeholder="https://..." />
              </Campo>
              <Campo label="Cor primária (hex)">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={geral.corPrimaria}
                    onChange={e => updateGeral('corPrimaria', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer flex-shrink-0"
                  />
                  <input
                    value={geral.corPrimaria}
                    onChange={e => updateGeral('corPrimaria', e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 outline-none"
                    placeholder="#EAB308"
                  />
                </div>
              </Campo>
            </section>

            {/* Documentos Legais */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" /> Documentos Legais
              </p>
              <Campo label="Link — Termos de Uso">
                <InputField value={geral.linkTermosUso} onChange={v => updateGeral('linkTermosUso', v)} placeholder="https://..." />
              </Campo>
              <Campo label="Link — Política de Privacidade">
                <InputField value={geral.linkPoliticaPrivacidade} onChange={v => updateGeral('linkPoliticaPrivacidade', v)} placeholder="https://..." />
              </Campo>
            </section>

            {/* Segurança */}
            <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Segurança
              </p>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 transition-all py-2.5 rounded-xl text-sm font-black uppercase text-white">
                Alterar Senha Master
              </button>
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all py-2.5 rounded-xl text-sm font-black uppercase text-red-400">
                Limpar Cache do Servidor
              </button>
            </section>

            <SalvarBtn salvando={salvando} salvoOk={salvoOk} secao="geral" onSalvar={() => salvar('geral')} />
          </>
        )}

        {/* ══ ABA: ECONOMIA ═══════════════════════════════════════════════ */}
        {aba === 'economia' && (
          <>
            {/* Moeda Conecta */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" /> Moeda Conecta
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Valor de 1 Conecta (R$)">
                  <InputField value={economia.valorConectaReais} onChange={v => updateEconomia('valorConectaReais', v)} prefix="R$" placeholder="0.50" />
                </Campo>
                <Campo label="Limite de saldo (R$)">
                  <InputField value={economia.limiteSaldoCarteira} onChange={v => updateEconomia('limiteSaldoCarteira', v)} prefix="R$" placeholder="500" />
                </Campo>
                <Campo label="Taxa de saque (%)">
                  <InputField value={economia.taxaSaque} onChange={v => updateEconomia('taxaSaque', v)} suffix="%" placeholder="5" />
                </Campo>
              </div>
            </section>

            {/* Bônus de Indicação */}
            <section className="bg-indigo-600/10 border border-indigo-500/25 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Bônus de Indicação — Usuários & Empresas
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Bônus — Usuário indicado">
                  <InputField value={economia.bonusIndicacaoUser} onChange={v => updateEconomia('bonusIndicacaoUser', v)} suffix="✦" placeholder="1" />
                </Campo>
                <Campo label="Bônus — Empresa indicada">
                  <InputField value={economia.bonusIndicacaoEmpresa} onChange={v => updateEconomia('bonusIndicacaoEmpresa', v)} suffix="✦" placeholder="2" />
                </Campo>
              </div>
              <p className="text-xs text-zinc-600">✦ Conectas creditados ao indicador após aprovação</p>
            </section>

            {/* Bônus de Indicação — Profissionais */}
            <section className="bg-violet-600/10 border border-violet-500/25 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-violet-300 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Bônus de Indicação — Profissionais
              </p>
              <Campo label="Bônus — Profissional indicado">
                <InputField value={economia.bonusIndicacaoProfissional} onChange={v => updateEconomia('bonusIndicacaoProfissional', v)} suffix="✦" placeholder="3" />
              </Campo>
              <p className="text-xs text-zinc-600">✦ Conectas creditados ao indicador quando um profissional é aprovado na plataforma</p>
            </section>

            {/* Catálogo & Consultas */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" /> Catálogo & Consultas
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Consultas grátis / dia">
                  <InputField value={economia.consultasGratisPerDia} onChange={v => updateEconomia('consultasGratisPerDia', v)} placeholder="5" />
                </Campo>
                <Campo label="Consulta extra (Conectas)">
                  <InputField value={economia.valorConsultaExtra} onChange={v => updateEconomia('valorConsultaExtra', v)} suffix="✦" placeholder="1" />
                </Campo>
                <Campo label="Desbloquear cidade (Conectas)">
                  <InputField value={economia.valorDesbloquearCidade} onChange={v => updateEconomia('valorDesbloquearCidade', v)} suffix="✦" placeholder="30" />
                </Campo>
                <Campo label="Desbloquear contato profissional (R$)">
                  <InputField value={economia.valorDesbloquearProfissional} onChange={v => updateEconomia('valorDesbloquearProfissional', v)} prefix="R$" placeholder="5.90" type="number" />
                </Campo>
                <Campo label="Máx. fotos por produto">
                  <InputField value={economia.maxFotosPorProduto} onChange={v => updateEconomia('maxFotosPorProduto', v)} placeholder="2" />
                </Campo>
              </div>
            </section>

            <SalvarBtn salvando={salvando} salvoOk={salvoOk} secao="economia" onSalvar={() => salvar('economia')} />
          </>
        )}

        {/* ══ ABA: MODERAÇÃO ══════════════════════════════════════════════ */}
        {aba === 'moderacao' && (
          <>
            {/* Aprovações automáticas */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Aprovações Automáticas
              </p>
              {([
                { campo: 'aprovacaoAutoEmpresa' as const, label: 'Aprovar empresas automaticamente', desc: 'Sem revisão manual — ativa direto no cadastro' },
                { campo: 'aprovacaoAutoProduto' as const, label: 'Aprovar produtos automaticamente', desc: 'Sem revisão manual — visível direto no catálogo' },
                { campo: 'aprovacaoAutoFoto' as const, label: 'Aprovar fotos de catálogo automaticamente', desc: 'Fotos enviadas por profissionais ficam visíveis sem revisão' },
              ]).map(item => (
                <div key={item.campo} className="flex items-start justify-between gap-3 py-3 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                  <button onClick={() => updateModeracao(item.campo, !moderacao[item.campo])} className="flex-shrink-0">
                    {moderacao[item.campo]
                      ? <ToggleRight className="w-7 h-7 text-emerald-400" />
                      : <ToggleLeft  className="w-7 h-7 text-zinc-600" />
                    }
                  </button>
                </div>
              ))}
            </section>

            {/* Limites por empresa */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-400" /> Limites por Empresa
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Validade de oferta">
                  <InputField value={moderacao.validadeOfertaDias} onChange={v => updateModeracao('validadeOfertaDias', v)} suffix="dias" placeholder="30" />
                </Campo>
                <Campo label="Máx. produtos por empresa">
                  <InputField value={moderacao.limiteProdutosPorEmpresa} onChange={v => updateModeracao('limiteProdutosPorEmpresa', v)} placeholder="50" />
                </Campo>
                <Campo label="Máx. ofertas ativas">
                  <InputField value={moderacao.limiteOfertasAtivasPorEmpresa} onChange={v => updateModeracao('limiteOfertasAtivasPorEmpresa', v)} placeholder="5" />
                </Campo>
              </div>
            </section>

            {/* Cidades ativas */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Cidades Ativas
              </p>
              <div className="space-y-2">
                {cidades.map(c => (
                  <div key={c.id} className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3 py-2.5">
                    <button onClick={() => toggleCidade(c.id)} className="flex-shrink-0">
                      {c.ativa
                        ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                        : <ToggleLeft  className="w-5 h-5 text-zinc-600" />
                      }
                    </button>
                    <p className={`flex-1 text-sm font-semibold ${c.ativa ? 'text-white' : 'text-zinc-600'}`}>{c.nome}</p>
                    {c.padrao && (
                      <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">padrão</span>
                    )}
                    {!c.padrao && c.ativa && (
                      <button
                        onClick={() => setCidadePadrao(c.id)}
                        title="Definir como padrão"
                        className="text-zinc-600 hover:text-yellow-400 transition-all"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {!c.padrao && (
                      <button onClick={() => removerCidade(c.id)} className="text-zinc-700 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Nova cidade (ex: Queimadas-BA)"
                  value={novaCidade}
                  onChange={e => setNovaCidade(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && adicionarCidade()}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-blue-400/50 outline-none"
                />
                <button
                  onClick={adicionarCidade}
                  disabled={!novaCidade.trim()}
                  className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-600">A cidade marcada como padrão é usada no cadastro de novos usuários.</p>
            </section>

            <SalvarBtn salvando={salvando} salvoOk={salvoOk} secao="moderacao" onSalvar={() => salvar('moderacao')} />
          </>
        )}

        {/* ══ ABA: INTEGRAÇÕES ════════════════════════════════════════════ */}
        {aba === 'integracoes' && (
          <>
            {/* Comunicação */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> Comunicação
              </p>
              <Campo label="WhatsApp Business">
                <InputField value={integracoes.whatsappBusiness} onChange={v => updateIntegracoes('whatsappBusiness', v)} placeholder="(75) 99999-0000" />
              </Campo>
              <Campo label="Chave PIX master">
                <InputField value={integracoes.chavePix} onChange={v => updateIntegracoes('chavePix', v)} placeholder="CPF, CNPJ, e-mail ou telefone" />
              </Campo>
            </section>

            {/* Webhook */}
            <section className="bg-zinc-900 border border-violet-500/20 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-violet-300 uppercase tracking-widest flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Webhook / Automações
              </p>
              <Campo label="URL do webhook (POST)">
                <InputField value={integracoes.webhookUrl} onChange={v => updateIntegracoes('webhookUrl', v)} placeholder="https://..." />
              </Campo>
              <div className="flex items-center gap-3">
                <button
                  onClick={testarWebhook}
                  disabled={!integracoes.webhookUrl?.startsWith('https://') || testandoWebhook}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${testandoWebhook ? 'animate-spin' : ''}`} />
                  {testandoWebhook ? 'Enviando...' : 'Testar webhook'}
                </button>
                {testeOk === true  && <span className="text-xs font-black text-emerald-400">✓ Make recebeu!</span>}
                {testeOk === false && <span className="text-xs font-black text-red-400">✗ Falhou — verifique a URL</span>}
              </div>
              <p className="text-xs text-zinc-600">Recebe eventos de novas transações, cadastros e aprovações em tempo real.</p>
            </section>

            {/* Push notifications */}
            <section className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 space-y-4">
              <p className="text-sm font-black text-amber-300 uppercase tracking-widest flex items-center gap-2">
                <Bell className="w-4 h-4" /> Push Global
              </p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">Notificações push ativas</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Desativar bloqueia todos os pushes automáticos da plataforma</p>
                </div>
                <button onClick={() => updateIntegracoes('pushGlobal', !integracoes.pushGlobal)} className="flex-shrink-0">
                  {integracoes.pushGlobal
                    ? <ToggleRight className="w-7 h-7 text-amber-400" />
                    : <ToggleLeft  className="w-7 h-7 text-zinc-600" />
                  }
                </button>
              </div>
              <Campo label="Máx. push por usuário / dia">
                <InputField value={integracoes.maxPushPorDia} onChange={v => updateIntegracoes('maxPushPorDia', v)} suffix="por dia" placeholder="3" />
              </Campo>
            </section>

            <SalvarBtn salvando={salvando} salvoOk={salvoOk} secao="integracoes" onSalvar={() => salvar('integracoes')} />
          </>
        )}

      </main>
    </div>
  )
}