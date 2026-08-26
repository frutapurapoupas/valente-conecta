"use client";

// Caminho: C:\valente_conecta\app\pdv\etiquetas\page.tsx
//
// Impressao de etiquetas de codigo de barras (item 5 do backlog levantado
// contra o concorrente) -- resolve um problema real: produto sem EAN
// fisico de fabrica nao tinha como virar etiqueta pra colar na prateleira.
// Gera o codigo de barras (Code128, aceita qualquer texto/numero) direto
// no navegador com jsbarcode, embute como imagem no HTML de impressao --
// nao depende de internet na hora de imprimir, mesmo padrao de
// window.open+print ja usado no cupom (FrenteCaixaDesktop.tsx).
//
// Qual codigo vai em cada etiqueta segue lib/pdv/agruparPorCatalogo.ts
// (codigoParaEtiqueta): EAN quando o produto nao tem variacao, id da
// propria linha de estoque quando tem -- porque o EAN fica no catalogo,
// compartilhado entre variantes, e nao identificaria qual delas foi
// escaneada. FrenteCaixaDesktop.tsx ja sabe ler esse id como fallback.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import JsBarcode from "jsbarcode";
import { ArrowLeft, Tag, Search, Minus, Plus, Printer } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import { agruparPorCatalogo, codigoParaEtiqueta } from "@/lib/pdv/agruparPorCatalogo";
import type { ProdutoPDV } from "@/lib/pdv/frenteCaixaTypes";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function gerarBarcodeDataUrl(codigo: string): string | null {
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, codigo, { format: "CODE128", width: 2, height: 44, displayValue: false, margin: 0 });
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export default function PdvEtiquetasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);
  const [produtos, setProdutos] = useState<ProdutoPDV[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [colunas, setColunas] = useState<2 | 3>(3);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (!u) { setLoading(false); return; }
    fetch(`/api/pdv/estoque?usuarioId=${u.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) {
          setProdutos(
            resp.data
              .filter((item: any) => item.ativo !== false)
              .map((item: any) => ({
                estoqueId: item.id,
                catalogoId: item.catalogo_id,
                ean: item.produto?.ean || null,
                nome: item.produto?.nome || "Produto",
                variante: item.variante || "",
                preco: Number(item.preco_venda) || 0,
                fotoUrl: item.produto?.foto_url || null,
                categoria: item.produto?.categoria || item.produto?.segmento || "Geral",
                unidade: item.produto?.unidade || null,
                estoque: Number(item.quantidade) || 0,
                estoqueMinimo: Number(item.estoque_minimo) || 0,
                validade: item.validade || null,
              }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const grupos = useMemo(() => agruparPorCatalogo(produtos), [produtos]);

  const produtosFiltrados = produtos.filter((p) => !busca.trim() || p.nome.toLowerCase().includes(busca.toLowerCase()));

  const selecionados = Object.entries(quantidades).filter(([, qtd]) => qtd > 0);
  const totalEtiquetas = selecionados.reduce((soma, [, qtd]) => soma + qtd, 0);

  const alternarSelecao = (estoqueId: string) => {
    setQuantidades((prev) => {
      const atual = prev[estoqueId] || 0;
      return { ...prev, [estoqueId]: atual > 0 ? 0 : 1 };
    });
  };

  const mudarQuantidade = (estoqueId: string, delta: number) => {
    setQuantidades((prev) => ({ ...prev, [estoqueId]: Math.max(0, (prev[estoqueId] || 0) + delta) }));
  };

  const gerarEtiquetas = () => {
    if (selecionados.length === 0) return;
    setGerando(true);
    try {
      const blocos: string[] = [];
      for (const [estoqueId, qtd] of selecionados) {
        const produto = produtos.find((p) => p.estoqueId === estoqueId);
        if (!produto) continue;
        const tamanhoGrupo = grupos.get(produto.catalogoId || `sem-catalogo:${produto.estoqueId}`)?.length || 1;
        const codigo = codigoParaEtiqueta(produto, tamanhoGrupo);
        const barcodeUrl = gerarBarcodeDataUrl(codigo);
        if (!barcodeUrl) continue;
        const nomeExibido = produto.variante ? `${produto.nome} (${produto.variante})` : produto.nome;
        const etiqueta = `
          <div class="etiqueta">
            <p class="nome">${nomeExibido}</p>
            <p class="preco">${formatarMoeda(produto.preco)}</p>
            <img src="${barcodeUrl}" />
            <p class="codigo">${codigo}</p>
          </div>`;
        for (let i = 0; i < qtd; i++) blocos.push(etiqueta);
      }

      if (blocos.length === 0) {
        toast.error("Nenhuma etiqueta pôde ser gerada");
        return;
      }

      const win = window.open("", "_blank");
      if (!win) { toast.error("O navegador bloqueou a janela de impressão"); return; }
      win.document.write(`
        <!DOCTYPE html><html><head><title>Etiquetas</title><style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 10mm; }
          .folha { display: grid; grid-template-columns: repeat(${colunas}, 1fr); gap: 3mm; }
          .etiqueta {
            border: 1px dashed #ccc; border-radius: 4px; padding: 3mm;
            text-align: center; page-break-inside: avoid;
          }
          .nome { font-size: 10px; font-weight: bold; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .preco { font-size: 13px; font-weight: bold; margin: 0 0 2px; }
          .codigo { font-size: 9px; color: #555; margin: 2px 0 0; }
          img { width: 100%; max-height: 44px; }
          @media print { .etiqueta { border: none; } }
        </style></head><body>
          <div class="folha">${blocos.join("")}</div>
        </body></html>
      `);
      win.document.close();
      win.focus();
      win.print();
    } finally {
      setGerando(false);
    }
  };

  if (!usuario && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-600">Complete seu cadastro pra imprimir etiquetas.</p>
      </div>
    );
  }

  if (operador && !temPermissao(operador, "etiquetas")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><Tag className="w-5 h-5 text-blue-600" /> Etiquetas</h1>
      </header>
      <PdvSubNav ativa="etiquetas" operador={operador} />

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-8">Carregando...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Nenhum produto encontrado.</p>
        ) : (
          <div className="space-y-2">
            {produtosFiltrados.map((p) => {
              const qtd = quantidades[p.estoqueId] || 0;
              return (
                <div key={p.estoqueId} className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${qtd > 0 ? "border-blue-400" : ""}`}>
                  <button onClick={() => alternarSelecao(p.estoqueId)} className={`w-5 h-5 rounded border shrink-0 ${qtd > 0 ? "bg-blue-600 border-blue-600" : "border-gray-300"}`} />
                  <div className="flex-1 min-w-0" onClick={() => alternarSelecao(p.estoqueId)}>
                    <p className="text-sm font-medium text-gray-800 truncate">{p.nome}{p.variante ? ` — ${p.variante}` : ""}</p>
                    <p className="text-sm text-gray-500">{formatarMoeda(p.preco)}</p>
                  </div>
                  {qtd > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => mudarQuantidade(p.estoqueId, -1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Minus className="w-3 h-3" /></button>
                      <span className="w-6 text-center text-sm font-medium">{qtd}</span>
                      <button onClick={() => mudarQuantidade(p.estoqueId, 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalEtiquetas > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center gap-3 z-40">
          <select value={colunas} onChange={(e) => setColunas(Number(e.target.value) as 2 | 3)} className="px-2 py-2.5 border rounded-xl text-sm shrink-0">
            <option value={2}>2 colunas</option>
            <option value={3}>3 colunas</option>
          </select>
          <button
            onClick={gerarEtiquetas}
            disabled={gerando}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir {totalEtiquetas} etiqueta{totalEtiquetas === 1 ? "" : "s"}
          </button>
        </div>
      )}
    </div>
  );
}
