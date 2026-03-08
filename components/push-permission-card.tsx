"use client";

import { useEffect, useState } from "react";

type PushSubscriptionJSONShape = {
  endpoint: string;
  expirationTime: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export default function PushPermissionCard() {
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState("");
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | "unknown"
  >("unknown");
  const [standaloneState, setStandaloneState] = useState(false);

  useEffect(() => {
    const support =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setSupported(support);

    if (!support) {
      setMessage("Este aparelho ou navegador não suporta notificações push.");
      return;
    }

    const standalone = isStandalone();
    setStandaloneState(standalone);
    setPermissionState(Notification.permission);

    checkExistingSubscription();
  }, []);

  async function checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(!!subscription);

      if (subscription) {
        setMessage("Este aparelho já está cadastrado para receber notificações.");
      }
    } catch (error) {
      console.error("Erro ao verificar inscrição push:", error);
      setMessage("Não foi possível verificar o status das notificações.");
    }
  }

  async function activatePush() {
    if (!supported) {
      setMessage("Seu aparelho não suporta notificações neste navegador.");
      return;
    }

    if (!standaloneState) {
      setMessage(
        "Abra o Valente Conecta pelo ícone instalado na tela do celular para ativar as notificações."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      let permission = Notification.permission;

      if (permission === "denied") {
        setPermissionState("denied");
        setMessage(
          "As notificações estão bloqueadas neste celular. Abra as configurações do site no Chrome e mude Notificações para Permitir."
        );
        setLoading(false);
        return;
      }

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      setPermissionState(permission);

      if (permission !== "granted") {
        setMessage("Permissão não concedida.");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      let subscription = existing;

      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          setMessage("Chave pública VAPID não configurada.");
          setLoading(false);
          return;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const payload = subscription.toJSON() as PushSubscriptionJSONShape;

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: payload,
          user_agent: navigator.userAgent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao salvar inscrição.");
      }

      setSubscribed(true);
      setMessage("Notificações ativadas com sucesso.");
    } catch (error) {
      console.error("Erro ao ativar push:", error);

      if (error instanceof Error) {
        setMessage(`Não foi possível ativar as notificações: ${error.message}`);
      } else {
        setMessage("Não foi possível ativar as notificações.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!supported || subscribed || dismissed) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-emerald-200 bg-emerald-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            🔔 Ative as notificações do Valente Conecta
          </p>

          <p className="text-sm text-emerald-700">
            Receba ofertas, avisos e novidades direto no celular.
          </p>

          <div className="mt-1 text-xs text-slate-600">
            <p>
              Permissão atual:{" "}
              <strong>
                {permissionState === "unknown"
                  ? "verificando..."
                  : permissionState}
              </strong>
            </p>
            <p>
              App aberto pelo ícone instalado:{" "}
              <strong>{standaloneState ? "sim" : "não"}</strong>
            </p>
          </div>

          {message ? (
            <p className="mt-2 text-xs font-medium text-slate-700">{message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={activatePush}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Ativando..." : "Ativar notificações"}
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}