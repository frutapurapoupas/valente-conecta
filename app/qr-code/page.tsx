"use client";

export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Share2, Download, CheckCircle, Wallet, BellRing, Building2, Briefcase, Users, Info, X, Coins } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type { Usuario } from '@/lib/supabase';
import { CadastroPopup } from '@/components/CadastroPopup';

interface BonusRule {
  categoria: string;
  nome: string;
  bonus: number;
  meta: number;
  ativo: boolean;
  descricao?: string;
}

export default function QRCodePage() {
  const router = useRouter();
  // getCurrentUser le' a sessao real (localStorage, gravada por
  // lib/auth.ts::cadastroSimples) — useApp().user do AppContext nunca e'
  // preenchido hoje (nao ha' login real ainda), o que deixava essa pagina
  // sempre tratando qualquer visitante como anonimo.
  const [user, setUser] = useState<Usuario | null>(null);
  useEffect(() => { setUser(getCurrentUser()); }, []);
  const isAdmin = user?.role === 'admin';
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ total: 0, ativos: 0, pendentes: 0 });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [bonusRules, setBonusRules] = useState<BonusRule[]>([]);
  const [contagens, setContagens] = useState({ usuarios_gerais: 0, empresas_lojas: 0, profissionais_liberais: 0 });
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

  // Codigo real gravado no cadastro (cadastroSimples), nao mais recalculado —
  // e' o mesmo valor que app/convite/[codigo]/page.tsx resolve de volta pro
  // nome do indicador.
  const codigoIndicacao = user?.codigo_indicacao || "";
  const linkIndicacao = baseUrl && codigoIndicacao ? `${baseUrl}/convite/${codigoIndicacao}` : "";

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

      const cidade = (user.cidade_base || '').trim().toUpperCase();

      const [configResp, usuariosResp, estabelecimentosResp] = await Promise.all([
        cidade
          ? fetch(`/api/referrals/config-cidade?cidade=${encodeURIComponent(cidade)}`).then((res) => res.json()).catch(() => ({ success: false }))
          : Promise.resolve({ success: false }),
        supabase.from('usuarios').select('id, nome, whatsapp, created_at, trial_end_at').eq('convidado_por_id', user.id).order('created_at', { ascending: false }),
        supabase.from('indicacoes_estabelecimentos').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false })
      ]);

      const rules: BonusRule[] = configResp?.success ? configResp.data.rules : [];
      setBonusRules(rules);

      const usuarios = Array.isArray(usuariosResp.data) ? usuariosResp.data : [];
      const estabelecimentos = Array.isArray(estabelecimentosResp.data) ? estabelecimentosResp.data : [];
      const empresas = estabelecimentos.filter((item: any) => item.tipo === 'comercio');
      const profissionais = estabelecimentos.filter((item: any) => item.tipo === 'servico');

      setIndicadosUsuarios(usuarios);
      setIndicadosEmpresas(empresas);
      setIndicadosProfissionais(profissionais);

      const usuariosValidados = usuarios.filter((item: any) => item.trial_end_at && new Date(item.trial_end_at) > new Date());
      const empresasValidadas = empresas.filter((item: any) => item.status === 'aprovado' || item.status === 'pago');
      const profissionaisValidados = profissionais.filter((item: any) => item.status === 'aprovado' || item.status === 'pago');

      setContagens({
        usuarios_gerais: usuariosValidados.length,
        empresas_lojas: empresasValidadas.length,
        profissionais_liberais: profissionaisValidados.length,
      });

      setEstatisticas({
        total: usuarios.length + empresas.length + profissionais.length,
        ativos: usuariosValidados.length + empresasValidadas.length + profissionaisValidados.length,
        pendentes: empresas.filter((item: any) => item.status === 'pendente').length + profissionais.filter((item: any) => item.status === 'pendente').length
      });

      // Credita automaticamente em Moeda Conecta qualquer lote batido e
      // ainda nao pago — idempotente, seguro de chamar toda vez que a tela
      // carrega (ver referral_processar_bonus_v1).
      try {
        const bonusResp = await fetch('/api/referrals/processar-bonus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: user.id }),
        }).then((res) => res.json());

        if (bonusResp?.success && Array.isArray(bonusResp.data) && bonusResp.data.length > 0) {
          const totalNovo = bonusResp.data.reduce((soma: number, item: any) => soma + Number(item.valor || 0), 0);
          const mensagem = `Você bateu a meta e ganhou ${totalNovo.toFixed(2)} Moeda Conecta! Já está disponível na sua carteira, para usar em qualquer estabelecimento da sua cidade base.`;
          toast.success(mensagem, { duration: 8000 });
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Bônus de indicação liberado', { body: mensagem });
          }
        }
      } catch {
        // silencioso: nao credita duas vezes, so' tenta de novo no proximo carregamento
      }
    }

    carregarIndicacoes();

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isAdmin, linkIndicacao, baseUrl, user?.id, user?.cidade_base]);

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
    const texto = isAdmin
      ? `Convite especial do Admin Master!\nCódigo: ${codigoIndicacao}\nLink: ${linkIndicacao}`
      : `Use meu código ${codigoIndicacao} e venha pro Valente Conecta! Link: ${linkIndicacao}`;

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

  // Sem cadastro ainda: nao ha' codigo_indicacao pra gerar QR/link nenhum —
  // pede o cadastro minimo (nome+whatsapp) em vez de mostrar um painel vazio.
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h2 className="text-white text-xl font-bold mb-2">Complete seu cadastro</h2>
          <p className="text-gray-400 text-sm">Para gerar seu QR Code exclusivo de indicação, precisamos só do seu nome e WhatsApp.</p>
        </div>
        <CadastroPopup forceShow onSuccess={() => setUser(getCurrentUser())} />
      </div>
    );
  }

  const ICONES: Record<string, any> = { usuarios_gerais: Users, empresas_lojas: Building2, profissionais_liberais: Briefcase };

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
          {isAdmin ? "👑" : <Coins className="w-14 h-14" />}
        </div>
        <h2 className="text-2xl font-bold text-white mt-6">
          {isAdmin ? "Convite Especial do Admin Master" : "Indique e ganhe Moeda Conecta!"}
        </h2>
        <p className="text-gray-400 mt-2">
          {isAdmin
            ? "Compartilhe este código para novos usuários se cadastrarem"
            : "Ao completar cada lote de indicações validadas, o bônus cai direto na sua carteira."}
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-400" />
              <p className="text-white font-bold">Bônus por lote (Moeda Conecta)</p>
            </div>
            <a href="/carteira" className="text-xs text-blue-300 font-medium">Ver carteira</a>
          </div>

          <div className="space-y-2">
            {bonusRules.filter((r) => r.ativo).length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum bônus ativo pra sua cidade no momento.</p>
            ) : (
              bonusRules.filter((r) => r.ativo).map((r) => {
                const Icon = ICONES[r.categoria] || Users;
                const contagem = (contagens as any)[r.categoria] || 0;
                const lotes = r.meta > 0 ? Math.floor(contagem / r.meta) : 0;
                const restoAtual = r.meta > 0 ? contagem % r.meta : 0;
                const progresso = r.meta > 0 ? Math.min(100, (restoAtual / r.meta) * 100) : 0;
                return (
                  <div key={r.categoria} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white font-medium flex items-center gap-1.5"><Icon className="w-4 h-4 text-cyan-400" /> {r.nome}</span>
                      <span className="text-green-400 font-semibold">{lotes} lote{lotes === 1 ? '' : 's'} pago{lotes === 1 ? '' : 's'}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                      <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${progresso}%` }} />
                    </div>
                    <p className="text-gray-400 text-xs">{restoAtual}/{r.meta} pro próximo lote · {r.bonus.toFixed(2)} MC por lote</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 rounded-xl p-3 mt-3">
            <BellRing className="w-4 h-4 text-yellow-400 shrink-0" />
            O bônus é creditado automaticamente assim que o lote fecha — sem precisar solicitar nada.
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
              <h3 className="text-white font-bold text-lg">Como funcionam as bonificações</h3>
              <button onClick={() => setShowBonusInfo(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Cada bônus é liberado por lote validado (usuários gerais, empresas/lojas e profissionais liberais) e creditado automaticamente em Moeda Conecta — utilizável em qualquer estabelecimento da sua cidade base.
            </p>
            <div className="space-y-2 text-sm">
              {bonusRules.map((rule) => (
                <div key={rule.categoria} className="bg-white/5 rounded-xl p-3 text-gray-200">
                  <p className="font-semibold">{rule.nome}</p>
                  <p className="text-gray-400 text-xs">{rule.meta} validações por lote • {Number(rule.bonus || 0).toFixed(2)} Moeda Conecta por lote {rule.ativo ? '' : '(inativo nessa cidade)'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
