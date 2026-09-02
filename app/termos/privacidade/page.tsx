"use client";

// Caminho: C:\valente_conecta\app\termos\privacidade\page.tsx
//
// Página pública com o texto completo da Política de Privacidade (ver
// lib/termos/politicaPrivacidade.ts). Aberta em nova aba a partir do
// checkbox de aceite no cadastro geral (components/CadastroPopup.tsx),
// pra não perder o formulário já preenchido.

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PRIVACIDADE_TITULO, PRIVACIDADE_TEXTO } from "@/lib/termos/politicaPrivacidade";

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <Link href="/"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Política de Privacidade</h1>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">{PRIVACIDADE_TITULO}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{PRIVACIDADE_TEXTO}</p>
        </div>
      </main>
    </div>
  );
}
