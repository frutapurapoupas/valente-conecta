"use client";

// Caminho: C:\valente_conecta\app\pdv\estoque\page.tsx
//
// Estoque do comerciante, ligado ao catalogo colaborativo do PDV (ver
// 038_pdv_catalogo_colaborativo.sql). Cadastro de produto novo segue a
// ordem pedida: nome -> apelido -> foto de exibicao -> tenta capturar o
// codigo de barras (camera ou leitor optico) -> se achou EAN, casa direto
// com o catalogo; se nao tem EAN, sugere produtos parecidos ja cadastrados
// por outros comerciantes (pg_trgm) antes de criar um SKU novo do zero.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Barcode, Camera, Check, Edit2, Package, Plus, Search, Trash2, X,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
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

interface ItemEstoque {
  id: string;
  quantidade: number;
  preco_custo: number | null;
  preco_venda: number;
  estoque_minimo: number;
  validade: string | null;
  variante: string;
  ativo: boolean;
  produto: { id: string; nome: string; ean: string | null; sku: string; segmento: string; categoria: string | null; unidade: string; foto_url: string | null };
}

interface LinhaVariante {
  nome: string;
  quantidade: number;
}

function diasParaVencer(validade: string | null): number | null {
  if (!validade) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dataValidade = new Date(validade + "T00:00:00");
  return Math.round((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

type Etapa = "fechado" | "nome" | "foto" | "codigo" | "sugestoes" | "preco";

export default function PdvEstoquePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);

  const [etapa, setEtapa] = useState<Etapa>("fechado");
  const [salvando, setSalvando] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [segmento, setSegmento] = useState(() => (typeof window !== "undefined" && localStorage.getItem("pdv_segmento")) || "mercado");
  const [midia, setMidia] = useState<MidiaItem[]>([]);
  const [ean, setEan] = useState("");
  const [catalogoId, setCatalogoId] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [quantidade, setQuantidade] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);
  const [precoCusto, setPrecoCusto] = useState<number | "">("");
  const [estoqueMinimo, setEstoqueMinimo] = useState(0);
  const [validade, setValidade] = useState("");
  const [temVariacao, setTemVariacao] = useState(false);
  const [variantes, setVariantes] = useState<LinhaVariante[]>([{ nome: "", quantidade: 0 }]);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) carregar(u.id);
    else setLoading(false);
  }, []);

  const carregar = async (usuarioId: string) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/pdv/estoque?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json());
      setItens(resp.success ? resp.data : []);
    } finally {
      setLoading(false);
    }
  };

  const resetarFormulario = () => {
    setEtapa("fechado");
    setEditandoId(null);
    setNome("");
    setApelido("");
    setMidia([]);
    setEan("");
    setCatalogoId(null);
    setSugestoes([]);
    setQuantidade(0);
    setPrecoVenda(0);
    setPrecoCusto("");
    setEstoqueMinimo(0);
    setValidade("");
    setTemVariacao(false);
    setVariantes([{ nome: "", quantidade: 0 }]);
  };

  const iniciarNovoProduto = () => {
    resetarFormulario();
    setEtapa("nome");
  };

  const avancarParaFoto = () => {
    if (!nome.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    localStorage.setItem("pdv_segmento", segmento);
    setEtapa("foto");
  };

  const avancarParaCodigo = () => setEtapa("codigo");

  const buscarPorEan = async (codigo: string) => {
    setShowScanner(false);
    setEan(codigo);
    const toastId = toast.loading("Consultando o catálogo...");
    try {
      const resp = await fetch(`/api/pdv/catalogo/buscar-externo?ean=${encodeURIComponent(codigo)}`).then((r) => r.json());
      toast.dismiss(toastId);
      if (resp.success && resp.data) {
        toast.success(
          resp.origem === "kodebar"
            ? `Achamos "${resp.data.nome}" numa base externa — foto já vem preenchida!`
            : `Produto já existe no catálogo: ${resp.data.nome}`
        );
        setCatalogoId(resp.data.id);
        setNome(resp.data.nome);
        setEtapa("preco");
      } else {
        toast.success("Código capturado! Vamos criar esse produto no catálogo.");
        setEtapa("preco");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Erro ao consultar o catálogo");
    }
  };

  const pularCodigoDeBarras = async () => {
    setEan("");
    setBuscandoSugestoes(true);
    setEtapa("sugestoes");
    try {
      const termoBusca = apelido.trim() || nome.trim();
      const resp = await fetch(`/api/pdv/catalogo/buscar-similar?nome=${encodeURIComponent(termoBusca)}&segmento=${segmento}`).then((r) => r.json());
      setSugestoes(resp.success ? resp.data : []);
    } finally {
      setBuscandoSugestoes(false);
    }
  };

  const escolherSugestao = async (sugestao: any) => {
    setCatalogoId(sugestao.catalogo_id);
    if (apelido.trim()) {
      await fetch("/api/pdv/catalogo/apelido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogoId: sugestao.catalogo_id, apelido: apelido.trim(), usuarioId: usuario?.id }),
      }).catch(() => {});
    }
    toast.success(`Usando o produto já cadastrado: ${sugestao.nome}`);
    setEtapa("preco");
  };

  const criarProdutoNovo = () => {
    setCatalogoId(null);
    setEtapa("preco");
  };

  const finalizar = async () => {
    if (!usuario) return;
    if (precoVenda <= 0) {
      toast.error("Informe o preço de venda");
      return;
    }
    let variantesValidas: LinhaVariante[] = [];
    if (temVariacao) {
      variantesValidas = variantes.map((v) => ({ nome: v.nome.trim(), quantidade: v.quantidade }));
      if (variantesValidas.some((v) => !v.nome)) {
        toast.error("Preencha o nome de todas as variações (ex: tamanho, cor)");
        return;
      }
      const nomesUnicos = new Set(variantesValidas.map((v) => v.nome.toLowerCase()));
      if (nomesUnicos.size !== variantesValidas.length) {
        toast.error("Tem variações com o mesmo nome — cada uma precisa ser única");
        return;
      }
    }

    setSalvando(true);
    try {
      let idCatalogo = catalogoId;

      if (!idCatalogo) {
        const respCatalogo = await fetch("/api/pdv/catalogo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            segmento,
            ean: ean.trim() || null,
            fotoUrl: midia[0]?.url || null,
            criadoPor: usuario.id,
          }),
        }).then((r) => r.json());
        if (!respCatalogo.success) throw new Error(respCatalogo.error);
        idCatalogo = respCatalogo.data.id;

        if (apelido.trim()) {
          await fetch("/api/pdv/catalogo/apelido", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ catalogoId: idCatalogo, apelido: apelido.trim(), usuarioId: usuario.id }),
          }).catch(() => {});
        }
      }

      const linhas = temVariacao ? variantesValidas : [{ nome: "", quantidade }];
      for (const linha of linhas) {
        const respEstoque = await fetch("/api/pdv/estoque", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId: usuario.id,
            catalogoId: idCatalogo,
            variante: linha.nome,
            quantidade: linha.quantidade,
            precoVenda,
            precoCusto: precoCusto === "" ? null : precoCusto,
            estoqueMinimo,
            validade: validade || null,
          }),
        }).then((r) => r.json());
        if (!respEstoque.success) throw new Error(respEstoque.error);
      }

      toast.success("Produto salvo no estoque!");
      resetarFormulario();
      carregar(usuario.id);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar produto");
    } finally {
      setSalvando(false);
    }
  };

  const editarItem = (item: ItemEstoque) => {
    setEditandoId(item.id);
    setNome(item.variante ? `${item.produto.nome} (${item.variante})` : item.produto.nome);
    setCatalogoId(item.produto.id);
    setEan(item.produto.ean || "");
    setQuantidade(item.quantidade);
    setPrecoVenda(item.preco_venda);
    setPrecoCusto(item.preco_custo ?? "");
    setEstoqueMinimo(item.estoque_minimo);
    setValidade(item.validade || "");
    setEtapa("preco");
  };

  const salvarEdicao = async () => {
    if (!editandoId) return;
    setSalvando(true);
    try {
      const resp = await fetch(`/api/pdv/estoque?id=${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade, precoVenda, precoCusto: precoCusto === "" ? null : precoCusto, estoqueMinimo, validade: validade || null }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      toast.success("Item atualizado!");
      resetarFormulario();
      carregar(usuario.id);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar");
    } finally {
      setSalvando(false);
    }
  };

  const excluirItem = async (id: string) => {
    if (!confirm("Remover este item do seu estoque?")) return;
    const resp = await fetch(`/api/pdv/estoque?id=${id}`, { method: "DELETE" }).then((r) => r.json());
    if (resp.success) {
      toast.success("Item removido");
      carregar(usuario.id);
    } else {
      toast.error(resp.error || "Erro ao remover");
    }
  };

  const itensFiltrados = itens.filter((i) => !busca.trim() || i.produto.nome.toLowerCase().includes(busca.toLowerCase()) || i.produto.sku.toLowerCase().includes(busca.toLowerCase()));

  if (!usuario && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-600">Complete seu cadastro para gerenciar seu estoque.</p>
      </div>
    );
  }

  if (operador && !temPermissao(operador, "estoque")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Meu Estoque</h1>
      </header>
      <PdvSubNav ativa="estoque" operador={operador} />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou SKU"
            className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : itensFiltrados.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum item no estoque ainda.</p>
        ) : (
          <div className="space-y-2">
            {itensFiltrados.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-3 flex items-center gap-3">
                {item.produto.foto_url ? (
                  <img src={item.produto.foto_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package className="w-6 h-6 text-gray-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.produto.nome}{item.variante ? ` — ${item.variante}` : ""}</p>
                  <p className="text-xs text-gray-400">{item.produto.ean ? `EAN ${item.produto.ean}` : `SKU ${item.produto.sku}`} · {item.quantidade} {item.produto.unidade}</p>
                  <p className="text-sm font-semibold text-green-600">R$ {Number(item.preco_venda).toFixed(2)}</p>
                  {(() => {
                    const dias = diasParaVencer(item.validade);
                    if (dias === null) return null;
                    if (dias < 0) return <p className="text-xs font-medium text-red-600">Vencido há {Math.abs(dias)} dia{Math.abs(dias) === 1 ? "" : "s"}</p>;
                    if (dias <= 7) return <p className="text-xs font-medium text-amber-600">Vence em {dias} dia{dias === 1 ? "" : "s"}</p>;
                    return null;
                  })()}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => editarItem(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => excluirItem(item.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={iniciarNovoProduto}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl"
      >
        <Plus className="w-6 h-6" />
      </button>

      {etapa !== "fechado" && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center sm:justify-center">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editandoId ? "Editar item" : "Novo produto"}</h2>
              <button onClick={resetarFormulario}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {etapa === "nome" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome do produto</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Refrigerante Coca-Cola 2L" className="w-full mt-1 px-3 py-2.5 border rounded-xl" autoFocus />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Como é conhecido? (apelido, opcional)</label>
                  <input value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Ex: coquinha" className="w-full mt-1 px-3 py-2.5 border rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Segmento</label>
                  <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className="w-full mt-1 px-3 py-2.5 border rounded-xl">
                    {SEGMENTOS.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
                <button onClick={avancarParaFoto} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">Continuar</button>
              </div>
            )}

            {etapa === "foto" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Foto de exibição no catálogo (opcional, mas ajuda muito).</p>
                <MidiaUploader midia={midia} onChange={setMidia} maximo={1} />
                <button onClick={avancarParaCodigo} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold">Continuar</button>
              </div>
            )}

            {etapa === "codigo" && (
              <div className="space-y-4 text-center">
                <Barcode className="w-12 h-12 text-blue-600 mx-auto" />
                <p className="text-sm text-gray-600">Esse produto tem código de barras? Escaneie pra gente já saber se ele existe no catálogo.</p>
                <button onClick={() => setShowScanner(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" /> Escanear código de barras
                </button>
                <button onClick={pularCodigoDeBarras} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">Não tem código de barras</button>
              </div>
            )}

            {etapa === "sugestoes" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Encontramos produtos parecidos já cadastrados. É algum destes?</p>
                {buscandoSugestoes ? (
                  <p className="text-sm text-gray-400 text-center py-6">Buscando...</p>
                ) : sugestoes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum produto parecido encontrado.</p>
                ) : (
                  <div className="space-y-2">
                    {sugestoes.map((s) => (
                      <button key={s.catalogo_id} onClick={() => escolherSugestao(s)} className="w-full flex items-center gap-3 border rounded-xl p-2.5 hover:border-blue-400 text-left">
                        {s.foto_url ? <img src={s.foto_url} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.nome}</p>
                          <p className="text-xs text-gray-400">SKU {s.sku}</p>
                        </div>
                        <Check className="w-4 h-4 text-gray-300" />
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={criarProdutoNovo} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">Nenhum desses, é um produto novo</button>
              </div>
            )}

            {etapa === "preco" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{nome}</p>

                {!editandoId && (
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={temVariacao} onChange={(e) => setTemVariacao(e.target.checked)} className="w-4 h-4" />
                    Tem variação de tamanho/cor?
                  </label>
                )}

                {temVariacao && !editandoId ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Variações e quantidade de cada uma</label>
                    {variantes.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={v.nome}
                          onChange={(e) => setVariantes((prev) => prev.map((row, i) => (i === idx ? { ...row, nome: e.target.value } : row)))}
                          placeholder="Ex: 38, GG, Azul"
                          className="flex-1 px-3 py-2.5 border rounded-xl"
                        />
                        <input
                          type="number" step="0.001"
                          value={v.quantidade || ""}
                          onChange={(e) => setVariantes((prev) => prev.map((row, i) => (i === idx ? { ...row, quantidade: parseFloat(e.target.value) || 0 } : row)))}
                          placeholder="Qtd"
                          className="w-20 px-3 py-2.5 border rounded-xl"
                        />
                        {variantes.length > 1 && (
                          <button onClick={() => setVariantes((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setVariantes((prev) => [...prev, { nome: "", quantidade: 0 }])} className="text-sm text-blue-600 font-medium">+ Adicionar variação</button>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Quantidade em estoque</label>
                    <input type="number" step="0.001" value={quantidade || ""} onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2.5 border rounded-xl" />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Preço de venda</label>
                  <input type="number" step="0.01" value={precoVenda || ""} onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2.5 border rounded-xl" autoFocus />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Preço de custo (opcional)</label>
                  <input type="number" step="0.01" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value === "" ? "" : parseFloat(e.target.value))} className="w-full mt-1 px-3 py-2.5 border rounded-xl" />
                </div>
                {precoCusto !== "" && precoVenda > 0 && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Lucro por unidade</span>
                    <span className={`font-semibold ${precoVenda - precoCusto < 0 ? "text-red-600" : "text-green-600"}`}>
                      R$ {(precoVenda - precoCusto).toFixed(2)} ({(((precoVenda - precoCusto) / precoVenda) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Estoque mínimo (opcional)</label>
                  <input type="number" step="0.001" value={estoqueMinimo || ""} onChange={(e) => setEstoqueMinimo(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2.5 border rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Validade (opcional)</label>
                  <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} className="w-full mt-1 px-3 py-2.5 border rounded-xl" />
                </div>
                <button
                  onClick={editandoId ? salvarEdicao : finalizar}
                  disabled={salvando}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showScanner && <BarcodeScanner onDetected={buscarPorEan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
