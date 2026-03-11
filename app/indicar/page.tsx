"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import AppShell from "@/components/AppShell";

function sanitizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 24);
}

function getStoredCode() {
  if (typeof window === "undefined") return "";

  const possibleKeys = [
    "vc_ref_code",
    "ref_code",
    "codigo_indicacao",
    "codigoIndicador",
    "referral_code",
    "invite_code",
    "codigo",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (value && value.trim()) {
      return sanitizeCode(value.trim());
    }
  }

  return "";
}

export default function IndicarPage() {
  const [code, setCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setMounted(true);

    const params = new URLSearchParams(window.location.search);

    const codeFromQuery =
      params.get("codigo") ||
      params.get("code") ||
      params.get("ref") ||
      params.get("indicador") ||
      "";

    const storedCode = getStoredCode();
    const finalCode = sanitizeCode(codeFromQuery || storedCode || "VALENTE001");

    setCode(finalCode);

    const origin = window.location.origin;
    const generatedLink = `${origin}/cadastro?ref=${encodeURIComponent(finalCode)}`;
    setReferralLink(generatedLink);
  }, []);

  const whatsappShareLink = useMemo(() => {
    if (!referralLink) return "#";
    const text = `Cadastre-se pelo meu link no Valente Conecta: ${referralLink}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [referralLink]);

  async function copyLink() {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar o link.");
    }
  }

  async function nativeShare() {
    if (!referralLink) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Valente Conecta",
          text: "Cadastre-se pelo meu link no Valente Conecta:",
          url: referralLink,
        });
      } else {
        await copyLink();
      }
    } catch {
      // cancelado pelo usuário
    }
  }

  return (
    <AppShell
      title="Indicar amigos"
      subtitle="Compartilhe seu link e QR Code para convidar novos usuários."
    >
      <div className="grid-cards">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Seu código</h2>
            <span className="badge">Indicação ativa</span>
          </div>

          <input
            value={code}
            onChange={(e) => {
              const nextCode = sanitizeCode(e.target.value);
              setCode(nextCode);

              if (typeof window !== "undefined") {
                localStorage.setItem("vc_ref_code", nextCode);
                setReferralLink(
                  `${window.location.origin}/cadastro?ref=${encodeURIComponent(nextCode)}`
                );
              }
            }}
            placeholder="Digite seu código"
          />

          <p className="mt-2 text-sm text-slate-500">
            Você pode ajustar o código manualmente. O link e o QR Code serão
            atualizados automaticamente.
          </p>
        </div>

        <div className="card">
          <h2 className="section-title mb-3">QR Code</h2>

          <div className="qr-box min-h-[280px]">
            {mounted && referralLink ? (
              <div className="w-full max-w-[260px] bg-white p-3 rounded-2xl">
                <QRCode
                  value={referralLink}
                  size={240}
                  bgColor="#FFFFFF"
                  fgColor="#111827"
                  level="M"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Gerando QR Code...</p>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Abra esta tela no celular e compartilhe o QR Code com quem vai fazer
            o cadastro.
          </p>
        </div>

        <div className="card">
          <h2 className="section-title mb-3">Seu link de indicação</h2>

          <textarea
            readOnly
            value={referralLink}
            rows={4}
            className="resize-none"
          />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" className="btn-primary" onClick={copyLink}>
              {copied ? "Link copiado" : "Copiar link"}
            </button>

            <button type="button" className="btn-secondary" onClick={nativeShare}>
              Compartilhar
            </button>
          </div>

          <a
            href={whatsappShareLink}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-3"
          >
            Enviar pelo WhatsApp
          </a>
        </div>
      </div>
    </AppShell>
  );
}