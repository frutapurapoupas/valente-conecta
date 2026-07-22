"use client";

export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Share2, Download, CheckCircle, Wallet, BellRing, Building2, Briefcase, Users, Info, X } from "lucide-react";
import { getStableReferralCode } from '@/utils/referral';
import { calculateReferralWallet, type ReferralConfig } from '@/utils/referralBonus';
import { supabase } from '@/lib/supabase';

export default function QRCodePage() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ total: 0, ativos: 0, pendentes: 0 });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [wallet, setWallet] = useState({ disponivel: 0, bloqueado: 0, pago: 0, totalLiberado: 0, lotes: { usuarios_gerais: 0, empresas_lojas: 0, profissionais_liberais: 0 } });
  const [pixKey, setPixKey] = useState("");
  const [solicitandoPix, setSolicitandoPix] = useState(false);
  const [indicadosUsuarios, setIndicadosUsuarios] = useState<any[]>([]);
  const [indicadosEmpresas, setIndicadosEmpresas] = useState<any[]>([]);
  const [indicadosProfissionais, setIndicadosProfissionais] = useState<any[]>([]);
  const [showBonusInfo, setShowBonusInfo] = useState(false);

  // PEGAR A URL BASE DINAMICAMENTE (funciona em qualquer ambiente)
  useEffect(() => {
    setIsClient(true);
    // Obtém a URL base do navegador (localhost ou domínio de produção)
    setBaseUrl(window.location.origin);
  }, []);

  const codigoIndicacao = getStableReferralCode(user, isAdmin);
  const linkIndicacao = `${baseUrl}/convite/${codigoIndicacao}`;

  useEffect(() => {
    if (!baseUrl) return;

    localStorage.setItem('meu_codigo_indicacao', codigoIndicacao);
    
    // Gerar QR Code usando API online (não precisa de biblioteca extra)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(linkIndicacao)}`;
    setQrCodeUrl(url);

    // Detectar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    async function carregarIndicacoes() {
      if (!user?.id) return;

      const [configResp, payoutResp, usuariosResp, estabelecimentosResp] = await Promise.all([
        fetch('/api/referrals/config').then((res) => res.json()).catch(() => ({ success: false })),
        fetch(`/api/referrals/payout-requests?userId=${user.id}`).then((res) => res.json()).catch(() => ({ success: false, data: [] })),
        supabase.from('usuarios').select('id, nome, whatsapp, created_at, trial_end_at').eq('convidado_por_id', user.id).order('created_at', { ascending: false }),
        supabase.from('indicacoes_estabelecimentos').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false })
      ]);

      const cfg = configResp?.success ? configResp.data : null;
      if (cfg) setConfig(cfg);

      const usuarios = Array.isArray(usuariosResp.data) ? usuariosResp.data : [];
      const estabelecimentos = Array.isArray(estabelecimentosResp.data) ? estabelecimentosResp.data : [];
      const empresas = estabelecimentos.filter((item: any) => item.tipo === 'comercio');
      const profissionais = estabelecimentos.filter((item: any) => item.tipo === 'servico');
      const payoutRequests = Array.isArray(payoutResp?.data) ? payoutResp.data : [];

      setIndicadosUsuarios(usuarios);
      setIndicadosEmpresas(empresas);
      setIndicadosProfissionais(profissionais);

      const usuariosValidados = usuarios.filter((item: any) => item.trial_end_at && new Date(item.trial_end_at) > new Date());

      setEstatisticas({
        total: usuarios.length + empresas.length + profissionais.length,
        ativos: usuariosValidados.length + empresas.filter((item: any) => item.status === 'aprovado' || item.status === 'pago').length + profissionais.filter((item: any) => item.status === 'aprovado' || item.status === 'pago').length,
        pendentes: empresas.filter((item: any) => item.status === 'pendente').length + profissionais.filter((item: any) => item.status === 'pendente').length
      });

      const walletCalc = calculateReferralWallet(
        cfg || { rules: [] },
        {
          usuariosGerais: usuariosValidados.length,
          empresasLojas: empresas.filter((item: any) => item.status === 'aprovado' || item.status === 'pago').length,
          profissionaisLiberais: profissionais.filter((item: any) => item.status === 'aprovado' || item.status === 'pago').length
        },
        payoutRequests
      );
      setWallet(walletCalc);

      const ultimaNotificacao = Number(localStorage.getItem(`referral_bonus_notified_${user.id}`) || 0);
      if (walletCalc.disponivel > ultimaNotificacao) {
        const mensagem = `Seu bônus por indicação liberou R$ ${walletCalc.disponivel.toFixed(2)}. Informe sua chave PIX para recebimento.`;
        toast.success(mensagem, { duration: 7000 });
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Bônus liberado no Valente Conecta', { body: mensagem });
        }
        localStorage.setItem(`referral_bonus_notified_${user.id}`, String(walletCalc.disponivel));
      }
    }

    carregarIndicacoes();

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isAdmin, linkIndicacao, baseUrl, user?.id]);

  const solicitarPix = async () => {
    if (!user?.id) return;
    if (!pixKey.trim()) {
      toast.error('Informe uma chave PIX para recebimento');
      return;
    }
    if (wallet.disponivel <= 0) {
      toast.error('Você ainda não tem saldo liberado para solicitar');
      return;
    }

    setSolicitandoPix(true);
    try {
      const response = await fetch('/api/referrals/payout-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.nome || user.name || 'Usuário',
          userWhatsapp: user.whatsapp || '',
          pixKey,
          amount: wallet.disponivel
        })
      });
      const result = await response.json();
      if (!result?.success) {
        throw new Error(result?.error || 'Falha ao registrar solicitação PIX');
      }
      toast.success('Solicitação PIX enviada. O valor ficou bloqueado até o pagamento.');
      setWallet((prev) => ({ ...prev, bloqueado: prev.bloqueado + prev.disponivel, disponivel: 0 }));
      setPixKey('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar PIX');
    } finally {
      setSolicitandoPix(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(linkIndicacao);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigoIndicacao);
    setCopiedCode(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleShare = () => {
    const shareTemplate = config?.content?.shareTemplate || 'Use meu código {codigo}. Bônus por lotes validados no Valente Conecta. Link: {link}';
    const texto = isAdmin
      ? `Convite especial do Admin Master!\nCódigo: ${codigoIndicacao}\nLink: ${linkIndicacao}`
      : shareTemplate.replace('{codigo}', codigoIndicacao).replace('{link}', linkIndicacao);

    if (navigator.share) {
      navigator.share({ title: "Valente Conecta", text: texto, url: linkIndicacao });
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `convite_${codigoIndicacao}.png`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("QR Code baixado!");
      });
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success("✅ App instalado na tela inicial!");
      }
      setDeferredPrompt(null);
    } else {
      toast.success("📱 Toque em 'Adicionar à Tela Inicial' no menu do navegador", { duration: 5000 });
    }
  };

  // Loading durante hidratação
  if (!isClient || !baseUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <h1 className="text-white font-bold text-lg">
          {isAdmin ? "Convite Exclusivo Admin" : "Indique e Ganhe"}
        </h1>
      </header>

      <div className="p-6 text-center">
        <div className="bg-gradient-to-br from-yellow-300 to-amber-500 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-8 border-yellow-200 text-5xl font-bold text-black mx-auto">
          {isAdmin ? "👑" : "R$"}
        </div>
        <h2 className="text-2xl font-bold text-white mt-6">
          {isAdmin ? "Convite Especial do Admin Master" : (config?.content?.publicHeadline || "Ganhe dinheiro indicando!")}
        </h2>
        <p className="text-gray-400 mt-2">
          {isAdmin
            ? "Compartilhe este código para novos usuários se cadastrarem"
            : (config?.content?.publicSubtitle || "Receba bônus por lotes de indicações validadas.")}
        </p>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-gray-600 font-bold mb-3">QR CODE EXCLUSIVO</p>
          {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />}
          <p className="text-gray-500 text-sm mt-3">Compartilhe o código abaixo</p>
        </div>
      </div>

      <div className="px-6 space-y-3">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <p className="text-white font-bold">Carteira de Indicações</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-gray-400 text-xs">Saldo disponível</p>
              <p className="text-green-400 font-bold text-xl">R$ {wallet.disponivel.toFixed(2)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-gray-400 text-xs">Saldo bloqueado</p>
              <p className="text-yellow-400 font-bold text-xl">R$ {wallet.bloqueado.toFixed(2)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Users className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <p className="text-white font-semibold">{wallet.lotes.usuarios_gerais}</p>
              <p className="text-gray-400">Lotes usuários</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Building2 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <p className="text-white font-semibold">{wallet.lotes.empresas_lojas}</p>
              <p className="text-gray-400">Lotes lojas</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <Briefcase className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <p className="text-white font-semibold">{wallet.lotes.profissionais_liberais}</p>
              <p className="text-gray-400">Lotes profissionais</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <BellRing className="w-4 h-4 text-yellow-400" />
              Quando um lote fecha, o sistema libera o valor e pede sua chave PIX.
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Sua chave PIX para receber"
                className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none"
              />
              <button
                onClick={solicitarPix}
                disabled={solicitandoPix || wallet.disponivel <= 0}
                className="bg-green-500 text-black px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {solicitandoPix ? 'Enviando...' : 'Solicitar'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">Seu código de indicação</p>
          <div className="flex gap-2">
            <input type="text" value={codigoIndicacao} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm font-mono" />
            <button onClick={handleCopyCode} className="bg-blue-500 text-white px-4 py-3 rounded-xl">{copiedCode ? "✅" : "📋"}</button>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">Seu link de indicação</p>
          <div className="flex gap-2">
            <input type="text" value={linkIndicacao} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm" />
            <button onClick={handleCopy} className="bg-blue-500 text-white px-4 py-3 rounded-xl">{copied ? "✅" : "📋"}</button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleShare} className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          <button onClick={handleDownload} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Baixar QR
          </button>
        </div>

        <button onClick={handleInstall} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Instalar App na Tela Inicial
        </button>

        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-4 mt-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-white">{estatisticas.total}</p><p className="text-xs text-gray-400">Indicados</p></div>
            <div><p className="text-2xl font-bold text-green-400">{estatisticas.ativos}</p><p className="text-xs text-gray-400">Validados</p></div>
            <div><p className="text-2xl font-bold text-yellow-400">{estatisticas.pendentes}</p><p className="text-xs text-gray-400">Pendentes</p></div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-white font-bold mb-3">WhatsApps indicados e validados</p>
          <div className="space-y-2 max-h-56 overflow-auto">
            {indicadosUsuarios.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum usuário indicado ainda.</p>
            ) : (
              indicadosUsuarios.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="text-white font-medium">{item.nome}</p>
                    <p className="text-gray-400 text-xs">{item.whatsapp || 'WhatsApp não informado'}</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.trial_end_at && new Date(item.trial_end_at) > new Date() ? 'text-green-400' : 'text-yellow-400'}`}>
                    {item.trial_end_at && new Date(item.trial_end_at) > new Date() ? 'Validado' : 'Pendente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-white font-bold mb-3">Lojas e profissionais indicados</p>
          <div className="space-y-2 max-h-64 overflow-auto">
            {[...indicadosEmpresas, ...indicadosProfissionais].length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma empresa, loja ou profissional indicado ainda.</p>
            ) : (
              [...indicadosEmpresas, ...indicadosProfissionais].map((item: any) => (
                <div key={item.id} className="bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="text-white font-medium">{item.nome_estabelecimento || item.nome}</p>
                    <p className="text-gray-400 text-xs">{item.telefone || 'Telefone não informado'} • {item.tipo === 'comercio' ? 'Loja/Empresa' : 'Profissional liberal'}</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.status === 'aprovado' || item.status === 'pago' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {item.status === 'aprovado' || item.status === 'pago' ? 'Validado' : 'Pendente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 mb-8">
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Como instalar o app?
          </h3>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li>1. Escaneie o QR Code acima</li>
            <li>2. Abra o link no navegador</li>
            <li>3. Toque em "Instalar App na Tela Inicial"</li>
            <li>4. O app será instalado na tela inicial</li>
          </ol>
        </div>
      </div>

      <button
        onClick={() => setShowBonusInfo(true)}
        className="fixed bottom-5 right-5 z-40 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2"
      >
        <Info className="w-4 h-4" /> Bônus
      </button>

      {showBonusInfo && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl p-5 border-t border-white/10 max-h-[75vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-lg">{config?.content?.explanationTitle || 'Como funcionam as bonificações'}</h3>
              <button onClick={() => setShowBonusInfo(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {config?.content?.explanationText || 'Cada bônus é liberado por lote validado.'}
            </p>
            <div className="space-y-2 text-sm">
              {(config?.rules || []).map((rule: any) => (
                <div key={rule.id} className="bg-white/5 rounded-xl p-3 text-gray-200">
                  <p className="font-semibold">{rule.nome}</p>
                  <p className="text-gray-400 text-xs">{rule.meta} validações por lote • R$ {Number(rule.bonus || 0).toFixed(2)} por lote</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
