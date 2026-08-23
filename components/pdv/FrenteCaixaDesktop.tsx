"use client";

// Caminho: C:\valente_conecta\components\pdv\FrenteCaixaDesktop.tsx
//
// Frente de caixa pra quem tem computador/notebook no balcão. Estrutura
// pedida pelo usuário, seguindo o fluxo de caixa registradora tradicional
// (referência: sistema PDV de terceiro que ele mandou print) em vez de
// "loja virtual com carrinho lateral":
//   1. Digita/escaneia o código de barras -> item entra como LINHA numa
//      tabela corrida (não é grade de produto pra clicar).
//   2. Totais e forma de pagamento ficam SEMPRE visíveis embaixo, não em
//      popup — só o valor recebido/troco aparece quando escolhe dinheiro.
// Reaproveita o leitor de código de barras que já existe no projeto
// (components/pdv/BarcodeScanner.tsx, usado hoje em app/pdv/estoque).

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Trash2, CreditCard, QrCode, DollarSign, Receipt, X, Search, ScanBarcode, User, Plus, Minus,
  AlertTriangle, TrendingUp, History, IdCard, CalendarClock,
} from "lucide-react";
import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";
import { useCarrinhoPdv } from "@/lib/pdv/useCarrinhoPdv";
import { agruparPorCatalogo } from "@/lib/pdv/agruparPorCatalogo";
import type { ClienteFiado, FormaPagamento, ProdutoPDV, PropsFrenteCaixa } from "@/lib/pdv/frenteCaixaTypes";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function diasParaVencer(validade: string | null): number | null {
  if (!validade) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dataValidade = new Date(validade + "T00:00:00");
  return Math.round((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
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

const FORMAS: { id: FormaPagamento; label: string; Icone: typeof DollarSign }[] = [
  { id: "dinheiro", label: "Dinheiro", Icone: DollarSign },
  { id: "pix", label: "PIX", Icone: QrCode },
  { id: "cartao", label: "Cartão", Icone: CreditCard },
  { id: "fiado", label: "Fiado", Icone: Receipt },
];

interface LancamentoCaixa {
  id: string;
  descricao: string;
  valor: number;
  forma_pagamento: string;
  categoria: string | null;
  created_at: string;
}

export function FrenteCaixaDesktop({ usuarioId, usuarioNome, produtos, clientes, carregandoProdutos, onVendaFinalizada }: PropsFrenteCaixa) {
  const { carrinho, desconto, setDesconto, adicionar, atualizarQuantidade, removerItem, subtotal, total, finalizando, finalizarVenda } = useCarrinhoPdv(usuarioId);
  const [codigo, setCodigo] = useState("");
  const [qtdEntrada, setQtdEntrada] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [showBusca, setShowBusca] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteFiado | null>(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<FormaPagamento>("dinheiro");
  const [valorPago, setValorPago] = useState<number | "">("");
  const [lancamentosHoje, setLancamentosHoje] = useState<LancamentoCaixa[]>([]);
  const inputCodigoRef = useRef<HTMLInputElement>(null);

  const carregarResumoHoje = () => {
    fetch(`/api/pdv/caixa?usuarioId=${usuarioId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => { if (resp.success) setLancamentosHoje(resp.data.lancamentos); })
      .catch(() => {});
  };

  useEffect(() => {
    carregarResumoHoje();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const vendasHoje = useMemo(() => lancamentosHoje.filter((l) => l.categoria === "venda"), [lancamentosHoje]);
  const totalVendidoHoje = vendasHoje.reduce((soma, v) => soma + Number(v.valor), 0);
  const ticketMedioHoje = vendasHoje.length ? totalVendidoHoje / vendasHoje.length : 0;
  const estoqueBaixo = useMemo(
    () => produtos.filter((p) => p.estoqueMinimo > 0 && p.estoque <= p.estoqueMinimo),
    [produtos]
  );
  const validadeProxima = useMemo(
    () => produtos.filter((p) => { const d = diasParaVencer(p.validade); return d !== null && d <= 7; }),
    [produtos]
  );

  const [grupoParaEscolher, setGrupoParaEscolher] = useState<ProdutoPDV[] | null>(null);

  // EAN fica no nivel do catalogo (compartilhado entre variantes de
  // tamanho/cor, ver 069_pdv_estoque_variante.sql) -- por isso o mapa
  // precisa guardar TODAS as linhas de um mesmo codigo, nao so' a ultima.
  // Sem isso, escanear o codigo de um produto com variante adicionaria uma
  // variante arbitraria ao carrinho sem avisar nada.
  const produtosPorEan = useMemo(() => {
    const mapa = new Map<string, ProdutoPDV[]>();
    for (const p of produtos) {
      if (!p.ean) continue;
      const grupo = mapa.get(p.ean);
      if (grupo) grupo.push(p);
      else mapa.set(p.ean, [p]);
    }
    return mapa;
  }, [produtos]);

  const gruposBusca = useMemo(() => {
    if (!buscaTexto.trim()) return [];
    const filtrados = produtos.filter((p) => p.nome.toLowerCase().includes(buscaTexto.toLowerCase()));
    return Array.from(agruparPorCatalogo(filtrados).values()).slice(0, 8);
  }, [produtos, buscaTexto]);

  const adicionarOuEscolher = (grupo: ProdutoPDV[], qtd: number) => {
    if (grupo.length === 1) {
      adicionar(grupo[0], qtd);
      return;
    }
    setGrupoParaEscolher(grupo);
  };

  const adicionarPorCodigo = (valor: string) => {
    const cod = valor.trim();
    if (!cod) return;
    const grupo = produtosPorEan.get(cod);
    if (!grupo || grupo.length === 0) {
      toast.error(`Nenhum produto com o código "${cod}"`);
      setCodigo("");
      return;
    }
    adicionarOuEscolher(grupo, qtdEntrada || 1);
    setCodigo("");
    setQtdEntrada(1);
    inputCodigoRef.current?.focus();
  };

  const confirmar = async (forcarLimite = false) => {
    if (metodoPagamento === "fiado" && !clienteSelecionado) {
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
          <button onClick={() => { toast.dismiss(t.id); confirmar(true); }} className="mt-2 text-blue-600 underline">
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
    setClienteSelecionado(null);
    setValorPago("");
    setMetodoPagamento("dinheiro");
    onVendaFinalizada();
    carregarResumoHoje();
    inputCodigoRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-104px)] bg-gray-50">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Barra de identificação da venda */}
        <div className="bg-white border-b px-5 py-2.5 flex items-center justify-between text-sm gap-3">
          <div className="flex items-center gap-3 text-gray-400">
            <span className="font-medium text-gray-600">Venda nº {vendasHoje.length + 1}</span>
            <span className="hidden md:inline">· {new Date().toLocaleDateString("pt-BR")} {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            {usuarioNome && <span className="hidden lg:flex items-center gap-1"><IdCard className="w-3.5 h-3.5" /> {usuarioNome}</span>}
          </div>
          <button onClick={() => setShowModalCliente(true)} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium">
            <User className="w-4 h-4" /> {clienteSelecionado?.nome || "Consumidor final"}
          </button>
        </div>

        {/* Entrada de código de barras */}
        <div className="bg-white border-b px-5 py-3 flex gap-2">
          <input
            type="number" min={1} value={qtdEntrada}
            onChange={(e) => setQtdEntrada(Math.max(1, parseInt(e.target.value) || 1))}
            title="Quantidade a adicionar"
            className="w-16 px-2 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="relative flex-1">
            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input
              ref={inputCodigoRef}
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarPorCodigo(codigo)}
              placeholder="Código de barras — escaneia ou digita e aperta Enter"
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button onClick={() => setShowScanner(true)} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl" title="Escanear com a câmera">
            <ScanBarcode className="w-5 h-5" />
          </button>
          <button onClick={() => setShowBusca(true)} className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl" title="Buscar por nome">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Tabela corrida de itens */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {carregandoProdutos ? (
            <p className="text-sm text-gray-400 text-center py-12">Carregando estoque...</p>
          ) : carrinho.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <ScanBarcode className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Escaneie ou digite um código pra começar a venda</p>
            </div>
          ) : (
            <table className="w-full text-sm bg-white rounded-xl overflow-hidden shadow-sm">
              <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 font-medium w-28">Código</th>
                  <th className="text-left px-3 py-2 font-medium">Produto</th>
                  <th className="text-center px-3 py-2 font-medium w-14">Un</th>
                  <th className="text-center px-3 py-2 font-medium w-32">Qtd</th>
                  <th className="text-right px-3 py-2 font-medium w-28">Preço un.</th>
                  <th className="text-right px-3 py-2 font-medium w-28">Subtotal</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {carrinho.map((item) => (
                  <tr key={item.chave} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400 text-xs font-mono">{item.ean || "—"}</td>
                    <td className="px-3 py-2 text-gray-800 font-medium">{item.nome}</td>
                    <td className="px-3 py-2 text-center text-gray-400 text-xs uppercase">{item.unidade || "un"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => atualizarQuantidade(item.chave, item.quantidade - 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center">{item.quantidade}</span>
                        <button onClick={() => atualizarQuantidade(item.chave, item.quantidade + 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">{formatarMoeda(item.preco)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatarMoeda(item.preco * item.quantidade)}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => removerItem(item.chave)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Painel de totais + pagamento, sempre visível */}
        <div className="bg-white border-t px-5 py-3.5 space-y-3">
          <div className="flex items-center gap-6">
            <div className="grid grid-cols-4 gap-3 flex-1">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase">Itens</p>
                <p className="font-bold text-gray-700">{carrinho.reduce((soma, i) => soma + i.quantidade, 0)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase">Subtotal</p>
                <p className="font-bold text-gray-700">{formatarMoeda(subtotal)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase">Desconto</p>
                <input
                  type="number" step="0.01" min={0} value={desconto || ""}
                  onChange={(e) => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0,00"
                  className="w-full bg-transparent font-bold text-gray-700 focus:outline-none"
                />
              </div>
              <div className="bg-emerald-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-emerald-600 uppercase">Total</p>
                <p className="font-bold text-emerald-700 text-lg">{formatarMoeda(total)}</p>
              </div>
            </div>

            <div className="flex gap-1.5">
            {FORMAS.map(({ id, label, Icone }) => (
              <button
                key={id}
                onClick={() => setMetodoPagamento(id)}
                className={`px-3 py-2 rounded-xl border flex flex-col items-center gap-0.5 transition min-w-[68px] ${metodoPagamento === id ? "border-blue-500 bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <Icone className="w-4 h-4" />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>

          {metodoPagamento === "dinheiro" && (
            <div className="w-36">
              <p className="text-[10px] text-gray-400 uppercase">Valor recebido</p>
              <input
                type="number" step="0.01" value={valorPago}
                onChange={(e) => setValorPago(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full border rounded-lg px-2 py-1.5 text-sm font-medium"
              />
              {typeof valorPago === "number" && valorPago > total && (
                <p className="text-[11px] text-emerald-600 mt-0.5">Troco: {formatarMoeda(valorPago - total)}</p>
              )}
            </div>
          )}

          <button
            onClick={() => confirmar(false)}
            disabled={carrinho.length === 0 || finalizando || (metodoPagamento === "dinheiro" && (typeof valorPago !== "number" || valorPago < total))}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap"
          >
            {finalizando ? "Processando..." : "Finalizar venda"}
          </button>
        </div>
        </div>
      </div>

      {/* Coluna lateral: cliente, resumo do caixa hoje, vendas recentes, estoque baixo */}
      <aside className="hidden xl:flex w-[300px] shrink-0 flex-col border-l bg-white overflow-y-auto">
        {clienteSelecionado && (
          <div className="p-4 border-b">
            <p className="text-[10px] text-gray-400 uppercase font-medium mb-1.5">Cliente selecionado</p>
            <p className="font-semibold text-gray-800 text-sm">{clienteSelecionado.nome}</p>
            <p className="text-xs text-gray-400">{clienteSelecionado.telefone}</p>
            <p className="text-xs text-gray-500 mt-1">Limite de crédito: <span className="font-medium">{formatarMoeda(clienteSelecionado.limite_credito)}</span></p>
          </div>
        )}

        <div className="p-4 border-b">
          <p className="text-[10px] text-gray-400 uppercase font-medium mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Caixa de hoje</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg px-2.5 py-2">
              <p className="text-[10px] text-gray-400">Vendido</p>
              <p className="font-bold text-gray-700 text-sm">{formatarMoeda(totalVendidoHoje)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2.5 py-2">
              <p className="text-[10px] text-gray-400">Vendas</p>
              <p className="font-bold text-gray-700 text-sm">{vendasHoje.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2.5 py-2 col-span-2">
              <p className="text-[10px] text-gray-400">Ticket médio</p>
              <p className="font-bold text-gray-700 text-sm">{formatarMoeda(ticketMedioHoje)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b">
          <p className="text-[10px] text-gray-400 uppercase font-medium mb-2 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Vendas de hoje</p>
          {vendasHoje.length === 0 ? (
            <p className="text-xs text-gray-300">Nenhuma venda ainda.</p>
          ) : (
            <div className="space-y-1.5">
              {vendasHoje.slice(0, 8).map((v) => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-gray-500 capitalize">{v.forma_pagamento}</span>
                  <span className="font-medium text-gray-700">{formatarMoeda(Number(v.valor))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {estoqueBaixo.length > 0 && (
          <div className="p-4 border-b">
            <p className="text-[10px] text-amber-600 uppercase font-medium mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Estoque baixo</p>
            <div className="space-y-1.5">
              {estoqueBaixo.slice(0, 8).map((p) => (
                <div key={p.estoqueId} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate pr-2">{p.nome}</span>
                  <span className="font-medium text-amber-600 whitespace-nowrap">{p.estoque} {p.unidade || "un"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {validadeProxima.length > 0 && (
          <div className="p-4">
            <p className="text-[10px] text-red-600 uppercase font-medium mb-2 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Validade próxima</p>
            <div className="space-y-1.5">
              {validadeProxima.slice(0, 8).map((p) => {
                const dias = diasParaVencer(p.validade)!;
                return (
                  <div key={p.estoqueId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate pr-2">{p.nome}</span>
                    <span className="font-medium text-red-600 whitespace-nowrap">{dias < 0 ? `vencido há ${Math.abs(dias)}d` : `${dias}d`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {showScanner && (
        <BarcodeScanner
          onDetected={(cod) => { setShowScanner(false); adicionarPorCodigo(cod); }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showBusca && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-24">
          <div className="bg-white rounded-2xl max-w-md w-full p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-800">Buscar produto</h2>
              <button onClick={() => { setShowBusca(false); setBuscaTexto(""); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <input
              autoFocus
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Nome do produto..."
              className="w-full px-3 py-2.5 border rounded-xl text-sm mb-2"
            />
            <div className="max-h-72 overflow-y-auto space-y-1">
              {gruposBusca.map((grupo) => (
                <button
                  key={grupo[0].catalogoId || grupo[0].estoqueId}
                  onClick={() => { adicionarOuEscolher(grupo, qtdEntrada || 1); setQtdEntrada(1); setShowBusca(false); setBuscaTexto(""); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex justify-between items-center text-sm"
                >
                  <span className="text-gray-800">{grupo[0].nome}{grupo.length > 1 && <span className="ml-1.5 text-xs text-blue-600 font-medium">{grupo.length} opções</span>}</span>
                  <span className="text-emerald-600 font-medium">{formatarMoeda(grupo[0].preco)}</span>
                </button>
              ))}
              {buscaTexto.trim() && gruposBusca.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Nada encontrado.</p>}
            </div>
          </div>
        </div>
      )}

      {grupoParaEscolher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[70vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Escolha a variação — {grupoParaEscolher[0].nome}</h2>
              <button onClick={() => setGrupoParaEscolher(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-1.5">
              {grupoParaEscolher.map((v) => (
                <button
                  key={v.estoqueId}
                  disabled={v.estoque < 1}
                  onClick={() => { adicionar(v, qtdEntrada || 1); setQtdEntrada(1); setGrupoParaEscolher(null); }}
                  className="w-full text-left p-3 border rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex justify-between items-center"
                >
                  <span className="font-medium text-sm text-gray-800">{v.variante || "Padrão"}</span>
                  <span className="text-xs text-gray-400">{v.estoque} {v.unidade || "un"} em estoque</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
