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
import { Search, MapPin, MapPinOff, BellRing, CheckCircle2, ExternalLink, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { ItemCard } from "@/components/catalogo/ItemCard";
import { LABEL_MODULO, type ModuloId, type ResultadoVitrine } from "@/lib/catalogo/marketplaceTypes";
import { getCurrentUser, isUserLoggedIn } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import { CadastroPopup } from "@/components/CadastroPopup";

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
  const [demandaRegistrada, setDemandaRegistrada] = useState(false);
  const [registrandoDemanda, setRegistrandoDemanda] = useState(false);
  const [pedirCadastro, setPedirCadastro] = useState(false);
  const [resultadosExternos, setResultadosExternos] = useState<{ titulo: string; trecho: string; link: string; fonte: string }[]>([]);
  const [buscandoExterno, setBuscandoExterno] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocalizacao({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPediuLocalizacao(true),
      { timeout: 5000 }
    );
  }, []);

  // O CadastroPopup recarrega a pagina inteira ~1.5s depois do cadastro
  // (pra atualizar o estado de login em todo o app) — o que interromperia
  // um fetch de registrarDemanda() em andamento. Por isso guardamos a
  // intencao no localStorage antes de abrir o popup e retomamos aqui, ja
  // logado, depois do reload.
  useEffect(() => {
    const pendente = localStorage.getItem("busca_demanda_pendente");
    if (!pendente || !isUserLoggedIn()) return;
    localStorage.removeItem("busca_demanda_pendente");
    try {
      const { termo: termoPendente, modulo } = JSON.parse(pendente);
      if (!termoPendente) return;
      const usuario = getCurrentUser();
      fetch("/api/demandas-busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termo: termoPendente,
          modulo,
          usuarioId: obterUsuarioLocalId(),
          usuarioNome: usuario?.nome,
          usuarioTelefone: usuario?.whatsapp,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            toast.success("Prontinho! Vamos te avisar assim que aparecer.");
            if (termoPendente === termo) setDemandaRegistrada(true);
          }
        })
        .catch((err) => console.error("Erro ao registrar demanda pendente:", err));
    } catch {
      // ignora JSON invalido
    }
  }, []); // eslint-disable-line

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
    setDemandaRegistrada(false);
    setResultadosExternos([]);
    router.replace(`/busca?q=${encodeURIComponent(termo)}`);
    buscar(termo);
  };

  // So busca fora da plataforma quando a busca interna terminou e nao achou
  // nada — evita gastar cota da API em toda letra digitada.
  useEffect(() => {
    if (loading || resultados.length > 0 || !termo.trim()) {
      setResultadosExternos([]);
      return;
    }
    // cidade_base existe na tabela usuarios mas nao esta no tipo Usuario
    // (campo adicionado depois, tipo nao foi atualizado).
    const cidade = (getCurrentUser() as any)?.cidade_base || undefined;
    setBuscandoExterno(true);
    const params = new URLSearchParams({ q: termo });
    if (cidade) params.set("cidade", cidade);
    fetch(`/api/busca-externa?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => setResultadosExternos(res.success ? res.data : []))
      .catch(() => setResultadosExternos([]))
      .finally(() => setBuscandoExterno(false));
  }, [loading, resultados.length, termo]);

  const registrarDemanda = async () => {
    if (!isUserLoggedIn()) {
      localStorage.setItem("busca_demanda_pendente", JSON.stringify({ termo, modulo: moduloAtivo }));
      setPedirCadastro(true);
      return;
    }
    const usuario = getCurrentUser();
    setRegistrandoDemanda(true);
    try {
      const resp = await fetch("/api/demandas-busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termo,
          modulo: moduloAtivo,
          usuarioId: obterUsuarioLocalId(),
          usuarioNome: usuario?.nome,
          usuarioTelefone: usuario?.whatsapp,
          latitude: localizacao?.lat,
          longitude: localizacao?.lng,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setDemandaRegistrada(true);
      toast.success("Prontinho! Vamos te avisar assim que aparecer.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar seu interesse");
    } finally {
      setRegistrandoDemanda(false);
    }
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
        <div className="text-center py-16 bg-gray-50 rounded-lg px-6">
          <p className="text-gray-500 text-lg">Nenhum resultado encontrado</p>
          <p className="text-gray-400 text-sm mt-1">Ainda não existe ninguém oferecendo isso na plataforma.</p>
          {termo.trim() && (
            demandaRegistrada ? (
              <p className="mt-5 flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4" /> Interesse registrado — vamos te avisar em até 24h se aparecer.
              </p>
            ) : (
              <button
                onClick={registrarDemanda}
                disabled={registrandoDemanda}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium"
              >
                <BellRing className="w-4 h-4" />
                {registrandoDemanda ? "Registrando..." : `Avise-me quando "${termo}" aparecer`}
              </button>
            )
          )}

          {buscandoExterno && (
            <p className="text-xs text-gray-400 mt-6">Procurando na internet perto de você...</p>
          )}

          {resultadosExternos.length > 0 && (
            <div className="mt-8 text-left max-w-lg mx-auto">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Globe className="w-3.5 h-3.5" /> Encontrado na internet, fora da plataforma
              </p>
              <div className="space-y-2">
                {resultadosExternos.map((r, i) => (
                  <a
                    key={i}
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white border rounded-lg p-3 hover:border-blue-400 transition-colors"
                  >
                    <p className="text-sm font-medium text-blue-700 flex items-center gap-1.5">
                      {r.titulo} <ExternalLink className="w-3 h-3 shrink-0" />
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.trecho}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{r.fonte}</p>
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Resultado externo — o preço, se aparecer no texto, não é garantido pelo Valente Conecta.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {resultados.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => router.push(item.metadata?.link_externo || `/item/${item.id}`)}
            />
          ))}
        </div>
      )}

      {pedirCadastro && (
        <CadastroPopup
          forceShow
          onSuccess={() => {
            // Nao chama registrarDemanda() aqui: o CadastroPopup recarrega a
            // pagina inteira ~1.5s depois, o que aborta esse fetch no meio
            // do caminho na maioria das vezes. O useEffect de
            // "busca_demanda_pendente" acima cuida disso depois do reload,
            // ja com o login confirmado.
            setPedirCadastro(false);
          }}
        />
      )}
    </div>
  );
}
