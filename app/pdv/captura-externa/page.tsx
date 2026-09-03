"use client";

// Caminho: C:\valente_conecta\app\pdv\captura-externa\page.tsx
//
// "Modo espião": pro comerciante que já usa outro sistema de PDV e quer
// alimentar o Valente Conecta em paralelo, sem trocar de sistema. Fluxo
// hoje é manual (fotografa a tela do PDV dele, digita rapidinho o que a
// foto mostra, confirma) — a foto fica de referência/auditoria. Quando um
// reconhecimento automático (OCR) for viável, ele preenche o mesmo campo
// que hoje é preenchido a mão, sem mudança de schema (ver migration
// 049_pdv_captura_externa.sql).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, Package, DollarSign, X, Check, Trash2, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

interface Captura {
  id: string;
  tipo: "produto" | "venda";
  foto_url: string;
  dados: Record<string, any>;
  status: "pendente" | "aplicado" | "descartado";
  created_at: string;
}

export default function CapturaExternaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [ativo, setAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [capturas, setCapturas] = useState<Captura[]>([]);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);

  const [novaFoto, setNovaFoto] = useState<MidiaItem[]>([]);
  const [novoTipo, setNovoTipo] = useState<"produto" | "venda">("produto");
  const [criandoCaptura, setCriandoCaptura] = useState(false);

  const [preenchendo, setPreenchendo] = useState<Captura | null>(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [descricaoVenda, setDescricaoVenda] = useState("");
  const [valorVenda, setValorVenda] = useState<number | "">("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async (usuarioId: string) => {
    const [modoResp, capturasResp] = await Promise.all([
      fetch(`/api/pdv/modo-externo?usuarioId=${usuarioId}`).then((r) => r.json()),
      fetch(`/api/pdv/capturas?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    if (modoResp.success) setAtivo(modoResp.data.ativo);
    if (capturasResp.success) setCapturas(capturasResp.data);
    setLoading(false);
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) carregar(u.id);
    else setLoading(false);
  }, []);

  const alternarModo = async () => {
    if (!usuario) return;
    const novoValor = !ativo;
    setAtivo(novoValor);
    await fetch("/api/pdv/modo-externo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuario.id, ativo: novoValor }),
    });
  };

  const registrarCaptura = async () => {
    if (!usuario || novaFoto.length === 0) {
      toast.error("Tire ou escolha uma foto primeiro.");
      return;
    }
    setCriandoCaptura(true);
    try {
      const resp = await fetch("/api/pdv/capturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, tipo: novoTipo, fotoUrl: novaFoto[0].url }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Foto guardada! Agora preenche rapidinho o que ela mostra.");
      setNovaFoto([]);
      carregar(usuario.id);
      setPreenchendo(resultado.data);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar");
    } finally {
      setCriandoCaptura(false);
    }
  };

  const abrirPreenchimento = (c: Captura) => {
    setPreenchendo(c);
    setNome(c.dados?.nome || "");
    setPreco(c.dados?.preco ?? "");
    setQuantidade(c.dados?.quantidade ?? "");
    setDescricaoVenda(c.dados?.descricao || "");
    setValorVenda(c.dados?.valor ?? "");
  };

  const confirmarAplicar = async () => {
    if (!usuario || !preenchendo) return;
    setSalvando(true);
    try {
      let referenciaId: string;

      if (preenchendo.tipo === "produto") {
        if (!nome.trim() || !preco || Number(preco) <= 0) throw new Error("Preencha nome e preço.");
        const catalogoResp = await fetch("/api/pdv/catalogo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: nome.trim(), segmento: "geral", criadoPor: usuario.id }),
        }).then((r) => r.json());
        if (!catalogoResp.success) throw new Error(catalogoResp.error);

        const estoqueResp = await fetch("/api/pdv/estoque", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId: usuario.id,
            catalogoId: catalogoResp.data.id,
            precoVenda: Number(preco),
            quantidade: Number(quantidade) || 0,
          }),
        }).then((r) => r.json());
        if (!estoqueResp.success) throw new Error(estoqueResp.error);
        referenciaId = estoqueResp.data.id;
      } else {
        if (!descricaoVenda.trim() || !valorVenda || Number(valorVenda) <= 0) throw new Error("Preencha descrição e valor.");
        const caixaResp = await fetch("/api/pdv/caixa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId: usuario.id, tipo: "entrada", descricao: descricaoVenda.trim(), valor: Number(valorVenda) }),
        }).then((r) => r.json());
        if (!caixaResp.success) throw new Error(caixaResp.error);
        referenciaId = caixaResp.data.id;
      }

      await fetch(`/api/pdv/capturas?id=${preenchendo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "aplicado",
          referenciaId,
          dados: preenchendo.tipo === "produto" ? { nome, preco, quantidade } : { descricao: descricaoVenda, valor: valorVenda },
        }),
      });

      toast.success("Aplicado no sistema!");
      setPreenchendo(null);
      carregar(usuario.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao aplicar");
    } finally {
      setSalvando(false);
    }
  };

  const descartar = async (id: string) => {
    if (!usuario) return;
    await fetch(`/api/pdv/capturas?id=${id}`, { method: "DELETE" });
    carregar(usuario.id);
  };

  const pendentes = capturas.filter((c) => c.status === "pendente");

  if (!loading && !usuario) {
    return <div className="max-w-md mx-auto p-6 text-center text-gray-500">Complete seu cadastro no app pra usar essa área.</div>;
  }

  if (operador && !temPermissao(operador, "captura-externa")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><Eye className="w-5 h-5 text-blue-600" /> Captura por Foto</h1>
      </header>
      <PdvSubNav ativa="captura-externa" operador={operador} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Já uso outro sistema de PDV</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {ativo ? "Ativo — fotografe a tela do seu sistema e alimente o Valente Conecta em paralelo." : "Desligado."}
              </p>
            </div>
            <button
              onClick={alternarModo}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${ativo ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${ativo ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>

        {ativo && (
          <>
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5"><Camera className="w-4 h-4 text-blue-500" /> Nova captura</h3>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setNovoTipo("produto")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${novoTipo === "produto" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  <Package className="w-4 h-4" /> Produto
                </button>
                <button
                  onClick={() => setNovoTipo("venda")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${novoTipo === "venda" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  <DollarSign className="w-4 h-4" /> Venda
                </button>
              </div>
              <MidiaUploader midia={novaFoto} onChange={setNovaFoto} maximo={1} preferirCamera />
              <button
                onClick={registrarCaptura}
                disabled={criandoCaptura || novaFoto.length === 0}
                className="w-full mt-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60"
              >
                {criandoCaptura ? "Salvando..." : "Guardar foto e preencher"}
              </button>
            </div>

            {pendentes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Pendentes de preenchimento ({pendentes.length})</h3>
                <div className="space-y-2">
                  {pendentes.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl shadow p-3 flex items-center gap-3">
                      <img src={c.foto_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{c.tipo === "produto" ? "Produto" : "Venda"}</p>
                        <p className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString("pt-BR")}</p>
                      </div>
                      <button onClick={() => abrirPreenchimento(c)} className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Preencher"><Check className="w-4 h-4" /></button>
                      <button onClick={() => descartar(c.id)} className="p-2 text-gray-400 hover:text-red-600" title="Descartar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {preenchendo && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">O que a foto mostra?</h2>
              <button onClick={() => setPreenchendo(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <img src={preenchendo.foto_url} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />

            {preenchendo.tipo === "produto" ? (
              <div className="space-y-2">
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do produto" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Preço de venda" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input type="number" step="1" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Quantidade" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            ) : (
              <div className="space-y-2">
                <input value={descricaoVenda} onChange={(e) => setDescricaoVenda(e.target.value)} placeholder="Descrição da venda" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input type="number" step="0.01" min="0" value={valorVenda} onChange={(e) => setValorVenda(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Valor" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            )}

            <button onClick={confirmarAplicar} disabled={salvando} className="w-full mt-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-60">
              {salvando ? "Aplicando..." : "Confirmar e aplicar no sistema"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
