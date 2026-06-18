"use client";

import { ArrowLeft, Store, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SelecaoCozinhaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 pt-8 pb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-white/80 text-sm hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <h1 className="text-2xl font-bold">Quem vai pedir?</h1>
        <p className="text-white/80 text-sm mt-1">Escolha uma opção para continuar</p>
      </div>

      {/* Cards */}
      <div className="p-5 space-y-4">
        {/* Cliente */}
        <Link href="/cozinha/cliente" className="block">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-orange-500 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Users size={28} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-lg">Sou Cliente</h2>
                <p className="text-sm text-gray-500 mt-0.5">Peça como cliente final</p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">→</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Parceiro Revendedor */}
        <Link href="/cozinha/parceiro" className="block">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-green-500 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Store size={28} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-lg">Sou Parceiro</h2>
                <p className="text-sm text-gray-500 mt-0.5">Revendedor / Parceiro comercial</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">→</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Rodapé */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-400">Cozinha Chef Neide - Comida caseira com amor</p>
      </div>
    </div>
  );
}