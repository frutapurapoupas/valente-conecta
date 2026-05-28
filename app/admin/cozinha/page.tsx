"use client";


export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminCozinhaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("cardapio");
  const [selectedDia, setSelectedDia] = useState("segunda");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar se é admin via localStorage
    const user = localStorage.getItem("valente_user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role !== "admin") {
        router.push("/");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-xl">🍳 Admin Cozinha</h1>
      </header>

      <div className="p-4">
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <i className="fas fa-utensils text-6xl text-yellow-500 mb-4"></i>
          <h2 className="text-white text-xl font-bold mb-2">Cozinha Dona Neide</h2>
          <p className="text-gray-400">Módulo em desenvolvimento</p>
          <button 
            onClick={() => router.push("/cozinha")}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-xl"
          >
            Ver Cardápio Público
          </button>
        </div>
      </div>
    </div>
  );
}
