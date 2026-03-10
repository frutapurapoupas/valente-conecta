"use client";

import MenuApp from "@/components/menuApp";
import {
  convertInviteToProvisionalMerchant,
  createMerchantInvite,
  getCurrentUserId,
} from "@/lib/conecta";
import { useEffect, useMemo, useState } from "react";

export default function ConvideEComprePage() {
  const [userId, setUserId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("");
  const [city, setCity] = useState("Valente");
  const [notes, setNotes] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [convertName, setConvertName] = useState("");
  const [convertPhone, setConvertPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    async function loadUser() {
      setLoadingUser(true);
      const currentUserId = await getCurrentUserId();
      if (currentUserId) setUserId(currentUserId);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  const inviteLink = useMemo(() => {
    if (!inviteCode) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/convide-e-compre?codigo=${inviteCode}`;
  }, [inviteCode]);

  const whatsappLink = useMemo(() => {
    if (!inviteCode) return "";
    const cleanPhone = String(merchantPhone || convertPhone || "").replace(/\D/g, "");
    const phone = cleanPhone ? `55${cleanPhone}` : "";

    const texto = [
      `Olá! Estamos testando o novo app da cidade: Valente Conecta.`,
      ``,
      `Gostaria de convidar sua empresa para participar gratuitamente do teste.`,
      ``,
      `Código do convite: ${inviteCode}`,
      inviteLink ? `Link do convite: ${inviteLink}` : "",
      ``,
      `Se quiser, posso te explicar rapidamente como funciona.`,
    ]
      .filter(Boolean)
      .join("\n");

    if (!phone) {
      return `https://wa.me/?text=${encodeURIComponent(texto)}`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
  }, [inviteCode, inviteLink, merchantPhone, convertPhone]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");
    if (codigo) {
      setInviteCode(codigo.toUpperCase());
    }
  }, []);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!userId || !merchantName) {
      setMessage("Preencha o usuário e o nome do comerciante.");
      return;
    }

    setCreating(true);

    const res = await createMerchantInvite({
      invitedBy: userId,
      merchantName,
      merchantPhone,
      city,
      notes,
    });

    if (res.error) {
      setMessage(res.error.message || "Erro ao criar convite.");
      setCreating(false);
      return;
    }

    const payload: any = res.data;

    if (payload?.status !== "success") {
      setMessage(payload?.message || "Não foi possível gerar o convite.");
      setCreating(false);
      return;
    }

    setInviteCode(payload.invite_code || "");
    setConvertName(merchantName);
    setConvertPhone(merchantPhone);
    setMessage(`Convite criado com sucesso. Código: ${payload.invite_code}`);
    setCreating(false);
  }

  async function handleConvertInvite(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!inviteCode || !convertName) {
      setMessage("Informe o código e o nome da loja para conversão.");
      return;
    }

    setConverting(true);

    const res = await convertInviteToProvisionalMerchant({
      inviteCode,
      nome: convertName,
      whatsapp: convertPhone,
    });

    if (res.error) {
      setMessage(res.error.message || "Erro ao converter convite.");
      setConverting(false);
      return;
    }

    const payload: any = res.data;

    if (payload?.status !== "success") {
      setMessage(payload?.message || "Não foi possível converter o convite.");
      setConverting(false);
      return;
    }

    setMessage(`Empresa provisória criada com sucesso. ID: ${payload.merchant_id}`);
    setConverting(false);
  }

  async function handleCopyText(value: string, successText: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(successText);
    } catch {
      setMessage("Não foi possível copiar.");
    }
  }

  async function handleShare() {
    if (!inviteLink) return;

    const texto = `Estamos testando o novo app da cidade, Valente Conecta. Código do convite: ${inviteCode}. Link: ${inviteLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Convite Valente Conecta",
          text: texto,
          url: inviteLink,
        });
        setMessage("Convite compartilhado com sucesso.");
        return;
      } catch {
        setMessage("Compartilhamento cancelado.");
        return;
      }
    }

    await handleCopyText(inviteLink, "Link copiado com sucesso.");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <MenuApp />

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
            Convide e Compre
          </p>
          <h1 className="mt-2 text-3xl font-bold">Ativação rápida de lojistas</h1>
          <p className="mt-2 text-slate-300">
            Gere o convite, copie o link, envie no WhatsApp e converta a loja
            em comerciante provisório em poucos cliques.
          </p>
          <p className="mt-3 break-all text-xs text-slate-400">
            {loadingUser
              ? "Carregando usuário..."
              : `Usuário atual: ${userId || "não autenticado"}`}
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">1. Gerar convite</h2>

            <form onSubmit={handleCreateInvite} className="space-y-4">
              <Field label="Usuário que convida (ID)">
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="Nome da loja">
                <input
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                  placeholder="Ex.: Pizzaria do João"
                />
              </Field>

              <Field label="WhatsApp da loja">
                <input
                  value={merchantPhone}
                  onChange={(e) => setMerchantPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                  placeholder="75999999999"
                />
              </Field>

              <Field label="Cidade">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="Observações">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[110px] w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                  placeholder="Ex.: Teste inicial do app, convite gratuito"
                />
              </Field>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {creating ? "Gerando convite..." : "Gerar convite"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">2. Enviar e converter</h2>

            <div className="space-y-4">
              <Field label="Código do convite">
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm uppercase outline-none"
                  placeholder="Código gerado"
                />
              </Field>

              <Field label="Link do convite">
                <input
                  value={inviteLink}
                  readOnly
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                  placeholder="O link aparecerá aqui"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(inviteCode, "Código copiado com sucesso.")}
                  disabled={!inviteCode}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:border-slate-500 disabled:opacity-50"
                >
                  Copiar código
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(inviteLink, "Link copiado com sucesso.")}
                  disabled={!inviteLink}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:border-slate-500 disabled:opacity-50"
                >
                  Copiar link
                </button>

                <a
                  href={whatsappLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${
                    inviteCode
                      ? "border border-emerald-500/20 bg-emerald-950/20 text-emerald-200 hover:bg-emerald-950/30"
                      : "pointer-events-none border border-slate-800 bg-slate-900 text-slate-500"
                  }`}
                >
                  Enviar no WhatsApp
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!inviteLink}
                  className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-950/30 disabled:opacity-50"
                >
                  Compartilhar
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-white">Mensagem sugerida</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
                  {`Olá!

Estamos testando um novo aplicativo da cidade chamado Valente Conecta.

Gostaria de convidar sua empresa para participar gratuitamente do teste.

Código do convite: ${inviteCode || "AGUARDANDO CÓDIGO"}
${inviteLink ? `Link do convite: ${inviteLink}` : ""}

Se quiser, posso te explicar rapidamente como funciona.`}
                </p>
              </div>

              <form onSubmit={handleConvertInvite} className="space-y-4 border-t border-slate-800 pt-4">
                <h3 className="text-lg font-semibold">3. Converter em loja provisória</h3>

                <Field label="Nome da loja">
                  <input
                    value={convertName}
                    onChange={(e) => setConvertName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                    placeholder="Nome da loja"
                  />
                </Field>

                <Field label="WhatsApp da loja">
                  <input
                    value={convertPhone}
                    onChange={(e) => setConvertPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none"
                    placeholder="75999999999"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={converting}
                  className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
                >
                  {converting ? "Convertendo..." : "Converter convite"}
                </button>
              </form>
            </div>
          </section>
        </section>

        {!!message && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-100 shadow-xl">
            {message}
          </section>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}