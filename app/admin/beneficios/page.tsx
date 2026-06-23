"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, X, Gift, ArrowLeft } from "lucide-react";

export default function AdminBeneficiosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [beneficios, setBeneficios] = useState<{ id: number; valor: string }[]>([]);
  const [novoBeneficio, setNovoBeneficio] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    carregarBeneficios();
  }, [isAdmin]);

  const carregarBeneficios = async () => {
    const { data, error } = await supabase
      .from('admin_beneficios')
      .select('*')
      .order('id');
    
    if (error) {
      toast.error("Erro ao carregar benefícios");
    } else {
      setBeneficios(data || []);
    }
    setLoading(false);
  };

  const adicionarBeneficio = async () => {
    if (!novoBeneficio.trim()) {
      toast.error("Digite um benefício");
      return;
    }

    const { error } = await supabase
      .from('admin_beneficios')
      .insert({
        chave: `beneficio_${Date.now()}`,
        valor: novoBeneficio,
        descricao: "Benefício para novos usuários"
      });
    
    if (error) {
      toast.error("Erro ao adicionar");
    } else {
      toast.success("Benefício adicionado!");
      setNovoBeneficio("");
      carregarBeneficios();
    }
  };

  const removerBeneficio = async (id: number) => {
    await supabase.from('admin_beneficios').delete().eq('id', id);
    toast.success("Benefício removido!");
    carregarBeneficios();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Gift className="w-6 h-6 text-yellow-300" />
          <h1 className="text-white font-bold text-lg">Gerenciar Benefícios</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4">
          <p className="text-yellow-400 text-sm">
            Estes benefícios aparecerão na página de convite para novos usuários.
            Qualquer alteração aqui será refletida instantaneamente.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Benefícios Atuais
          </h2>
          
          <div className="space-y-2 mb-4">
            {beneficios.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum benefício cadastrado</p>
            ) : (
              beneficios.map((beneficio) => (
                <div key={beneficio.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
                  <span className="text-white">{beneficio.valor}</span>
                  <button
                    onClick={() => removerBeneficio(beneficio.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={novoBeneficio}
              onChange={(e) => setNovoBeneficio(e.target.value)}
              placeholder="Ex: R$10 de bônus na carteira"
              className="flex-1 px-4 py-2 bg-gray-700 rounded-xl text-white placeholder-gray-400"
            />
            <button
              onClick={adicionarBeneficio}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-500 transition"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}