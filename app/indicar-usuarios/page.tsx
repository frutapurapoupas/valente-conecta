// app/indicar-usuarios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Copy, Share2, Download, CheckCircle, Users, Trophy, Target } from 'lucide-react';

export default function IndicarUsuariosPage() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [indicados, setIndicados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(50);
  const [viralAtivado, setViralAtivado] = useState(false);

  const codigoIndicacao = user?.codigo_indicacao || user?.id?.toString() || `USER_${Date.now()}`;
  const linkIndicacao = `https://valente-conecta.clic.com.br/convite/${codigoIndicacao}`;

  useEffect(() => {
    setIsClient(true);
    carregarDados();
  }, [user?.id]);

  async function carregarDados() {
    if (!user?.id) return;
    
    setLoading(true);
    
    // Buscar configuração da meta
    const { data: configMeta } = await supabase
      .from('admin_configuracoes')
      .select('valor')
      .eq('chave', 'meta_usuarios_indicados')
      .single();
    
    if (configMeta) {
      setMeta(parseInt(configMeta.valor));
    }
    
    // Buscar quantos usuários este usuário já indicou
    const { count, error } = await supabase
      .from('usuarios_indicados_por')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id);
    
    if (!error && count !== null) {
      setIndicados(count);
    }
    
    // Verificar se já tem acesso viral ativo
    const { data: userData } = await supabase
      .from('usuarios')
      .select('is_viral_active, viral_end_at')
      .eq('id', user.id)
      .single();
    
    if (userData?.is_viral_active) {
      setViralAtivado(true);
    }
    
    // Gerar QR Code
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkIndicacao)}`;
    setQrCodeUrl(url);
    
    setLoading(false);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(linkIndicacao);
    setCopied(true);
    toast.success("Link copiado! Compartilhe com seus amigos.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = () => {
    const texto = `🎉 Use meu código ${codigoIndicacao} no Valente Conecta!\n\nLink: ${linkIndicacao}`;
    
    if (navigator.share) {
      navigator.share({ 
        title: "Valente Conecta - Indique e Ganhe", 
        text: texto, 
        url: linkIndicacao 
      }).catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
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

  const faltam = Math.max(0, meta - indicados);
  const progresso = (indicados / meta) * 100;
  const podeAtivarViral = indicados >= meta && !viralAtivado;

  // Se já tem acesso viral ativo, mostrar mensagem diferente
  if (viralAtivado) {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-white text-xl">←</button>
            <h1 className="text-white font-bold text-lg">🎉 Acesso Garantido!</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Você já tem acesso grátis!</h2>
            <p className="text-green-100 mb-4">
              Você atingiu a meta de indicar {meta} amigos e ganhou 30 DIAS GRÁTIS!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white text-xl">←</button>
          <h1 className="text-white font-bold text-lg">👥 Indicar Amigos</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Banner de progresso */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">
            {faltam === 0 ? '🎉 META ATINGIDA!' : `Faltam ${faltam} amigos`}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {faltam === 0 
              ? 'Parabéns! Seu acesso de 30 dias será ativado automaticamente!'
              : `Indique ${meta} amigos para ganhar 30 DIAS GRÁTIS!`}
          </p>
          
          {/* Barra de progresso */}
          <div className="mt-4 bg-white/20 rounded-full h-3">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progresso)}%` }}
            />
          </div>
          <p className="text-white/70 text-xs mt-2">
            {indicados} de {meta} indicações • {Math.round(progresso)}% completo
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm mb-3">ESCODEIE O QR CODE</p>
          {qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt="QR Code de indicação" 
              className="w-48 h-48 mx-auto bg-white rounded-xl p-2"
            />
          )}
          <p className="text-gray-500 text-xs mt-3">Peça para seus amigos escanearem</p>
        </div>

        {/* Código e Link */}
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-2">📋 Seu código de indicação</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={codigoIndicacao} 
                readOnly 
                className="flex-1 bg-gray-700 rounded-xl p-3 text-white text-sm font-mono"
              />
              <button 
                onClick={handleCopy}
                className="bg-blue-500 text-white px-4 py-3 rounded-xl"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-2">🔗 Seu link de indicação</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={linkIndicacao} 
                readOnly 
                className="flex-1 bg-gray-700 rounded-xl p-3 text-white text-sm truncate"
              />
              <button 
                onClick={handleCopy}
                className="bg-blue-500 text-white px-4 py-3 rounded-xl"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" /> Compartilhar
          </button>
          <button 
            onClick={handleDownloadQR}
            className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> Baixar QR
          </button>
        </div>

        {/* Lista das últimas indicações */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Últimas indicações
          </h3>
          <div className="space-y-2">
            {indicados === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhuma indicação ainda. Compartilhe seu link!
              </p>
            ) : (
              <p className="text-gray-400 text-sm text-center py-2">
                Você já indicou {indicados} {indicados === 1 ? 'amigo' : 'amigos'}!
              </p>
            )}
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Dicas para indicar mais amigos:
          </h4>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Compartilhe seu QR Code no WhatsApp e Instagram</li>
            <li>• Peça para amigos compartilharem com outros amigos</li>
            <li>• Mostre como o app funciona na prática</li>
            <li>• Cada amigo que se cadastrar conta como 1 indicação</li>
          </ul>
        </div>

        {/* Botão de ativação (quando atinge meta) */}
        {podeAtivarViral && (
          <button
            onClick={async () => {
              setLoading(true);
              const viralEndAt = new Date();
              viralEndAt.setDate(viralEndAt.getDate() + 30);
              
              const { error } = await supabase
                .from('usuarios')
                .update({
                  is_viral_active: true,
                  viral_activated_at: new Date().toISOString(),
                  viral_end_at: viralEndAt.toISOString()
                })
                .eq('id', user?.id);
              
              if (error) {
                toast.error('Erro ao ativar acesso. Tente novamente.');
              } else {
                toast.success('🎉 Parabéns! 30 dias grátis ativados!');
                setViralAtivado(true);
                setTimeout(() => router.push('/'), 2000);
              }
              setLoading(false);
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg"
          >
            🎉 ATIVAR 30 DIAS GRÁTIS! 🎉
          </button>
        )}
      </main>
    </div>
  );
}