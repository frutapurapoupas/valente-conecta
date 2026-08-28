'use client';

// Caminho: C:\valente_conecta\components\BotaoInstalarApp.tsx
//
// Botao de instalacao sob demanda, sempre disponivel -- diferente do
// InstallPrompt.tsx (global, mostra automaticamente 1x e marca
// 'install_prompt_shown' no localStorage pra nunca mais incomodar,
// mesmo que a pessoa tenha fechado sem instalar). Usado em telas onde o
// usuario PEDE pra instalar (ex: /convite/[codigo] pra quem ja tem cadastro
// mas nao tem o icone no celular) -- nao pode depender daquele flag, senao
// fica sem nenhuma opcao de reinstalar.

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function BotaoInstalarApp({ className, texto = 'Instalar app na tela inicial' }: { className?: string; texto?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [jaInstalado, setJaInstalado] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setJaInstalado(true);
    }
    setPronto(true);

    const aoFicarInstalavel = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const aoInstalar = () => setJaInstalado(true);

    window.addEventListener('beforeinstallprompt', aoFicarInstalavel);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoFicarInstalavel);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  const instalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setJaInstalado(true);
        toast.success('App instalado na tela inicial!');
      }
      setDeferredPrompt(null);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      toast('No iPhone: toque no ícone de Compartilhar e depois em "Adicionar à Tela de Início".', { icon: '📱', duration: 6000 });
    } else if (/\bwv\b|instagram|fban|fbav|whatsapp/.test(ua)) {
      toast('Toque nos "⋮" (três pontinhos) no canto e escolha "Abrir no navegador" — depois toque em instalar de novo.', { duration: 6000 });
    } else {
      toast('Toque no menu do navegador e escolha "Adicionar à tela inicial" ou "Instalar app".', { duration: 6000 });
    }
  };

  if (!pronto || jaInstalado) return null;

  return (
    <button
      onClick={instalar}
      className={className || 'w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition'}
    >
      <Download className="w-4 h-4" /> {texto}
    </button>
  );
}
