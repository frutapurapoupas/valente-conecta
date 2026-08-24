"use client";

// Caminho: C:\valente_conecta\components\catalogo\CatalogoModuloPage.tsx
//
// Pagina publica generica de um modulo vertical do catalogo (camada 1 das
// 3 interfaces pedidas). Cada modulo monta a propria rota so passando
// modulo/labelModulo/categorias — ver app/mercados/page.tsx como exemplo.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Store } from "lucide-react";
import { useBuscaInteligente } from "@/lib/busca/useBuscaInteligente";
import { useFallbackExterno } from "@/lib/busca/useFallbackExterno";
import { SemResultados } from "@/components/busca/SemResultados";
import { ItemCard } from "./ItemCard";

interface CatalogoModuloPageProps {
  modulo: string;
  labelModulo: string;
  categorias: string[];
  descricao?: string;
  linkExtra?: { href: string; label: string; icone: React.ReactNode };
}

export function CatalogoModuloPage({ modulo, labelModulo, categorias, descricao, linkExtra }: CatalogoModuloPageProps) {
  const router = useRouter();
  const [categoria, setCategoria] = useState<string | undefined>(undefined);
  const { diretos, relacionados, mensagemHumanizada, carregando: loading, buscar, termo } = useBuscaInteligente({ modulo, categoria });
  const totalResultados = diretos.length + relacionados.length;
  const {
    demandaRegistrada,
    registrandoDemanda,
    pedirCadastro,
    setPedirCadastro,
    resultadosExternos,
    buscandoExterno,
    registrarDemanda,
  } = useFallbackExterno({ termo, modulo, localizacao: null, loading, totalResultados });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold">{labelModulo}</h1>
        <div className="flex items-center gap-3 pt-1">
          {linkExtra && (
            <Link
              href={linkExtra.href}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
            >
              {linkExtra.icone} {linkExtra.label}
            </Link>
          )}
          <Link
            href={`/${modulo}/admin`}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            <Store className="w-4 h-4" /> Sou fornecedor
          </Link>
        </div>
      </div>
      {descricao && <p className="text-gray-500 text-sm mb-5">{descricao}</p>}

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          defaultValue={termo}
          onChange={(e) => buscar(e.target.value)}
          placeholder={`Buscar em ${labelModulo.toLowerCase()}...`}
          className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategoria(undefined)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !categoria ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              categoria === c ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : totalResultados === 0 ? (
        <SemResultados
          termo={termo}
          demandaRegistrada={demandaRegistrada}
          registrandoDemanda={registrandoDemanda}
          onRegistrarDemanda={registrarDemanda}
          buscandoExterno={buscandoExterno}
          resultadosExternos={resultadosExternos}
          pedirCadastro={pedirCadastro}
          onFecharCadastro={() => setPedirCadastro(false)}
          semTermoExtra={
            <Link href={`/${modulo}/admin`} className="text-blue-600 text-sm font-medium mt-2 inline-block">
              Seja o primeiro a publicar
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <div>
            {mensagemHumanizada && (
              <p className="text-sm text-gray-600 mb-3">{mensagemHumanizada}</p>
            )}
            {relacionados.length > 0 && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resultados diretos</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {diretos.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => router.push(item.metadata?.link_externo || `/item/${item.id}`)}
                />
              ))}
            </div>
          </div>
          {relacionados.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Também pode te interessar</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relacionados.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => router.push(item.metadata?.link_externo || `/item/${item.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
