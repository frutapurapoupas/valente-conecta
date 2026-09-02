"use client";

// Caminho: C:\valente_conecta\app\termos\limitacao-responsabilidade\page.tsx
//
// Página pública com o texto completo dos Termos e Limitação de
// Responsabilidade (ver lib/termos/termosLimitacaoResponsabilidade.ts).
// Aberta em nova aba a partir do checkbox de aceite na ativação de
// motorista E no cadastro de lojista, pra não perder o formulário
// preenchido.

import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { LIMITACAO_RESPONSABILIDADE_TITULO, LIMITACAO_RESPONSABILIDADE_TEXTO } from "@/lib/termos/termosLimitacaoResponsabilidade";

export default function TermosLimitacaoResponsabilidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <Link href="/"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><ScrollText className="w-5 h-5 text-amber-600" /> Limitação de Responsabilidade</h1>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">{LIMITACAO_RESPONSABILIDADE_TITULO}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{LIMITACAO_RESPONSABILIDADE_TEXTO}</p>
        </div>
      </main>
    </div>
  );
}
