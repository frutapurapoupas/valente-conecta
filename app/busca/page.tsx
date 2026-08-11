"use client";

// Caminho: C:\valente_conecta\app\busca\page.tsx
//
// Busca inteligente da primeira pagina — vitrine comparativa (estilo
// Mercado Livre), nao um filtro de texto simples. Ver
// VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 4.
// Substitui a versao anterior, que so buscava em arquivos JSON estaticos
// (profissionais/mototaxi) e nunca alcancava o catalogo real.

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, MapPin, MapPinOff } from "lucide-react";
import { ItemCard } from "@/components/catalogo/ItemCard";
import { LABEL_MODULO, type ModuloId, type ResultadoVitrine } from "@/lib/catalogo/marketplaceTypes";

const MODULOS = Object.keys(LABEL_MODULO) as ModuloId[];

export default function BuscaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryInicial = searchParams?.get("q") || "";

  const [termo, setTermo] = useState(queryInicial);
  const [moduloAtivo, setModuloAtivo] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoVitrine[]>([]);
  const [loading, setLoading] = useState(false);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [pediuLocalizacao, setPediuLocalizacao] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocalizacao({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPediuLocalizacao(true),
      { timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    buscar();
  }, [moduloAtivo, localizacao]);

  const buscar = async (termoBusca = termo) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (termoBusca) params.set("q", termoBusca);
      if (moduloAtivo) params.set("modulo", moduloAtivo);
      if (localizacao) {
        params.set("lat", String(localizacao.lat));
        params.set("lng", String(localizacao.lng));
      }
      const resposta = await fetch(`/api/catalogo/busca?${params.toString()}`);
      const resultado = await resposta.json();
      setResultados(resultado.success ? resultado.data : []);
    } catch (error) {
      console.error("Erro na busca:", error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/busca?q=${encodeURIComponent(termo)}`);
    buscar(termo);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar produtos, serviços, imóveis, vagas..."
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Buscar
        </button>
      </form>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <button
          onClick={() => setModuloAtivo(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            moduloAtivo === null ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Todos
        </button>
        {MODULOS.map((m) => (
          <button
            key={m}
            onClick={() => setModuloAtivo(m)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              moduloAtivo === m ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {LABEL_MODULO[m]}
          </button>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        {localizacao ? (
          <>
            <MapPin className="w-3.5 h-3.5" /> Ordenando por distância até você
          </>
        ) : pediuLocalizacao ? (
          <>
            <MapPinOff className="w-3.5 h-3.5" /> Localização não disponível — ative para ver distâncias
          </>
        ) : null}
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : resultados.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Nenhum resultado encontrado</p>
          <p className="text-gray-400 text-sm mt-1">Tente outro termo ou explore outra categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {resultados.map((item) => (
            <ItemCard key={item.id} item={item} onClick={() => router.push(`/item/${item.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
