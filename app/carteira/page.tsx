'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import {
  Wallet, Gift, Users, Building, Copy, Check, Zap, ArrowLeft, User,
  Lock, Unlock, Shield, QrCode, ArrowDownCircle, ArrowRightLeft,
  Coins, History, ChevronRight, AlertCircle
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useCarteiraPage } from '@/hooks/useCarteiraPage'

export default function CarteiraPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CarteiraContent />
    </Suspense>
  )
}

function CarteiraContent() {
  const {
    activeTab, setActiveTab,
    copied, copiedQR,
    userType, setUserType,
    tipoResgate, setTipoResgate,
    valorResgate, setValorResgate,
    pixKey, setPixKey,
    loadingResgate,
    plano,
    walletData,
    adminConfig,
    bonusHistorico,
    resgatesHistorico,
    linkIndicacao,
    qrPagamento,
    copyToClipboard,
    copyQRLink,
    handleResgate,
    mesesParaLiberar,
    saldoBloqueadoTotal,
    totalBonusDisponivel,
    totalBonusBloqueado,
    statusBonusLabel,
    statusBonusColor,
    origemIcon,
  } = useCarteiraPage()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Minha Carteira</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto">
        {/* Info do plano */}
        <div className={`rounded-xl p-3 mb-4 ${plano === 'premium' ? 'bg-purple-50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="w-5 h-5" />
            <p className="text-sm">Plano: <strong className="capitalize">{plano}</strong></p>
          </div>
        </div>

        {/* Cards de Saldo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-3xl shadow-lg shadow-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-wider opacity-80">Disponível</p>
            </div>
            <p className="text-2xl font-black">R$ {walletData.saldoDisponivel.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white p-4 rounded-3xl shadow-lg shadow-zinc-200">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-wider opacity-80">Bloqueado</p>
            </div>
            <p className="text-2xl font-black">R$ {saldoBloqueadoTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { id: 'saldo',    label: 'Saldo',    icon: Wallet,          color: 'from-green-500 to-emerald-600' },
            { id: 'indicar',  label: 'Indicar',  icon: Gift,            color: 'from-yellow-400 to-amber-500' },
            { id: 'bonus',    label: 'Bônus',    icon: Coins,           color: 'from-blue-500 to-indigo-600' },
            { id: 'resgatar', label: 'Resgatar', icon: ArrowDownCircle, color: 'from-purple-500 to-pink-600' },
            { id: 'pagamento',label: 'Pagar/Rec', icon: ArrowRightLeft,  color: 'from-indigo-500 to-cyan-600' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── SALDO ── */}
        {activeTab === 'saldo' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-black uppercase italic mb-2">Resumo</h3>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Próxima liberação (indicações)</span>
              <span className="font-black text-green-600">R$ {adminConfig.pagamentoMensalMax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Previsão de quitação</span>
              <span className="font-bold text-gray-700">{mesesParaLiberar} mês(es)</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              * Bônus de indicação: liberados em parcelas de até R$ {adminConfig.pagamentoMensalMax}/mês conforme configuração do Admin Master.
            </p>
            {walletData.bonusOutrosBloqueado > 0 && (
              <p className="text-xs text-blue-400 leading-relaxed italic">
                * Outros bônus (R$ {walletData.bonusOutrosBloqueado.toFixed(2)}): liberados integralmente conforme regras específicas de cada promoção.
              </p>
            )}
          </div>
        )}

        {/* ── INDICAR ── */}
        {activeTab === 'indicar' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 text-center tracking-widest">Tipo de Indicação</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'amigo', label: 'Amigo', icon: User, color: 'text-blue-500', bonus: adminConfig.bonusAmigo },
                  { id: 'empresa', label: 'Empresa', icon: Building, color: 'text-purple-500', bonus: adminConfig.bonusEmpresa },
                  { id: 'profissional', label: 'Pro', icon: Users, color: 'text-green-500', bonus: adminConfig.bonusProfissional },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setUserType(type.id as any)}
                    className={`p-3 rounded-2xl text-center transition-all border-2 ${
                      userType === type.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-50 bg-gray-50'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 mx-auto mb-1 ${type.color}`} />
                    <p className="text-[10px] font-black uppercase italic">{type.label}</p>
                    <p className="text-[10px] font-bold text-green-600">R${type.bonus}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-3xl border-4 border-gray-50 shadow-inner">
                  <QRCodeCanvas value={linkIndicacao} size={200} level="H"
                    imageSettings={{ src: '/logo.png', height: 36, width: 36, excavate: true }} />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Escaneie para se cadastrar</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-1 w-1 bg-yellow-400 rounded-full animate-ping" />
                <p className="text-xs font-bold text-zinc-600">Link de Indicação Ativo</p>
              </div>
              <button onClick={copyToClipboard}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-2xl font-black uppercase italic text-sm shadow-xl shadow-yellow-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                {copied ? <><Check className="w-5 h-5" /> Copiado!</> : <><Copy className="w-5 h-5" /> Copiar Link</>}
              </button>
            </div>
          </div>
        )}

        {/* ── BÔNUS ── */}
        {activeTab === 'bonus' && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <p className="text-[10px] uppercase font-black text-green-600 mb-1">Disponível</p>
                <p className="text-xl font-black text-green-700">R$ {totalBonusDisponivel.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Bloqueado</p>
                <p className="text-xl font-black text-zinc-700">R$ {totalBonusBloqueado.toFixed(2)}</p>
              </div>
            </div>

            {/* Histórico detalhado */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-gray-50">
                <History className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Histórico de Bônus</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {bonusHistorico.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{origemIcon[item.origem]}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.descricao}</p>
                        <p className="text-xs text-gray-400">{item.dataCredito}
                          {item.previsaoLiberacao && <span className="ml-2 text-yellow-600">→ libera {item.previsaoLiberacao}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                      <span className="font-black text-sm text-gray-900">+R$ {item.valor.toFixed(2)}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${statusBonusColor[item.status]}`}>
                        {statusBonusLabel[item.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESGATAR ── */}
        {activeTab === 'resgatar' && (
          <div className="space-y-5">
            {/* Tipo de resgate */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Como deseja usar?</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pix', label: 'PIX', icon: '⚡', desc: 'Sacar para conta' },
                  { id: 'app',   label: 'No App', icon: '🛒', desc: 'Pagar no PDV' },
                  { id: 'moeda', label: 'Moeda', icon: '🪙', desc: 'Moeda Conecta' },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTipoResgate(t.id as any)}
                    className={`p-3 rounded-2xl text-center border-2 transition-all ${
                      tipoResgate === t.id ? 'border-purple-400 bg-purple-50' : 'border-gray-50 bg-gray-50'
                    }`}>
                    <span className="text-2xl">{t.icon}</span>
                    <p className="text-[10px] font-black uppercase italic mt-1">{t.label}</p>
                    <p className="text-[9px] text-gray-400">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400">Valor (R$)</label>
                <input
                  type="number"
                  value={valorResgate}
                  onChange={(e) => setValorResgate(e.target.value)}
                  placeholder="0,00"
                  className="w-full mt-1 px-4 py-3 border-2 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-400 mt-1">Disponível: R$ {walletData.saldoDisponivel.toFixed(2)}</p>
              </div>

              {tipoResgate === 'pix' && (
                <div>
                  <label className="text-xs font-black uppercase text-gray-400">Chave PIX</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, e-mail ou telefone"
                    className="w-full mt-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              )}

              {tipoResgate === 'moeda' && (
                <div className="bg-indigo-50 p-3 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Moeda Conecta é usada para transações entre usuários, empresas e profissionais dentro da plataforma. A compensação é realizada mensalmente pelo Admin Master.</span>
                </div>
              )}

              <button
                onClick={handleResgate}
                disabled={loadingResgate || !valorResgate}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-black uppercase text-sm shadow-lg shadow-purple-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingResgate
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Zap className="w-5 h-5" /> Confirmar Resgate</>
                }
              </button>
            </div>

            {/* Histórico */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-gray-50">
                <History className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Histórico de Resgates</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {resgatesHistorico.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.destino}</p>
                      <p className="text-xs text-gray-400">{item.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900">-R$ {item.valor.toFixed(2)}</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGAR / RECEBER ── */}
        {activeTab === 'pagamento' && (
          <div className="space-y-5">
            {/* QR de pagamento */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black uppercase text-sm text-gray-700">Meu QR de Pagamento</h3>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Ativo</span>
              </div>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-3xl border-4 border-indigo-50 shadow-inner">
                  <QRCodeCanvas
                    value={qrPagamento || 'conecta://pagamento'}
                    size={210}
                    level="H"
                    imageSettings={{ src: '/logo.png', height: 38, width: 38, excavate: true }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Mostre este QR para qualquer lojista, profissional ou usuário da plataforma para <strong>pagar, receber ou transferir</strong> Moeda Conecta.
              </p>
              <button
                onClick={copyQRLink}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                {copiedQR ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Compartilhar QR</>}
              </button>
            </div>

            {/* O que você pode fazer */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Como usar</h3>
              <div className="space-y-3">
                {[
                  { icon: '🛒', label: 'Pagar em loja', desc: 'Mostre seu QR no caixa do lojista parceiro' },
                  { icon: '💸', label: 'Receber saldo', desc: 'Peça para o outro usuário escanear seu QR' },
                  { icon: '🔄', label: 'Transferir para alguém', desc: 'Escaneie o QR do destinatário para enviar' },
                ].map((a) => (
                  <div key={a.label} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{a.label}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 text-xs text-yellow-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>As transações em Moeda Conecta são registradas e compensadas mensalmente pelo Admin Master da plataforma.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
