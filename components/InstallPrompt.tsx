// components/InstallPrompt.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Priorizar exibição no primeiro acesso vindo por convite/cadastro
    const onboardingPosCadastro = localStorage.getItem('onboarding_pos_cadastro');
    if (onboardingPosCadastro === '1') {
      setTimeout(() => setShow(true), 800);
    }

    // Verificar se já mostrou o prompt antes
    const alreadyShown = localStorage.getItem('install_prompt_shown');
    if (alreadyShown && onboardingPosCadastro !== '1') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShow(false);
      localStorage.setItem('install_prompt_shown', 'true');
      localStorage.removeItem('onboarding_pos_cadastro');
      localStorage.removeItem('convite_origem');
      localStorage.removeItem('convite_timestamp');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShow(false);
        localStorage.setItem('install_prompt_shown', 'true');
        localStorage.removeItem('onboarding_pos_cadastro');
        localStorage.removeItem('convite_origem');
        localStorage.removeItem('convite_timestamp');
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('📱 No iPhone: Toque no ícone "Compartilhar" e depois em "Adicionar à Tela de Início"');
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('install_prompt_shown', 'true');
    localStorage.removeItem('onboarding_pos_cadastro');
  };

  if (isInstalled) return null;
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-2xl border border-green-400/30 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base">Instale o App!</h3>
              <p className="text-green-100 text-xs mt-0.5">
                Tenha acesso rápido ao Valente Conecta direto da tela inicial
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="bg-yellow-500 text-black px-4 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Instalar Agora
                </button>
                <button
                  onClick={handleClose}
                  className="bg-white/20 text-white px-4 py-1.5 rounded-xl text-sm font-medium"
                >
                  Mais Tarde
                </button>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

