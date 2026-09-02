"use client";

// Caminho: C:\valente_conecta\app\termos\uso-motorista\page.tsx
//
// Página pública com o texto completo do Termo de Uso e Condições de
// Parceria - Motoristas (ver lib/termos/termoUsoMotorista.ts). Aberta em
// nova aba a partir do checkbox de aceite na ativação de motorista
// (moto-táxi e carona solidária), pra não perder o formulário preenchido.

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { TERMO_USO_MOTORISTA_TITULO, TERMO_USO_MOTORISTA_TEXTO } from "@/lib/termos/termoUsoMotorista";

export default function TermoUsoMotoristaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <Link href="/"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Termo de Uso do Motorista</h1>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">{TERMO_USO_MOTORISTA_TITULO}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{TERMO_USO_MOTORISTA_TEXTO}</p>
        </div>
      </main>
    </div>
  );
}
