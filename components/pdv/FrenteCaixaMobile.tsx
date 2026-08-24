"use client";

// Caminho: C:\valente_conecta\components\pdv\FrenteCaixaMobile.tsx
//
// Frente de caixa pra quem só tem celular no balcão: grade de produtos em
// 2 colunas, resumo do carrinho como barra fixa embaixo (toque expande em
// bottom sheet com o checkout) — mesmo padrão visual já usado em
// app/pdv/estoque e app/pdv/fiado.

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Plus, Minus, Trash2, X, Search, Package, ChevronUp, Receipt, MessageCircle, LogOut } from "lucide-react";
import { useCarrinhoPdv } from "@/lib/pdv/useCarrinhoPdv";
import { agruparPorCatalogo } from "@/lib/pdv/agruparPorCatalogo";
import { temPermissao } from "@/lib/pdv/operadorPdv";
import type { ClienteFiado, FormaPagamento, ProdutoPDV, PropsFrenteCaixa } from "@/lib/pdv/frenteCaixaTypes";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatarDataBR(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

// Tenta o protocolo direto do WhatsApp e cai pro link wa.me se depois
// de ~1,2s a aba continuar visivel (sinal de que o app nao abriu) --
// mesmo padrao usado em app/pdv/fiado/page.tsx e no FrenteCaixaDesktop.tsx,
// ver o comentario mais detalhado la'.
function abrirWhatsapp(telefone: string, mensagem: string) {
  const digitos = telefone.replace(/\D/g, "");
  const numeroCompleto = digitos.startsWith("55") ? digitos : `55${digitos}`;
  const linkApp = `whatsapp://send?phone=${numeroCompleto}&text=${encodeURIComponent(mensagem)}`;
  const linkWeb = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
  window.location.href = linkApp;
  setTimeout(() => {
    if (document.visibilityState === "visible") window.open(linkWeb, "_blank");
  }, 1200);
}

interface ResumoFiado {
  cliente: ClienteFiado;
  valor: number;
  vencimento: string;
  saldoTotal: number;
}

const FORMAS: { id: FormaPagamento; label: string }[] = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "pix", label: "PIX" },
  { id: "cartao", label: "Cartão" },
  { id: "fiado", label: "Fiado" },
];

export function FrenteCaixaMobile({ usuarioId, produtos, clientes, carregandoProdutos, onVendaFinalizada, operador, onTrocarOperador }: PropsFrenteCaixa) {
  const { carrinho, desconto, setDesconto, adicionar, atualizarQuantidade, subtotal, total, finalizando, finalizarVenda } = useCarrinhoPdv(usuarioId);
  const [busca, setBusca] = useState("");
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteFiado | null>(null);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<FormaPagamento>("dinheiro");
  const [valorPago, setValorPago] = useState<number | "">("");
  const [grupoParaEscolher, setGrupoParaEscolher] = useState<ProdutoPDV[] | null>(null);
  const [clientesExtra, setClientesExtra] = useState<ClienteFiado[]>([]);
  const [mostrarCadastroCliente, setMostrarCadastroCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [novoClienteTelefone, setNovoClienteTelefone] = useState("");
  const [salvandoNovoCliente, setSalvandoNovoCliente] = useState(false);
  const [resumoFiado, setResumoFiado] = useState<ResumoFiado | null>(null);

  const totalItens = useMemo(() => carrinho.reduce((s, i) => s + i.quantidade, 0), [carrinho]);
  const todosClientes = useMemo(() => [...clientes, ...clientesExtra], [clientes, clientesExtra]);
  const podeAplicarDesconto = temPermissao(operador ?? null, "aplicar_desconto");
  const podeVenderFiado = temPermissao(operador ?? null, "vender_fiado");
  const podeForcarLimiteFiado = temPermissao(operador ?? null, "forcar_limite_fiado");
  const formasVisiveis = FORMAS.filter((f) => f.id !== "fiado" || podeVenderFiado);

  // Fiado embarcado no PDV: escolher "Fiado" sem cliente cadastrado ja'
  // abre o cadastro na hora (mesmo padrao do FrenteCaixaDesktop.tsx).
  const abrirSelecaoCliente = () => {
    setMostrarClientes(true);
    setMostrarCadastroCliente(todosClientes.length === 0);
  };

  const cadastrarClienteRapido = async () => {
    if (!novoClienteNome.trim() || !novoClienteTelefone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }
    setSalvandoNovoCliente(true);
    try {
      const resp = await fetch("/api/fiado/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId: usuarioId, nome: novoClienteNome.trim(), telefone: novoClienteTelefone.trim(), limiteCredito: 0 }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error || "Erro ao cadastrar cliente");
      setClientesExtra((prev) => [...prev, resultado.data]);
      setClienteSelecionado(resultado.data);
      setNovoClienteNome("");
      setNovoClienteTelefone("");
      setMostrarCadastroCliente(false);
      setMostrarClientes(false);
      toast.success("Cliente cadastrado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar cliente");
    } finally {
      setSalvandoNovoCliente(false);
    }
  };

  const produtosFiltrados = produtos.filter((p) => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()));
  const gruposFiltrados = useMemo(() => Array.from(agruparPorCatalogo(produtosFiltrados).values()), [produtosFiltrados]);

  const tocarNoProduto = (grupo: ProdutoPDV[]) => {
    if (grupo.length === 1) adicionar(grupo[0]);
    else setGrupoParaEscolher(grupo);
  };

  const confirmar = async (forcarLimite = false) => {
    if (metodoPagamento === "fiado" && !clienteSelecionado) {
      abrirSelecaoCliente();
      return;
    }
    const clienteAntes = clienteSelecionado;
    const totalAntes = total;
    const resultado = await finalizarVenda({
      formaPagamento: metodoPagamento,
      cliente: clienteSelecionado,
      valorPago: metodoPagamento === "dinheiro" ? Number(valorPago || total) : undefined,
      forcarLimiteFiado: forcarLimite,
      funcionarioId: operador?.id ?? null,
    });

    if (resultado.limiteExcedido) {
      toast((t) => (
        <div className="text-sm">
          <p className="font-medium">Cliente já deve {formatarMoeda(resultado.limiteExcedido!.saldoAtual)} de {formatarMoeda(resultado.limiteExcedido!.limite)}.</p>
          {podeForcarLimiteFiado && (
            <button onClick={() => { toast.dismiss(t.id); confirmar(true); }} className="mt-2 text-blue-600 underline">
              Lançar assim mesmo
            </button>
          )}
        </div>
      ), { duration: 8000 });
      return;
    }
    if (!resultado.sucesso) {
      toast.error(resultado.erro || "Erro ao finalizar venda");
      return;
    }

    if (metodoPagamento === "fiado" && clienteAntes) {
      setResumoFiado({
        cliente: clienteAntes,
        valor: totalAntes,
        vencimento: resultado.dataVencimentoFiado || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        saldoTotal: resultado.saldoTotalCliente ?? totalAntes,
      });
    } else {
      toast.success(resultado.troco ? `Venda ok! Troco: ${formatarMoeda(resultado.troco)}` : "Venda finalizada!");
    }
    setClienteSelecionado(null);
    setValorPago("");
    setMetodoPagamento("dinheiro");
    setCarrinhoAberto(false);
    onVendaFinalizada();
  };

  return (
    <div className="relative">
      <div className="p-3 space-y-3 pb-24">
        {operador && onTrocarOperador && (
          <button onClick={onTrocarOperador} className="w-full flex items-center justify-center gap-1.5 text-gray-500 text-xs font-medium py-1">
            <LogOut className="w-3.5 h-3.5" /> Operando como <span className="font-semibold">{operador.nome}</span> — trocar
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm"
          />
        </div>

        {carregandoProdutos ? (
          <p className="text-sm text-gray-400 text-center py-12">Carregando estoque...</p>
        ) : gruposFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {gruposFiltrados.map((grupo) => {
              const p = grupo[0];
              const estoqueTotal = grupo.reduce((s, v) => s + v.estoque, 0);
              return (
                <button
                  key={p.catalogoId || p.estoqueId}
                  onClick={() => tocarNoProduto(grupo)}
                  disabled={estoqueTotal < 1}
                  className="bg-white rounded-2xl p-3 text-left border border-gray-100 shadow-sm active:scale-[0.98] transition disabled:opacity-40"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    {p.fotoUrl ? <img src={p.fotoUrl} alt="" className="w-full h-full object-cover" /> : <ShoppingCart className="w-7 h-7 text-gray-300" />}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                  <p className="text-base font-bold text-emerald-600">{formatarMoeda(p.preco)}</p>
                  <p className="text-[11px] text-gray-400">
                    {grupo.length > 1 ? <span className="text-blue-600 font-medium">{grupo.length} opções</span> : `${p.estoque} em estoque`}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {carrinho.length > 0 && !carrinhoAberto && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-2xl shadow-lg px-4 py-3.5 flex items-center justify-between z-40"
        >
          <span className="flex items-center gap-2 font-medium text-sm">
            <ShoppingCart className="w-4.5 h-4.5" /> {totalItens} {totalItens === 1 ? "item" : "itens"}
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            {formatarMoeda(total)} <ChevronUp className="w-4 h-4" />
          </span>
        </button>
      )}

      {carrinhoAberto && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[88vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShoppingCart className="w-4.5 h-4.5" /> Carrinho</h2>
              <button onClick={() => setCarrinhoAberto(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {carrinho.map((item) => (
                <div key={item.chave} className="flex gap-3 p-2.5 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.nome}</p>
                    <p className="text-xs text-emerald-600">{formatarMoeda(item.preco)}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button onClick={() => atualizarQuantidade(item.chave, item.quantidade - 1)} className="p-1.5 bg-white rounded-lg border"><Minus className="w-3 h-3" /></button>
                      <span className="w-7 text-center text-sm font-medium">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.chave, item.quantidade + 1)} className="p-1.5 bg-white rounded-lg border"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-gray-800">{formatarMoeda(item.preco * item.quantidade)}</p>
                    <button onClick={() => atualizarQuantidade(item.chave, 0)} className="text-red-400 mt-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-2.5 shrink-0">
              {podeAplicarDesconto && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Desconto</span>
                  <input
                    type="number" step="0.01" min={0} value={desconto || ""}
                    onChange={(e) => setDesconto(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0,00"
                    className="flex-1 px-2 py-1.5 border rounded-lg text-sm text-right"
                  />
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-emerald-600">{formatarMoeda(total)}</span>
              </div>

              <div className="flex gap-1.5">
                {formasVisiveis.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setMetodoPagamento(f.id); if (f.id === "fiado" && !clienteSelecionado) abrirSelecaoCliente(); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border ${metodoPagamento === f.id ? "border-blue-500 bg-blue-50 text-blue-700" : "text-gray-500"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {metodoPagamento === "dinheiro" && (
                <input
                  type="number" step="0.01" value={valorPago}
                  onChange={(e) => setValorPago(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  placeholder="Valor recebido"
                  className="w-full px-3 py-2.5 border rounded-xl text-sm"
                />
              )}
              {metodoPagamento === "fiado" && (
                <button onClick={abrirSelecaoCliente} className="w-full text-left px-3 py-2.5 border rounded-xl text-sm text-gray-600">
                  {clienteSelecionado ? `Cliente: ${clienteSelecionado.nome}` : "Toque para selecionar cliente"}
                </button>
              )}

              <button
                onClick={() => confirmar(false)}
                disabled={finalizando || (metodoPagamento === "dinheiro" && (typeof valorPago !== "number" || valorPago < total))}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold"
              >
                {finalizando ? "Processando..." : "Finalizar venda"}
              </button>
            </div>
          </div>
        </div>
      )}

      {grupoParaEscolher && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <h2 className="font-bold text-gray-800">{grupoParaEscolher[0].nome}</h2>
              <button onClick={() => setGrupoParaEscolher(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {grupoParaEscolher.map((v) => (
                <button
                  key={v.estoqueId}
                  disabled={v.estoque < 1}
                  onClick={() => { adicionar(v); setGrupoParaEscolher(null); }}
                  className="w-full text-left p-3 border rounded-xl flex justify-between items-center disabled:opacity-40"
                >
                  <span className="font-medium text-sm">{v.variante || "Padrão"}</span>
                  <span className="text-xs text-gray-400">{v.estoque} {v.unidade || "un"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {resumoFiado && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Receipt className="w-4.5 h-4.5" /> Venda fiado registrada</h2>
              <button onClick={() => setResumoFiado(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="font-medium">{resumoFiado.cliente.nome}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Valor da compra</span><span className="font-medium">{formatarMoeda(resumoFiado.valor)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Vencimento</span><span className="font-medium">{formatarDataBR(resumoFiado.vencimento)}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="text-gray-700 font-semibold">Saldo total em aberto</span><span className="font-bold text-red-600">{formatarMoeda(resumoFiado.saldoTotal)}</span></div>
            </div>
            <div className="flex gap-3 pt-5">
              <button onClick={() => setResumoFiado(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Fechar</button>
              <button
                onClick={() => abrirWhatsapp(resumoFiado.cliente.telefone, `Olá, ${resumoFiado.cliente.nome}! Compra de ${formatarMoeda(resumoFiado.valor)} no fiado, vencimento em ${formatarDataBR(resumoFiado.vencimento)}. Saldo total em aberto: ${formatarMoeda(resumoFiado.saldoTotal)}.`)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarClientes && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <h2 className="font-bold text-gray-800">{mostrarCadastroCliente ? "Novo cliente" : "Selecionar cliente"}</h2>
              <button onClick={() => { setMostrarClientes(false); setMostrarCadastroCliente(false); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {mostrarCadastroCliente ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <p className="text-xs text-gray-400">Nome e telefone bastam pra vender fiado agora — CPF, endereço e limite dá pra completar depois em Fiado.</p>
                <div>
                  <label className="text-xs font-medium text-gray-500">Nome *</label>
                  <input value={novoClienteNome} onChange={(e) => setNovoClienteNome(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Telefone/WhatsApp *</label>
                  <input value={novoClienteTelefone} onChange={(e) => setNovoClienteTelefone(e.target.value)} placeholder="(75) 99999-9999" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <button onClick={cadastrarClienteRapido} disabled={salvandoNovoCliente} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60">
                  {salvandoNovoCliente ? "Cadastrando..." : "Cadastrar e selecionar"}
                </button>
                {todosClientes.length > 0 && (
                  <button onClick={() => setMostrarCadastroCliente(false)} className="w-full text-center text-sm text-gray-500">
                    Voltar pra lista de clientes
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                <button onClick={() => setMostrarCadastroCliente(true)} className="w-full text-left p-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-medium text-sm">
                  + Novo cliente
                </button>
                <button
                  onClick={() => { setClienteSelecionado(null); setMostrarClientes(false); }}
                  className="w-full text-left p-3 border rounded-xl"
                >
                  <p className="font-medium text-sm">Consumidor final</p>
                </button>
                {todosClientes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setClienteSelecionado(c); setMostrarClientes(false); }}
                    className="w-full text-left p-3 border rounded-xl"
                  >
                    <p className="font-medium text-sm">{c.nome}</p>
                    <p className="text-xs text-gray-400">{c.telefone} · limite {formatarMoeda(c.limite_credito)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
