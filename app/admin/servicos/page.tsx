"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

export default function AdminServicosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  if (!isAdmin) { router.push("/login"); return null; }
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <button onClick={() => router.push("/admin")} className="text-white mb-4"><i className="fas fa-arrow-left"></i> Voltar</button>
      <div className="bg-gray-800 rounded-2xl p-6 text-center">
        <i className="fas fa-tools text-6xl text-blue-500 mb-4"></i>
        <h1 className="text-white text-2xl font-bold">🔧 Serviços</h1>
        <p className="text-gray-400 mt-2">Módulo em desenvolvimento</p>
      </div>
    </div>
  );
}