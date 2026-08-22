"use client";

// Caminho: C:\valente_conecta\components\comercios\DiretorioComercios.tsx
//
// Diretorio publico e gratuito, reaproveitavel por varios modulos (ver
// 056_comercios_diretorio.sql e app/saude/page.tsx, de onde esse padrao
// nasceu). Cada modulo (moda, mercados, alimentacao, pet, construcao,
// servicos) so' passa modulo/categorias e ganha: telefone/WhatsApp direto
// sem taxa, botao "Sou proprietário" (abre modal de reivindicacao — vira
// solicitacao pro admin master, ou aprova na hora se a moderacao
// automatica estiver ligada) e "Ver horários e agendar" quando o comercio
// ja' foi reivindicado (usa o modulo Agenda+Fila ja existente).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Phone, MapPin, Clock, Loader2, Search, Store, CalendarClock, X, Plus, Trash2, ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import { FotoFachadaUploader } from "@/components/comercios/FotoFachadaUploader";

interface ItemCatalogo {
  nome: string;
  preco: number | null;
  descricao: string;
}

interface Comercio {
  id: string;
  donoId: string | null;
  modulo: string;
  categoria: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  horario: string;
  foto: string;
  catalogo: ItemCatalogo[];
}

function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function DiretorioComercios({ modulo, titulo, categorias }: { modulo: string; titulo: string; categorias: string[] }) {
  const searchParams = useSearchParams();
  const [lista, setLista] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [busca, setBusca] = useState(() => searchParams?.get("busca") || "");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [comercioReivindicar, setComercioReivindicar] = useState<Comercio | null>(null);
  const [comercioCompletar, setComercioCompletar] = useState<Comercio | null>(null);
  const [meuId, setMeuId] = useState("");

  useEffect(() => {
    const perfil = getCurrentUser();
    setMeuId(perfil?.id || obterUsuarioLocalId());
  }, []);

  const carregar = () => {
    setLoading(true);
    const params = new URLSearchParams({ modulo });
    if (categoriaFiltro) params.set("categoria", categoriaFiltro);
    if (busca.trim()) params.set("busca", busca.trim());
    fetch(`/api/comercios-diretorio?${params}`)
      .then((r) => r.json())
      .then((res) => setLista(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(carregar, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo, categoriaFiltro, busca]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
  }, []);

  const ordenados = useMemo(() => {
    const comDistancia = lista.map((c) => ({
      item: c,
      distancia: userPosition && c.latitude != null && c.longitude != null
        ? distanciaKm(userPosition.lat, userPosition.lng, c.latitude, c.longitude)
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
        <Store className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-3">Telefone e endereço direto, sem taxa nenhuma pra ver o contato.</p>

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`Buscar em ${titulo.toLowerCase()}...`}
          className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoriaFiltro("")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
            categoriaFiltro === "" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaFiltro(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
              categoriaFiltro === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
      ) : ordenados.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Nenhum estabelecimento cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {ordenados.map(({ item: c, distancia }) => (
            <div key={c.id} className="bg-white border rounded-xl overflow-hidden">
              {c.foto && <img src={c.foto} alt={c.nome} className="w-full h-32 object-cover" />}
              <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{c.nome}</p>
                  <p className="text-xs text-gray-500">{c.categoria}</p>
                </div>
                {distancia != null && (
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                    {distancia < 1 ? `${Math.round(distancia * 1000)} m` : `${distancia.toFixed(1)} km`}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {c.endereco && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" /> <span>{c.endereco}</span>
                  </div>
                )}
                {c.horario && (
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" /> <span className="text-xs">{c.horario}</span>
                  </div>
                )}
              </div>

              {c.catalogo?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.catalogo.slice(0, 4).map((item, i) => (
                    <span key={i} className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-lg">
                      {item.nome}{item.preco ? ` · R$ ${Number(item.preco).toFixed(2)}` : ""}
                    </span>
                  ))}
                  {c.catalogo.length > 4 && (
                    <span className="text-[11px] text-gray-400 px-1 py-1">+{c.catalogo.length - 4}</span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t space-y-2">
                {c.telefone && (
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:${c.telefone.replace(/\D/g, "")}`} className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium">
                      <Phone className="w-4 h-4" /> Ligar
                    </a>
                    <a
                      href={`https://wa.me/55${(c.whatsapp || c.telefone).replace(/\D/g, "")}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
                {c.donoId ? (
                  <>
                    <Link
                      href={`/agenda/${c.donoId}`}
                      className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium"
                    >
                      <CalendarClock className="w-4 h-4" /> Ver horários e agendar
                    </Link>
                    {c.donoId === meuId && (!c.foto || c.catalogo.length === 0) && (
                      <button
                        onClick={() => setComercioCompletar(c)}
                        className="w-full flex items-center justify-center gap-1.5 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-2 text-sm font-medium"
                      >
                        <ClipboardList className="w-4 h-4" /> Completar meu cadastro (catálogo/foto)
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setComercioReivindicar(c)}
                    className="w-full flex items-center justify-center gap-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg py-2 text-sm font-medium"
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

      {comercioReivindicar && (
        <ModalReivindicar
          comercio={comercioReivindicar}
          categorias={categorias}
          onFechar={() => setComercioReivindicar(null)}
          onEnviado={() => { setComercioReivindicar(null); carregar(); }}
          onAprovadaAutomaticamente={(c) => { setComercioReivindicar(null); setComercioCompletar(c); }}
        />
      )}

      {comercioCompletar && (
        <ModalCompletarCadastro
          comercio={comercioCompletar}
          onFechar={() => setComercioCompletar(null)}
          onSalvo={() => { setComercioCompletar(null); carregar(); }}
        />
      )}
    </div>
  );
}

function ModalReivindicar({ comercio, categorias, onFechar, onEnviado, onAprovadaAutomaticamente }: {
  comercio: Comercio; categorias: string[]; onFechar: () => void; onEnviado: () => void;
  onAprovadaAutomaticamente: (comercio: Comercio) => void;
}) {
  const perfil = getCurrentUser();
  const [form, setForm] = useState({
    nomeProprietario: perfil?.nome || "",
    whatsappProprietario: perfil?.whatsapp || "",
    nome: comercio.nome,
    telefone: comercio.telefone,
    whatsapp: comercio.whatsapp || comercio.telefone,
    endereco: comercio.endereco,
    horario: comercio.horario,
    categoria: comercio.categoria,
  });
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!form.nomeProprietario.trim() || !form.whatsappProprietario.trim()) {
      toast.error("Preencha seu nome e WhatsApp — precisamos saber quem está reivindicando o negócio.");
      return;
    }
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Preencha nome e telefone do negócio");
      return;
    }
    if (!form.horario.trim()) {
      toast.error("Confirme o horário de funcionamento");
      return;
    }
    setEnviando(true);
    try {
      const usuarioId = perfil?.id || obterUsuarioLocalId();
      const resp = await fetch("/api/comercios-diretorio/reivindicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comercioId: comercio.id,
          usuarioId,
          nomeSolicitante: form.nomeProprietario,
          telefoneSolicitante: form.whatsappProprietario,
          dadosNovos: form,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      if (resultado.aprovadaAutomaticamente) {
        toast.success("Cadastro atualizado! Agora complete com catálogo e foto.");
        onAprovadaAutomaticamente({ ...comercio, ...form, donoId: usuarioId });
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
      {/* max-h-[85dvh] (nao vh) + layout em coluna com cabecalho/rodape fixos
          e so' o meio rolando — em vh puro, o teclado do celular ou a barra
          do navegador podiam empurrar o botao de enviar pra fora da area
          visivel sem deixar claro que dava pra rolar até ele. */}
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-lg">Sou proprietário</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-sm text-gray-500 mb-4">Confirme e atualize os dados do seu negócio. Sua solicitação passa por uma revisão antes de valer.</p>

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
              <label className="text-xs text-gray-500">Nome do negócio *</label>
              <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Categoria</label>
              <select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
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

function ModalCompletarCadastro({ comercio, onFechar, onSalvo }: {
  comercio: Comercio; onFechar: () => void; onSalvo: () => void;
}) {
  const ehServicos = comercio.modulo === "servicos";
  const [foto, setFoto] = useState(comercio.foto || "");
  const [itens, setItens] = useState<ItemCatalogo[]>(comercio.catalogo?.length ? comercio.catalogo : [{ nome: "", preco: null, descricao: "" }]);
  const [salvando, setSalvando] = useState(false);

  const setItem = (i: number, patch: Partial<ItemCatalogo>) => {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const adicionarItem = () => setItens((prev) => [...prev, { nome: "", preco: null, descricao: "" }]);
  const removerItem = (i: number) => setItens((prev) => prev.filter((_, idx) => idx !== i));

  const salvar = async () => {
    const validos = itens.filter((it) => it.nome.trim());
    if (validos.length === 0) {
      toast.error(ehServicos ? "Cadastre pelo menos um serviço oferecido" : "Cadastre pelo menos um item à venda");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch(`/api/comercios-diretorio?id=${comercio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto, catalogo: validos }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Cadastro completo! Seu negócio já aparece com catálogo no diretório.");
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
          <h2 className="font-bold text-lg">Completar cadastro</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <p className="text-sm text-gray-500">
            {comercio.nome} já está confirmado. Agora adicione a foto da fachada e {ehServicos ? "os serviços que você oferece" : "os itens que você vende"} pra atrair mais clientes.
          </p>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Foto da fachada</label>
            <FotoFachadaUploader value={foto} onChange={setFoto} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">{ehServicos ? "Serviços oferecidos *" : "Itens à venda *"}</label>
            <div className="space-y-2">
              {itens.map((item, i) => (
                <div key={i} className="border rounded-lg p-2.5 space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      value={item.nome}
                      onChange={(e) => setItem(i, { nome: e.target.value })}
                      placeholder={ehServicos ? "Ex: Corte de cabelo" : "Ex: Arroz 5kg"}
                      className="flex-1 border rounded-lg px-2.5 py-1.5 text-sm"
                    />
                    <input
                      type="number"
                      value={item.preco ?? ""}
                      onChange={(e) => setItem(i, { preco: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="R$"
                      className="w-20 border rounded-lg px-2.5 py-1.5 text-sm"
                    />
                    <button onClick={() => removerItem(i)} className="text-gray-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <input
                    value={item.descricao}
                    onChange={(e) => setItem(i, { descricao: e.target.value })}
                    placeholder="Detalhe opcional (marca, tamanho, duração...)"
                    className="w-full border rounded-lg px-2.5 py-1.5 text-xs text-gray-600"
                  />
                </div>
              ))}
            </div>
            <button onClick={adicionarItem} className="mt-2 flex items-center gap-1.5 text-blue-600 text-sm font-medium">
              <Plus className="w-4 h-4" /> {ehServicos ? "Adicionar serviço" : "Adicionar item"}
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-t shrink-0">
          <button onClick={salvar} disabled={salvando} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold disabled:opacity-60">
            {salvando ? "Salvando..." : "Salvar e publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
