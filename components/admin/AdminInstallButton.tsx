"use client";

// Caminho: C:\valente_conecta\components\admin\AdminInstallButton.tsx
//
// Botao pra instalar o app do Admin Master na tela inicial do celular/
// tablet, com icone proprio (vermelho, escudo) e abrindo direto em
// /admin-master — usa o manifest-admin.json (linkado condicionalmente em
// app/layout.tsx quando a rota comeca com /admin-master).

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function AdminInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    if (isIOS) {
      alert('No iPhone/iPad: toque em "Compartilhar" e depois em "Adicionar à Tela de Início".');
    } else {
      alert('Seu navegador ainda não ofereceu a instalação automática. Toque no menu (⋮) do navegador e procure "Instalar app" ou "Adicionar à tela inicial".');
    }
  };

  return (
    <button
      onClick={handleInstall}
      className="w-full mb-6 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
      title="Instalar o ícone do Admin Master na tela inicial"
    >
      <Smartphone className="w-4 h-4" />
      Instalar ícone do Admin
      <Download className="w-4 h-4" />
    </button>
  );
}
