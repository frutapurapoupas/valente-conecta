"use client";

// Caminho: C:\valente_conecta\components\pdv\FrenteCaixaDesktop.tsx
//
// Frente de caixa pra quem tem computador/notebook no balcão: grade de
// produtos + carrinho fixo do lado, pensado pra mouse e tela grande.
// Baseado no protótipo que já existia em app/pdv/page.tsx (layout já fazia
// sentido), agora com dado real (estoque/clientes vêm do shell em
// app/pdv/page.tsx) e visual mais refinado.

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, QrCode, DollarSign, User, Receipt, X, Search, Package,
} from "lucide-react";
import { useCarrinhoPdv } from "@/lib/pdv/useCarrinhoPdv";
import type { ClienteFiado, FormaPagamento, PropsFrenteCaixa } from "@/lib/pdv/frenteCaixaTypes";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function imprimirComprovante(itens: { nome: string; preco: number; quantidade: number }[], subtotal: number, desconto: number, total: number, cliente: ClienteFiado | null) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head><title>Comprovante</title><style>
      body{font-family:monospace;padding:20px;max-width:300px;margin:0 auto}
      h2{text-align:center;font-size:16px}
      .header{text-align:center;border-bottom:1px dashed #000;padding-bottom:10px;margin-bottom:10px}
      .item{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px}
      .total{border-top:1px dashed #000;padding-top:10px;margin-top:10px;font-weight:bold}
      .footer{text-align:center;border-top:1px dashed #000;padding-top:10px;margin-top:10px;font-size:10px}
    </style></head><body>
      <div class="header"><h2>VALENTE CONECTA</h2><p>Valente - BA<br>${new Date().toLocaleString("pt-BR")}</p></div>
      <div>${itens.map((i) => `<div class="item"><span>${i.nome}</span><span>${i.quantidade}x ${formatarMoeda(i.preco)}</span></div>`).join("")}</div>
      <div class="total">
        <div class="item"><span>SUBTOTAL:</span><span>${formatarMoeda(subtotal)}</span></div>
        ${desconto > 0 ? `<div class="item"><span>DESCONTO:</span><span>-${formatarMoeda(desconto)}</span></div>` : ""}
        <div class="item"><span>TOTAL:</span><span>${formatarMoeda(total)}</span></div>
      </div>
      <div class="footer"><p>Volte sempre!<br>${cliente ? `Cliente: ${cliente.nome}` : "Cliente: Consumidor Final"}</p></div>
    </body></html>
  `);
  win.print();
  win.close();
}

export function FrenteCaixaDesktop({ usuarioId, produtos, clientes, carregandoProdutos, onVendaFinalizada }: PropsFrenteCaixa) {
  const { carrinho, desconto, setDesconto, adicionar, atualizarQuantidade, removerItem, subtotal, total, finalizando, finalizarVenda } = useCarrinhoPdv(usuarioId);
  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteFiado | null>(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<FormaPagamento>("dinheiro");
  const [valorPago, setValorPago] = useState<number | "">("");

  const categorias = useMemo(() => Array.from(new Set(produtos.map((p) => p.categoria).filter(Boolean))), [produtos]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");

  const produtosFiltrados = produtos.filter((p) => {
    if (categoriaSelecionada !== "todos" && p.categoria !== categoriaSelecionada) return false;
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const confirmarPagamento = async (forcarLimite = false) => {
    if (metodoPagamento === "fiado" && !clienteSelecionado) {
      setShowModalPagamento(false);
      setShowModalCliente(true);
      return;
    }
    const itensParaImprimir = carrinho.map((i) => ({ nome: i.nome, preco: i.preco, quantidade: i.quantidade }));
    const subtotalAntes = subtotal;
    const descontoAntes = desconto;
    const totalAntes = total;
    const clienteAntes = clienteSelecionado;

    const resultado = await finalizarVenda({
      formaPagamento: metodoPagamento,
      cliente: clienteSelecionado,
      valorPago: metodoPagamento === "dinheiro" ? Number(valorPago || total) : undefined,
      forcarLimiteFiado: forcarLimite,
    });

    if (resultado.limiteExcedido) {
      toast((t) => (
        <div className="text-sm">
          <p className="font-medium">Cliente já deve {formatarMoeda(resultado.limiteExcedido!.saldoAtual)} de {formatarMoeda(resultado.limiteExcedido!.limite)} de limite.</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmarPagamento(true);
            }}
            className="mt-2 text-blue-600 underline"
          >
            Lançar assim mesmo
          </button>
        </div>
      ), { duration: 8000 });
      return;
    }
    if (!resultado.sucesso) {
      toast.error(resultado.erro || "Erro ao finalizar venda");
      return;
    }

    toast.success("Venda finalizada!");
    imprimirComprovante(itensParaImprimir, subtotalAntes, descontoAntes, totalAntes, clienteAntes);
    setShowModalPagamento(false);
    setClienteSelecionado(null);
    setValorPago("");
    setMetodoPagamento("dinheiro");
    onVendaFinalizada();
  };

  return (
    <div className="flex h-[calc(100vh-104px)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-5 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoriaSelecionada("todos")}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${categoriaSelecionada === "todos" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSelecionada(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${categoriaSelecionada === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {carregandoProdutos ? (
            <p className="text-sm text-gray-400 text-center py-12">Carregando estoque...</p>
          ) : produtosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {produtosFiltrados.map((p) => (
                <button
                  key={p.estoqueId}
                  onClick={() => adicionar(p)}
                  disabled={p.estoque < 1}
                  className="bg-white rounded-2xl p-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    {p.fotoUrl ? <img src={p.fotoUrl} alt="" className="w-full h-full object-cover" /> : <ShoppingCart className="w-7 h-7 text-gray-300" />}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                  <p className="text-base font-bold text-emerald-600">{formatarMoeda(p.preco)}</p>
                  <p className="text-[11px] text-gray-400">{p.estoque} em estoque</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[380px] bg-white border-l flex flex-col shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-4.5 h-4.5" /> Carrinho <span className="text-xs font-normal text-gray-400">({carrinho.length})</span>
          </h2>
          <button
            onClick={() => setShowModalCliente(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 max-w-[140px]"
          >
            <User className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{clienteSelecionado?.nome || "Consumidor final"}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {carrinho.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Carrinho vazio</p>
            </div>
          ) : (
            carrinho.map((item) => (
              <div key={item.chave} className="flex gap-3 p-2.5 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.nome}</p>
                  <p className="text-xs text-emerald-600">{formatarMoeda(item.preco)}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button onClick={() => atualizarQuantidade(item.chave, item.quantidade - 1)} className="p-1 bg-white rounded-lg border hover:bg-gray-100">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.quantidade}</span>
                    <button onClick={() => atualizarQuantidade(item.chave, item.quantidade + 1)} className="p-1 bg-white rounded-lg border hover:bg-gray-100">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-gray-800">{formatarMoeda(item.preco * item.quantidade)}</p>
                  <button onClick={() => removerItem(item.chave)} className="text-red-400 hover:text-red-600 mt-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4 space-y-2.5 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatarMoeda(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Desconto</span>
            <input
              type="number" step="0.01" min={0} value={desconto || ""}
              onChange={(e) => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0,00"
              className="flex-1 px-2 py-1 border rounded-lg text-sm text-right"
            />
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-1">
            <span>Total</span>
            <span className="text-emerald-600">{formatarMoeda(total)}</span>
          </div>
          <button
            onClick={() => setShowModalPagamento(true)}
            disabled={carrinho.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition"
          >
            Finalizar venda
          </button>
        </div>
      </div>

      {showModalCliente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[70vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Selecionar cliente</h2>
              <button onClick={() => setShowModalCliente(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => { setClienteSelecionado(null); setShowModalCliente(false); }}
                className="w-full text-left p-3 border rounded-xl hover:bg-gray-50"
              >
                <p className="font-medium text-sm">Consumidor final</p>
                <p className="text-xs text-gray-400">Sem identificação</p>
              </button>
              {clientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setClienteSelecionado(c); setShowModalCliente(false); }}
                  className="w-full text-left p-3 border rounded-xl hover:bg-gray-50"
                >
                  <p className="font-medium text-sm">{c.nome}</p>
                  <p className="text-xs text-gray-400">{c.telefone} · limite {formatarMoeda(c.limite_credito)}</p>
                </button>
              ))}
              {clientes.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum cliente cadastrado no fiado ainda.</p>}
            </div>
          </div>
        </div>
      )}

      {showModalPagamento && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Forma de pagamento</h2>
              <button onClick={() => setShowModalPagamento(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-center text-2xl font-bold text-emerald-600 mb-4">{formatarMoeda(total)}</p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {([
                ["dinheiro", DollarSign, "Dinheiro"],
                ["pix", QrCode, "PIX"],
                ["cartao", CreditCard, "Cartão"],
                ["fiado", Receipt, "Fiado"],
              ] as const).map(([id, Icone, label]) => (
                <button
                  key={id}
                  onClick={() => setMetodoPagamento(id)}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition ${metodoPagamento === id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <Icone className="w-5 h-5 text-gray-600" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {metodoPagamento === "dinheiro" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Valor recebido</label>
                <input
                  type="number" step="0.01" value={valorPago}
                  onChange={(e) => setValorPago(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" autoFocus
                />
                {typeof valorPago === "number" && valorPago > total && (
                  <p className="text-xs text-emerald-600 mt-1">Troco: {formatarMoeda(valorPago - total)}</p>
                )}
              </div>
            )}
            {metodoPagamento === "fiado" && (
              <div className={`p-3 rounded-xl mb-4 ${clienteSelecionado ? "bg-blue-50" : "bg-amber-50"}`}>
                {clienteSelecionado ? (
                  <p className="text-sm text-blue-800">Cliente: <strong>{clienteSelecionado.nome}</strong></p>
                ) : (
                  <p className="text-sm text-amber-700">Selecione um cliente pra venda fiado.</p>
                )}
              </div>
            )}

            <button
              onClick={() => confirmarPagamento(false)}
              disabled={finalizando || (metodoPagamento === "dinheiro" && (typeof valorPago !== "number" || valorPago < total))}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition"
            >
              {finalizando ? "Processando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
