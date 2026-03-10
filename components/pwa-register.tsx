"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface ServiceWorkerRegistration {
    waiting?: ServiceWorker | null;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [abrindoPrompt, setAbrindoPrompt] = useState(false);
  const [fechado, setFechado] = useState(false);
  const [atualizacaoDisponivel, setAtualizacaoDisponivel] = useState(false);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  const ios = useMemo(() => isIOSDevice(), []);

  useEffect(() => {
    if (isStandaloneMode()) {
      setInstalado(true);
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstalado(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;

    async function registrarSW() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (!mounted) return;

        setSwRegistration(registration);

        if (registration.waiting) {
          setAtualizacaoDisponivel(true);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setAtualizacaoDisponivel(true);
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Erro ao registrar service worker:", error);
      }
    }

    void registrarSW();

    return () => {
      mounted = false;
    };
  }, []);

  async function instalarAgora() {
    if (!deferredPrompt) return;

    try {
      setAbrindoPrompt(true);
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Erro ao abrir instalação do app:", error);
    } finally {
      setAbrindoPrompt(false);
    }
  }

  function atualizarAgora() {
    if (!swRegistration?.waiting) {
      window.location.reload();
      return;
    }

    swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  const mostrarBotaoAndroid = !!deferredPrompt;
  const mostrarGuiaIOS = ios && !deferredPrompt;
  const mostrarCardInstalacao =
    !instalado && !fechado && (mostrarBotaoAndroid || mostrarGuiaIOS);

  return (
    <>
      {atualizacaoDisponivel ? (
        <div className="fixed left-4 right-4 top-4 z-[100] mx-auto max-w-xl rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Nova versão disponível
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Toque em atualizar para carregar a versão mais nova do app.
              </p>
            </div>

            <button
              type="button"
              onClick={atualizarAgora}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Atualizar agora
            </button>
          </div>
        </div>
      ) : null}

      {mostrarCardInstalacao ? (
        <section className="mx-auto mt-4 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-2xl text-white shadow-sm">
                  📲
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Colocar o Valente Conecta na tela do celular
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Assim você abre o app mais rápido, sem precisar procurar no
                  navegador.
                </p>

                {mostrarBotaoAndroid ? (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Toque no botão abaixo.
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      O celular vai pedir uma confirmação rápida para criar o
                      ícone na sua tela inicial.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={instalarAgora}
                        disabled={abrindoPrompt}
                        className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                      >
                        {abrindoPrompt
                          ? "Abrindo..."
                          : "Instalar no meu celular"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFechado(true)}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Agora não
                      </button>
                    </div>
                  </div>
                ) : null}

                {mostrarGuiaIOS ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      No iPhone é bem simples:
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        <strong>1.</strong> Toque no botão{" "}
                        <strong>Compartilhar</strong> do Safari.
                      </p>
                      <p>
                        <strong>2.</strong> Depois toque em{" "}
                        <strong>Adicionar à Tela de Início</strong>.
                      </p>
                      <p>
                        <strong>3.</strong> Confirme para criar o ícone do app.
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setFechado(true)}
                        className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
                      >
                        Entendi
                      </button>

                      <button
                        type="button"
                        onClick={() => setFechado(true)}
                        className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                      >
                        Agora não
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="min-w-[220px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Vantagens
                </p>

                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    Abre mais rápido no celular
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    Fica com ícone igual aplicativo
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    Acesso fácil às indicações e ofertas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}