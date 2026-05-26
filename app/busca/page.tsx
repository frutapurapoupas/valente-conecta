"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function BuscaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (query) {
      setTimeout(() => {
        const mockResultados = [
          { id: 1, nome: "Frango ao Molho", preco: 15, categoria: "Cozinha", imagem: "🍗" },
          { id: 2, nome: "Strogonoff", preco: 16, categoria: "Cozinha", imagem: "🍲" },
        ];
        if (mockResultados.length === 0) setShowModal(true);
        else setResultados(mockResultados);
        setLoading(false);
      }, 1000);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3"><button onClick={() => router.back()}><i className="fas fa-arrow-left text-white"></i></button><h1 className="text-white font-bold text-xl">🔍 Busca: "{query}"</h1></header>

      <div className="p-4">{loading ? (<div className="text-center py-20"><i className="fas fa-spinner fa-spin text-4xl text-blue-400"></i><p className="text-gray-400 mt-4">Buscando...</p></div>) : resultados.length > 0 ? (<div className="space-y-3">{resultados.map(r => (<div key={r.id} className="bg-white/10 rounded-2xl p-3 flex items-center gap-3"><div className="text-4xl">{r.imagem}</div><div><p className="font-bold text-white">{r.nome}</p><p className="text-gray-400 text-sm">{r.categoria}</p><p className="text-green-400">R$ {r.preco}</p></div></div>))}</div>) : (<div className="text-center py-20"><i className="fas fa-search text-6xl text-gray-600"></i><p className="text-gray-400 mt-4">Nenhum resultado encontrado</p><button onClick={() => setShowModal(true)} className="mt-4 bg-yellow-500 text-black px-6 py-2 rounded-full">Sugerir Busca</button></div>)}</div>

      {showModal && (<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"><div className="bg-gray-800 rounded-3xl p-6 max-w-sm w-full"><div className="text-center"><div className="text-5xl mb-3">🔔</div><h3 className="text-xl font-bold text-white mb-2">Não encontramos "{query}"</h3><p className="text-gray-400 text-sm mb-4">Deseja que o admin cadastre este item?</p><div className="flex gap-3"><button onClick={() => { toast.success("Sugestão enviada para o Admin!"); setShowModal(false); }} className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold">Sim, sugerir</button><button onClick={() => { window.open("https://google.com/search?q=" + query, "_blank"); setShowModal(false); }} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold">Buscar Google</button></div><button onClick={() => setShowModal(false)} className="mt-3 text-gray-400 text-sm">Cancelar</button></div></div></div>)}
    </div>
  );
}
