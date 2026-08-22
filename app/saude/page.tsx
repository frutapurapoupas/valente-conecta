"use client";

// Caminho: C:\valente_conecta\app\saude\page.tsx
//
// Arquetipo Agenda+Profissional (MASTER_SPEC secao 3). Duas partes:
//   1. Diretorio PUBLICO E GRATUITO de hospitais/clinicas/consultorios/
//      laboratorios/farmacias (053_saude_estabelecimentos.sql) — telefone
//      e endereco sempre visiveis, sem taxa de desbloqueio, porque
//      informacao de saude nao deveria ficar atras de paywall.
//   2. Vitrine generica do catalogo (mesma dos demais modulos, com fluxo de
//      interesse pago) pra profissionais autonomos que se auto-cadastram —
//      mantida como estava.

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Phone, MapPin, Clock, HeartPulse, Loader2, Search, Globe, Store, CalendarClock, X, Image as ImageIcon } from "lucide-react";
import { CatalogoModuloPage } from "@/components/catalogo/CatalogoModuloPage";
import { CATEGORIAS_POR_MODULO } from "@/lib/catalogo/modulosConfig";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import { getCurrentUser } from "@/lib/auth";
import { FotoFachadaUploader } from "@/components/comercios/FotoFachadaUploader";

interface ResultadoGoogle {
  nome: string;
  endereco: string;
  telefone: string;
  latitude: number | null;
  longitude: number | null;
}

interface Estabelecimento {
  id: string;
  donoId: string | null;
  nome: string;
  tipo: string;
  especialidades: string[];
  telefone: string;
  whatsapp: string;
  endereco: string;
  bairro: string;
  cidade: string;
  latitude: number | null;
  longitude: number | null;
  horario: string;
  foto: string;
}

const TIPO_LABEL: Record<string, string> = {
  hospital: "Hospital",
  clinica: "Clínica",
  consultorio: "Consultório",
  laboratorio: "Laboratório",
  farmacia: "Farmácia",
  outro: "Outro",
};

const TIPOS_SAUDE = ["hospital", "clinica", "consultorio", "laboratorio", "farmacia", "outro"];

const FILTROS_TIPO = [
  { id: "", label: "Todos" },
  { id: "hospital", label: "Hospitais" },
  { id: "clinica", label: "Clínicas" },
  { id: "consultorio", label: "Consultórios" },
  { id: "laboratorio", label: "Laboratórios" },
  { id: "farmacia", label: "Farmácias" },
];

function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function DiretorioSaude() {
  const [lista, setLista] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [tipoFiltro, setTipoFiltro] = useState(() => searchParams?.get("tipo") || "");
  const [busca, setBusca] = useState(() => searchParams?.get("busca") || "");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [cidadeId, setCidadeId] = useState("");
  const [resultadosGoogle, setResultadosGoogle] = useState<ResultadoGoogle[] | null>(null);
  const [buscandoGoogle, setBuscandoGoogle] = useState(false);
  const [limiteGoogleAtingido, setLimiteGoogleAtingido] = useState(false);
  const [estabelecimentoReivindicar, setEstabelecimentoReivindicar] = useState<Estabelecimento | null>(null);
  const [estabelecimentoCompletar, setEstabelecimentoCompletar] = useState<Estabelecimento | null>(null);
  const [recarregarChave, setRecarregarChave] = useState(0);
  const [meuId, setMeuId] = useState("");

  useEffect(() => {
    const perfil = getCurrentUser();
    setMeuId(perfil?.id || obterUsuarioLocalId());
  }, []);

  useEffect(() => {
    fetch("/api/mototaxi?recurso=cidades")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data[0]) setCidadeId(res.data[0].id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setResultadosGoogle(null);
      setLimiteGoogleAtingido(false);
      setLoading(true);
      const params = new URLSearchParams();
      if (tipoFiltro) params.set("tipo", tipoFiltro);
      if (busca.trim()) params.set("busca", busca.trim());
      fetch(`/api/saude/estabelecimentos?${params}`)
        .then((r) => r.json())
        .then(async (res) => {
          const data = res.success ? res.data : [];
          setLista(data);
          // So' aciona o Google quando teve uma busca de verdade e nada foi
          // encontrado no nosso diretorio — nao gasta cota em toda pesquisa.
          if (data.length === 0 && busca.trim().length >= 3 && cidadeId) {
            setBuscandoGoogle(true);
            try {
              const perfil = getCurrentUser();
              const usuarioId = perfil?.id || obterUsuarioLocalId();
              const gparams = new URLSearchParams({
                termo: busca.trim(),
                cidade_id: cidadeId,
                usuarioId,
                usuarioNome: perfil?.nome || "",
                usuarioTelefone: perfil?.whatsapp || "",
              });
              const gresp = await fetch(`/api/saude/busca-google?${gparams}`).then((r) => r.json());
              if (gresp.limiteAtingido) {
                setLimiteGoogleAtingido(true);
                setResultadosGoogle([]);
              } else {
                setResultadosGoogle(gresp.success ? gresp.data : []);
              }
            } finally {
              setBuscandoGoogle(false);
            }
          }
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [tipoFiltro, busca, cidadeId, recarregarChave]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
  }, []);

  const ordenados = useMemo(() => {
    const comDistancia = lista.map((e) => ({
      item: e,
      distancia: userPosition && e.latitude != null && e.longitude != null
        ? distanciaKm(userPosition.lat, userPosition.lng, e.latitude, e.longitude)
        : null,
    }));
    if (!userPosition) return comDistancia;
    return [...comDistancia].sort((a, b) => {
      if (a.distancia == null) return 1;
      if (b.distancia == null) return -1;
      return a.distancia - b.distancia;
    });
  }, [lista, userPosition]);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <HeartPulse className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-bold text-gray-800">Hospitais e Clínicas</h2>
      </div>
      <p className="text-sm text-gray-500 mb-3">Telefone e endereço direto, sem taxa nenhuma pra ver o contato.</p>

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar hospital, clínica, especialidade..."
          className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTROS_TIPO.map((f) => (
          <button
            key={f.id}
            onClick={() => setTipoFiltro(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
              tipoFiltro === f.id ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-red-500 animate-spin" /></div>
      ) : ordenados.length === 0 ? (
        <div className="py-4">
          <p className="text-center text-sm text-gray-400 py-4">Nenhum estabelecimento cadastrado no nosso diretório ainda.</p>
          {buscandoGoogle ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando no Google...
            </div>
          ) : limiteGoogleAtingido ? (
            <div className="text-center bg-amber-50 border border-amber-200 rounded-xl p-4 mx-1">
              <p className="text-sm text-amber-800">Você atingiu o limite de buscas no Google de hoje pro seu plano.</p>
              <a href="/plano-geral" className="inline-block mt-2 text-sm font-semibold text-amber-900 underline">Ver planos com mais buscas</a>
            </div>
          ) : resultadosGoogle && resultadosGoogle.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-1.5 px-1">
                <Globe className="w-3.5 h-3.5" /> Achamos isso no Google — já avisamos nossa equipe pra confirmar e adicionar ao cadastro:
              </p>
              {resultadosGoogle.map((g, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-bold text-gray-800">{g.nome}</p>
                  {g.endereco && (
                    <div className="flex items-start gap-1.5 text-sm text-gray-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" /> <span>{g.endereco}</span>
                    </div>
                  )}
                  {g.telefone && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
                      <a href={`tel:${g.telefone.replace(/\D/g, "")}`} className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium">
                        <Phone className="w-4 h-4" /> Ligar
                      </a>
                      <a
                        href={`https://wa.me/55${g.telefone.replace(/\D/g, "")}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : resultadosGoogle && resultadosGoogle.length === 0 ? (
            <p className="text-center text-xs text-gray-400 pb-2">Não achamos nada no Google também pra essa busca.</p>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {ordenados.map(({ item: e, distancia }) => (
            <div key={e.id} className="bg-white border rounded-xl overflow-hidden">
              {e.foto && <img src={e.foto} alt={e.nome} className="w-full h-32 object-cover" />}
              <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{e.nome}</p>
                  <p className="text-xs text-gray-500">
                    {TIPO_LABEL[e.tipo] || e.tipo}
                    {e.especialidades?.length > 0 ? ` · ${e.especialidades.join(", ")}` : ""}
                  </p>
                </div>
                {distancia != null && (
                  <span className="text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
                    {distancia < 1 ? `${Math.round(distancia * 1000)} m` : `${distancia.toFixed(1)} km`}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {e.endereco && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" /> <span>{e.endereco}</span>
                  </div>
                )}
                {e.horario && (
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" /> <span className="text-xs">{e.horario}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t space-y-2">
                {e.telefone && (
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:${e.telefone.replace(/\D/g, "")}`} className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium">
                      <Phone className="w-4 h-4" /> Ligar
                    </a>
                    <a
                      href={`https://wa.me/55${(e.whatsapp || e.telefone).replace(/\D/g, "")}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
                {e.donoId ? (
                  <>
                    <Link
                      href={`/agenda/${e.donoId}`}
                      className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium"
                    >
                      <CalendarClock className="w-4 h-4" /> Ver horários e agendar
                    </Link>
                    {e.donoId === meuId && !e.foto && (
                      <button
                        onClick={() => setEstabelecimentoCompletar(e)}
                        className="w-full flex items-center justify-center gap-1.5 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-2 text-sm font-medium"
                      >
                        <ImageIcon className="w-4 h-4" /> Adicionar foto da fachada
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setEstabelecimentoReivindicar(e)}
                    className="w-full flex items-center justify-center gap-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg py-2 text-sm font-medium"
                  >
                    <Store className="w-4 h-4" /> Sou proprietário
                  </button>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {estabelecimentoReivindicar && (
        <ModalReivindicarSaude
          estabelecimento={estabelecimentoReivindicar}
          onFechar={() => setEstabelecimentoReivindicar(null)}
          onEnviado={() => { setEstabelecimentoReivindicar(null); setRecarregarChave((k) => k + 1); }}
          onAprovadaAutomaticamente={(est) => { setEstabelecimentoReivindicar(null); setEstabelecimentoCompletar(est); }}
        />
      )}

      {estabelecimentoCompletar && (
        <ModalFotoFachadaSaude
          estabelecimento={estabelecimentoCompletar}
          onFechar={() => setEstabelecimentoCompletar(null)}
          onSalvo={() => { setEstabelecimentoCompletar(null); setRecarregarChave((k) => k + 1); }}
        />
      )}
    </div>
  );
}

function ModalReivindicarSaude({ estabelecimento, onFechar, onEnviado, onAprovadaAutomaticamente }: {
  estabelecimento: Estabelecimento; onFechar: () => void; onEnviado: () => void;
  onAprovadaAutomaticamente: (estabelecimento: Estabelecimento) => void;
}) {
  const perfil = getCurrentUser();
  const [form, setForm] = useState({
    nomeProprietario: perfil?.nome || "",
    whatsappProprietario: perfil?.whatsapp || "",
    nome: estabelecimento.nome,
    telefone: estabelecimento.telefone,
    whatsapp: estabelecimento.whatsapp || estabelecimento.telefone,
    endereco: estabelecimento.endereco,
    horario: estabelecimento.horario,
    tipo: estabelecimento.tipo,
  });
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!form.nomeProprietario.trim() || !form.whatsappProprietario.trim()) {
      toast.error("Preencha seu nome e WhatsApp — precisamos saber quem está reivindicando o estabelecimento.");
      return;
    }
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Preencha nome e telefone do estabelecimento");
      return;
    }
    if (!form.horario.trim()) {
      toast.error("Confirme o horário de funcionamento");
      return;
    }
    setEnviando(true);
    try {
      const usuarioId = perfil?.id || obterUsuarioLocalId();
      const resp = await fetch("/api/saude/reivindicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estabelecimentoId: estabelecimento.id,
          usuarioId,
          nomeSolicitante: form.nomeProprietario,
          telefoneSolicitante: form.whatsappProprietario,
          dadosNovos: { ...form, especialidades: [] },
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (resultado.aprovadaAutomaticamente) {
        toast.success("Cadastro atualizado! Agora adicione a foto da fachada.");
        onAprovadaAutomaticamente({ ...estabelecimento, ...form, donoId: usuarioId });
      } else {
        toast.success("Solicitação enviada! Nossa equipe vai revisar e liberar em breve.");
        onEnviado();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar solicitação");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-lg">Sou proprietário</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-sm text-gray-500 mb-4">Confirme e atualize os dados do seu estabelecimento. Sua solicitação passa por uma revisão antes de valer.</p>

          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-blue-700">Quem está reivindicando</p>
              <div>
                <label className="text-xs text-gray-500">Seu nome (proprietário) *</label>
                <input value={form.nomeProprietario} onChange={(e) => setForm((p) => ({ ...p, nomeProprietario: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Seu WhatsApp *</label>
                <input value={form.whatsappProprietario} onChange={(e) => setForm((p) => ({ ...p, whatsappProprietario: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Nome *</label>
              <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                {TIPOS_SAUDE.map((t) => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Telefone *</label>
              <input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">WhatsApp</label>
              <input value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Endereço</label>
              <input value={form.endereco} onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Horário de funcionamento *</label>
              <textarea value={form.horario} onChange={(e) => setForm((p) => ({ ...p, horario: e.target.value }))} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t shrink-0">
          <button onClick={enviar} disabled={enviando} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold disabled:opacity-60">
            {enviando ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalFotoFachadaSaude({ estabelecimento, onFechar, onSalvo }: {
  estabelecimento: Estabelecimento; onFechar: () => void; onSalvo: () => void;
}) {
  const [foto, setFoto] = useState(estabelecimento.foto || "");
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch(`/api/saude/estabelecimentos?id=${estabelecimento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Foto salva!");
      onSalvo();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-lg">Foto da fachada</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-sm text-gray-500 mb-4">{estabelecimento.nome} já está confirmado. Uma foto da fachada ajuda os pacientes a reconhecer o local.</p>
          <FotoFachadaUploader value={foto} onChange={setFoto} />
        </div>

        <div className="px-5 py-4 border-t shrink-0">
          <button onClick={salvar} disabled={salvando} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold disabled:opacity-60">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SaudePage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-0">
        <DiretorioSaude />
      </div>
      <div className="border-t mt-2">
        <CatalogoModuloPage
          modulo="saude"
          labelModulo="Outros profissionais de saúde"
          categorias={CATEGORIAS_POR_MODULO.saude}
          descricao="Psicólogos, nutricionistas e outros profissionais autônomos."
        />
      </div>
    </>
  );
}
