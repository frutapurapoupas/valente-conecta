"use client";

import { useEffect, useState } from "react";

export default function PwaInstallCard() {
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;

    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  if (!prompt) return null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        background: "#ffffff",
      }}
    >
      <h3>📲 Instale o Valente Conecta</h3>

      <p style={{ fontSize: 14 }}>
        Adicione o app à tela inicial do seu celular para acompanhar suas
        indicações e créditos.
      </p>

      <button
        onClick={install}
        style={{
          marginTop: 10,
          padding: "10px 14px",
          background: "#16a34a",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Adicionar à tela inicial
      </button>
    </div>
  );
}