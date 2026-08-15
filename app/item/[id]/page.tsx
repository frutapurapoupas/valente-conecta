"use client";

// Caminho: C:\valente_conecta\app\item\[id]\page.tsx
//
// Pagina publica generica de um item do catalogo — destino de qualquer
// card da busca inteligente ou de uma pagina de modulo, qualquer que seja
// o modulo (agua-gas, servicos, mercados, imoveis, emprego, construcao,
// saude, pet). Mostra a vitrine completa + botao de interesse.

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { InteresseButton } from "@/components/catalogo/InteresseButton";
import { BadgeAbertoAgora } from "@/components/catalogo/BadgeAbertoAgora";
import { LABEL_MODULO, ARQUETIPO_POR_MODULO, type CatalogoItem, type ModuloId } from "@/lib/catalogo/marketplaceTypes";

export default function ItemPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<CatalogoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [midiaAtiva, setMidiaAtiva] = useState(0);
  const [agendaAtiva, setAgendaAtiva] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/catalogo/itens/${id}`)
      .then((r) => r.json())
      .then((res) => setItem(res.success ? res.data : null))
      .finally(() => setLoading(false));
  }, [id]);

  // Modulos com arquetipo "agenda-profissional" (ex: saude/clinicas) trocam
  // o botao generico de interesse por "Entrar na fila / Agendar", quando a
  // loja tiver o modulo Agenda liberado pelo admin master.
  useEffect(() => {
    if (!item) return;
    if (ARQUETIPO_POR_MODULO[item.modulo as ModuloId] !== "agenda-profissional") return;
    fetch(`/api/agenda/habilitacao?donoId=${item.dono_id}`)
      .then((r) => r.json())
      .then((res) => setAgendaAtiva(!!res.data?.ativo))
      .catch(() => setAgendaAtiva(false));
  }, [item]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-500">Item não encontrado ou removido.</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 font-medium">Voltar</button>
      </div>
    );
  }

  const capa = item.midia[midiaAtiva] || item.midia[0];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="aspect-video bg-gray-100">
          {capa ? (
            capa.tipo === "video" ? (
              <video src={capa.url} controls className="w-full h-full object-contain bg-black" />
            ) : (
              <img src={capa.url} alt={item.titulo} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">Sem imagem</div>
          )}
        </div>

        {item.midia.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {item.midia.map((m, i) => (
              <button
                key={m.url + i}
                onClick={() => setMidiaAtiva(i)}
                className={`w-16 h-16 rounded overflow-hidden shrink-0 border-2 ${i === midiaAtiva ? "border-blue-600" : "border-transparent"}`}
              >
                <img src={m.thumb_url || m.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              {LABEL_MODULO[item.modulo as ModuloId] || item.modulo} · {item.categoria}
            </span>
            <BadgeAbertoAgora usuarioId={item.dono_id} />
          </div>
          <h1 className="text-2xl font-bold mt-1">{item.titulo}</h1>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {item.preco === null
              ? "Sob consulta"
              : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.preco)}
          </p>

          {item.descricao_publica && <p className="text-gray-700 mt-4 whitespace-pre-wrap">{item.descricao_publica}</p>}

          {item.latitude && item.longitude && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-3">
              <MapPin className="w-4 h-4" /> Localização aproximada disponível
            </p>
          )}

          <div className="mt-6">
            {agendaAtiva ? (
              <a
                href={`/agenda/${item.dono_id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Users className="w-4 h-4" /> Entrar na fila / Agendar
              </a>
            ) : (
              <InteresseButton itemId={item.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
