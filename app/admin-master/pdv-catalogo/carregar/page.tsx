"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv-catalogo\carregar\page.tsx
//
// Carregamento em lote do catálogo colaborativo do PDV (038) pelo admin
// master -- pensado pra popular o banco com produtos encontrados pela
// cidade antes do lançamento, sem precisar de um lojista dono do estoque.
// Cria só o registro de CATÁLOGO (nome/segmento/EAN/foto), sem
// pdv_estoque_itens -- é o mesmo POST /api/pdv/catalogo que o cadastro do
// lojista usa (ver app/pdv/estoque), só que sem passar pela etapa de
// preço/quantidade. Mesmo fluxo de identificação por foto + confirmação
// com imagem: foto geral -> IA tenta reconhecer -> código de barras ->
// confirma (com foto) se já existe -> nome final -> salva e já reseta pro
// próximo produto, pra dar pra ir em sequência rápida.

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Barcode, Camera, Package, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

const SEGMENTOS = [
  { id: "mercado", nome: "Mercado / Mercearia" },
  { id: "farmacia", nome: "Farmácia" },
  { id: "auto_pecas", nome: "Auto Peças" },
  { id: "acougue", nome: "Açougue" },
  { id: "moda", nome: "Moda / Roupas" },
  { id: "papelaria", nome: "Papelaria" },
  { id: "geral", nome: "Outro" },
];

type Etapa = "foto" | "codigo" | "confirmarCatalogo" | "nome";

export default function CarregarCatalogoAdminPage() {
  const router = useRouter();
  const admin = getCurrentUser();

  const [etapa, setEtapa] = useState<Etapa>("foto");
  const [contador, setContador] = useState(0);
  const [midia, setMidia] = useState<MidiaItem[]>([]);
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState("mercado");
  const [ean, setEan] = useState("");
  const [identificando, setIdentificando] = useState(false);
  const [iaConfianca, setIaConfianca] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [catalogoMatch, setCatalogoMatch] = useState<{ id: string; nome: string; foto_url: string | null; sku: string; ean: string | null } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const resetarProximoProduto = () => {
    setEtapa("foto");
    setMidia([]);
    setNome("");
    setEan("");
    setIdentificando(false);
    setIaConfianca(null);
    setCatalogoMatch(null);
  };

  const avancarParaCodigo = async () => {
    if (!midia[0]?.url) {
      toast.error("Tire uma foto do produto primeiro");
      return;
    }
    setIdentificando(true);
    try {
      const blob = await fetch(midia[0].url).then((r) => r.blob());
      const formData = new FormData();
      formData.append("arquivo", blob, "produto.jpg");
      const resp = await fetch("/api/pdv/catalogo/identificar-produto", { method: "POST", body: formData }).then((r) => r.json());
      if (resp.success && resp.nome) {
        setNome(resp.nome);
        setIaConfianca(resp.confianca);
        if (resp.segmento) setSegmento(resp.segmento);
        toast.success(`IA reconheceu: "${resp.nome}"`);
      }
    } catch {
      // segue sem travar
    } finally {
      setIdentificando(false);
      setEtapa("codigo");
    }
  };

  const buscarPorEan = async (codigo: string) => {
    setShowScanner(false);
    setEan(codigo);
    const toastId = toast.loading("Consultando o catálogo...");
    try {
      const resp = await fetch(`/api/pdv/catalogo/buscar-externo?ean=${encodeURIComponent(codigo)}`).then((r) => r.json());
      toast.dismiss(toastId);
      if (resp.success && resp.data) {
        setCatalogoMatch(resp.data);
        setEtapa("confirmarCatalogo");
      } else {
        toast.success("Código capturado! Vamos criar esse produto no catálogo.");
        setEtapa("nome");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Erro ao consultar o catálogo");
    }
  };

  const jaExisteNoCatalogo = () => {
    toast("Esse produto já está no catálogo — pulando pro próximo.", { icon: "✅" });
    resetarProximoProduto();
  };

  const naoEEsse = () => {
    setCatalogoMatch(null);
    setEtapa("nome");
  };

  const pularCodigoDeBarras = () => {
    setEan("");
    setEtapa("nome");
  };

  const salvarEContinuar = async () => {
    if (!admin?.id) {
      toast.error("Sessão de admin não encontrada.");
      return;
    }
    if (!nome.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/pdv/catalogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          segmento,
          ean: ean.trim() || null,
          fotoUrl: midia[0]?.url || null,
          criadoPor: admin.id,
        }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      toast.success(`"${nome.trim()}" salvo no catálogo!`);
      setContador((n) => n + 1);
      resetarProximoProduto();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar produto");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Toaster position="top-center" />
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-800 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Carregar catálogo</h1>
          <p className="text-sm text-gray-500">Adiciona produtos direto no catálogo colaborativo, sem loja dona do estoque.</p>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 text-emerald-700 text-sm font-medium">
          <ListChecks className="w-4 h-4" /> {contador} produto{contador === 1 ? "" : "s"} carregado{contador === 1 ? "" : "s"} nessa sessão
        </div>

        <div className="bg-white rounded-2xl border p-5">
          {etapa === "foto" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Tire uma foto do produto — a IA tenta reconhecer sozinha o que é.</p>
              <MidiaUploader midia={midia} onChange={setMidia} maximo={1} preferirCamera />
              <button onClick={avancarParaCodigo} disabled={identificando} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60">
                {identificando ? "Identificando..." : "Continuar"}
              </button>
            </div>
          )}

          {etapa === "codigo" && (
            <div className="space-y-4 text-center">
              <Barcode className="w-12 h-12 text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">Agora o código de barras, se tiver.</p>
              <button onClick={() => setShowScanner(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" /> Escanear código de barras
              </button>
              <button onClick={pularCodigoDeBarras} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">Não tem código de barras</button>
            </div>
          )}

          {etapa === "confirmarCatalogo" && catalogoMatch && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">Esse código já existe no catálogo. É esse produto?</p>
              <div className="border rounded-xl p-3 flex items-center gap-3">
                {catalogoMatch.foto_url ? (
                  <img src={catalogoMatch.foto_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package className="w-6 h-6 text-gray-400" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{catalogoMatch.nome}</p>
                  <p className="text-sm text-gray-500">{catalogoMatch.ean ? `EAN ${catalogoMatch.ean}` : `SKU ${catalogoMatch.sku}`}</p>
                </div>
              </div>
              {midia[0]?.url && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">A foto que você tirou:</p>
                  <img src={midia[0].url} alt="" className="w-16 h-16 rounded-lg object-cover mx-auto" />
                </div>
              )}
              <button onClick={jaExisteNoCatalogo} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">Sim, é esse — pular pro próximo</button>
              <button onClick={naoEEsse} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">Não, é outro produto</button>
            </div>
          )}

          {etapa === "nome" && (
            <div className="space-y-4">
              {iaConfianca === "baixa" && (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">A IA não teve certeza sobre esse produto — confira o nome antes de salvar.</p>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Nome do produto</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Refrigerante Coca-Cola 2L" className="w-full mt-1 px-3 py-2.5 border rounded-xl" autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Segmento</label>
                <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className="w-full mt-1 px-3 py-2.5 border rounded-xl">
                  {SEGMENTOS.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <button onClick={salvarEContinuar} disabled={salvando} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60">
                {salvando ? "Salvando..." : "Salvar e ir pro próximo produto"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner onDetected={buscarPorEan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
