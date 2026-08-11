"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import toast from "react-hot-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushOptIn({ alunoId }: { alunoId: number | null }) {
  const [suportado, setSuportado] = useState(false);
  const [inscrito, setInscrito] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSuportado(true);
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setInscrito(!!subscription);
    });
  }, []);

  const ativarNotificacoes = async () => {
    if (!alunoId) {
      toast.error("Aguarde o carregamento do seu perfil antes de ativar notificações.");
      return;
    }
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      toast.error("Notificações ainda não configuradas na plataforma.");
      return;
    }
    setCarregando(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const res = await fetch("/api/academia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "push_subscription", aluno_id: alunoId, subscription }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Erro ao salvar inscrição.");
      setInscrito(true);
      toast.success("Notificações ativadas!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao ativar notificações.");
    } finally {
      setCarregando(false);
    }
  };

  if (!suportado || inscrito) return null;

  return (
    <button
      onClick={ativarNotificacoes}
      disabled={carregando}
      className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
    >
      {carregando ? <BellOff className="w-4 h-4 text-yellow-400 shrink-0" /> : <Bell className="w-4 h-4 text-yellow-400 shrink-0" />}
      <p className="text-sm text-white text-left">
        Ativar notificações de cobrança e frequência de treino
      </p>
    </button>
  );
}
