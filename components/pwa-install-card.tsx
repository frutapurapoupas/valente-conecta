"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
          true);

    setIsInstalled(isStandalone);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        setRegistration(reg);

        if (reg.waiting) {
          setHasUpdate(true);
        }

        reg.addEventListener("updatefound", () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setHasUpdate(true);
            }
          });
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  async function handleUpdate() {
    if (!registration?.waiting) return;

    setUpdating(true);
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  if (isInstalled && !hasUpdate) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-4 text-white shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-400">
            {hasUpdate ? "Atualização disponível" : "Instalar aplicativo"}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {hasUpdate
              ? "Existe uma nova versão do Valente Conecta pronta para ser aplicada."
              : "Adicione o Valente Conecta à tela inicial para usar como aplicativo."}
          </p>
        </div>

        {hasUpdate ? (
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {updating ? "Atualizando..." : "Atualizar agora"}
          </button>
        ) : deferredPrompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950"
          >
            Instalar app
          </button>
        ) : null}
      </div>
    </div>
  );
}