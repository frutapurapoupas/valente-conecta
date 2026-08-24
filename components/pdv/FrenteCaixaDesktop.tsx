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
  AlertTriangle, TrendingUp, History, IdCard, CalendarClock, Settings, FileText, MessageCircle,
} from "lucide-react";
import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";
import { useCarrinhoPdv } from "@/lib/pdv/useCarrinhoPdv";
import { agruparPorCatalogo } from "@/lib/pdv/agruparPorCatalogo";
import QRCode from "qrcode";
import { obterDadosEmpresa, salvarDadosEmpresa, type DadosEmpresa } from "@/lib/pdv/dadosEmpresa";
import { gerarPayloadPix } from "@/lib/pdv/pixBRCode";
import type { ClienteFiado, FormaPagamento, ItemCarrinho, ProdutoPDV, PropsFrenteCaixa } from "@/lib/pdv/frenteCaixaTypes";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function diasParaVencer(validade: string | null): number | null {
  if (!validade) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dataValidade = new Date(validade + "T00:00:00");
  return Math.round((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function formatarDataBR(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

// Tenta o protocolo direto do WhatsApp primeiro (abre o app na hora,
// sem passar pela pagina "Compartilhar no WhatsApp" do wa.me) -- mas o
// Chrome so' faz essa entrega se ja' tiver permissao concedida pro site
// abrir esse tipo de link, e nao existe um jeito confiavel de saber de
// antemao se essa permissao existe (achado testando: quando falta, o
// link nao faz literalmente nada, sem erro nenhum). Por isso tem
// fallback: se depois de ~1,2s a aba continuar visivel (sinal de que o
// app NAO abriu, porque abrir um app de verdade tira o foco da aba),
// cai pro link wa.me tradicional, que sempre funciona. So' abre uma
// mensagem pronta, o lojista quem manda; nao depende do cliente ter o
// app instalado nem do plano da loja (diferente do push automatico,
// que so' plano pago dispara).
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

function imprimirComprovante(itens: { nome: string; preco: number; quantidade: number }[], subtotal: number, desconto: number, total: number, cliente: ClienteFiado | null, nomeEmpresa: string) {
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
      <div class="header"><h2>${(nomeEmpresa || "VALENTE CONECTA").toUpperCase()}</h2><p>${new Date().toLocaleString("pt-BR")}</p></div>
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

interface DadosNotaVenda {
  vendaNumero: number;
  itens: ItemCarrinho[];
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: FormaPagamento;
  valorPago: number | null;
  troco: number;
  cliente: ClienteFiado | null;
  empresa: DadosEmpresa;
}

const LABEL_FORMA_PAGAMENTO: Record<FormaPagamento, string> = { dinheiro: "Dinheiro", pix: "PIX", cartao: "Cartão", fiado: "Fiado (a prazo)" };

function imprimirNotaVenda(dados: DadosNotaVenda) {
  const win = window.open("", "_blank");
  if (!win) return;
  const { vendaNumero, itens, subtotal, desconto, total, formaPagamento, valorPago, troco, cliente, empresa } = dados;
  const linhasItens = itens.map((i) => `
    <tr>
      <td>${i.ean || "—"}</td>
      <td>${i.nome}</td>
      <td class="center">${i.unidade || "un"}</td>
      <td class="center">${i.quantidade}</td>
      <td class="right">${formatarMoeda(i.preco)}</td>
      <td class="right">${formatarMoeda(i.preco * i.quantidade)}</td>
    </tr>`).join("");

  win.document.write(`
    <!DOCTYPE html><html><head><title>Nota de Venda</title><style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 15mm; max-width: 210mm; margin: 0 auto; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      .cabecalho { display: flex; justify-content: space-between; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 12px; }
      .cabecalho p { margin: 1px 0; font-size: 11px; color: #555; }
      .venda-info { text-align: right; }
      .bloco-cliente { border: 1px solid #ddd; border-radius: 4px; padding: 8px 10px; margin-bottom: 12px; font-size: 12px; }
      .bloco-cliente p { margin: 1px 0; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      th { background: #f3f3f3; text-align: left; font-size: 10px; text-transform: uppercase; padding: 6px; border-bottom: 1px solid #ccc; }
      td { padding: 6px; border-bottom: 1px solid #eee; font-size: 12px; }
      .center { text-align: center; } .right { text-align: right; }
      .totais { width: 260px; margin-left: auto; }
      .totais div { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; }
      .totais .final { font-weight: bold; font-size: 16px; border-top: 2px solid #222; padding-top: 6px; margin-top: 4px; }
      .rodape { margin-top: 20px; padding-top: 10px; border-top: 1px dashed #999; font-size: 10px; color: #777; text-align: center; }
      @media print { body { padding: 10mm; } }
    </style></head><body>
      <div class="cabecalho">
        <div>
          <h1>${empresa.nome || "Nota de Venda"}</h1>
          ${empresa.cnpj ? `<p>CNPJ: ${empresa.cnpj}</p>` : ""}
          ${empresa.endereco ? `<p>${empresa.endereco}</p>` : ""}
          ${empresa.telefone ? `<p>Tel: ${empresa.telefone}</p>` : ""}
        </div>
        <div class="venda-info">
          <p><strong>Venda nº ${vendaNumero}</strong></p>
          <p>${new Date().toLocaleString("pt-BR")}</p>
        </div>
      </div>

      <div class="bloco-cliente">
        <p><strong>Cliente:</strong> ${cliente?.nome || "Consumidor final"}</p>
        ${cliente?.telefone ? `<p>Telefone: ${cliente.telefone}</p>` : ""}
        ${cliente?.cpf ? `<p>CPF: ${cliente.cpf}</p>` : ""}
        ${cliente?.endereco ? `<p>Endereço: ${cliente.endereco}</p>` : ""}
      </div>

      <table>
        <thead><tr><th>Código</th><th>Produto</th><th class="center">Un</th><th class="center">Qtd</th><th class="right">Preço un.</th><th class="right">Subtotal</th></tr></thead>
        <tbody>${linhasItens}</tbody>
      </table>

      <div class="totais">
        <div><span>Subtotal</span><span>${formatarMoeda(subtotal)}</span></div>
        ${desconto > 0 ? `<div><span>Desconto</span><span>-${formatarMoeda(desconto)}</span></div>` : ""}
        <div class="final"><span>Total</span><span>${formatarMoeda(total)}</span></div>
        <div><span>Forma de pagamento</span><span>${LABEL_FORMA_PAGAMENTO[formaPagamento]}</span></div>
        ${valorPago !== null ? `<div><span>Valor pago</span><span>${formatarMoeda(valorPago)}</span></div>` : ""}
        ${troco > 0 ? `<div><span>Troco</span><span>${formatarMoeda(troco)}</span></div>` : ""}
      </div>

      <div class="rodape">Documento sem valor fiscal — não substitui nota fiscal eletrônica.</div>
    </body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
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
  const [buscaIndiceAtivo, setBuscaIndiceAtivo] = useState(0);
  const [resumoFiado, setResumoFiado] = useState<ResumoFiado | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteFiado | null>(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [clientesExtra, setClientesExtra] = useState<ClienteFiado[]>([]);
  const [mostrarCadastroCliente, setMostrarCadastroCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [novoClienteTelefone, setNovoClienteTelefone] = useState("");
  const [salvandoNovoCliente, setSalvandoNovoCliente] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<FormaPagamento>("dinheiro");
  const [valorPago, setValorPago] = useState<number | "">("");
  const [lancamentosHoje, setLancamentosHoje] = useState<LancamentoCaixa[]>([]);
  const [tipoImpressao, setTipoImpressao] = useState<"cupom" | "nota">("cupom");
  const [empresa, setEmpresa] = useState<DadosEmpresa>({ nome: "", cnpj: "", endereco: "", telefone: "", chavePix: "", cidade: "" });
  const [showConfig, setShowConfig] = useState(false);
  const [qrPixUrl, setQrPixUrl] = useState<string | null>(null);
  const [gerandoQrPix, setGerandoQrPix] = useState(false);
  const inputCodigoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmpresa(obterDadosEmpresa());
    const tipo = localStorage.getItem("pdv_tipo_impressao");
    if (tipo === "nota") setTipoImpressao("nota");
  }, []);

  const gerarQrPix = async () => {
    if (!empresa.chavePix) { setShowConfig(true); return; }
    setGerandoQrPix(true);
    try {
      const payload = gerarPayloadPix({ chave: empresa.chavePix, nomeRecebedor: empresa.nome || usuarioNome || "Recebedor", cidade: empresa.cidade, valor: total });
      const url = await QRCode.toDataURL(payload, { width: 260, margin: 1 });
      setQrPixUrl(url);
    } catch {
      toast.error("Não deu pra gerar o QR Code — confira a chave Pix cadastrada");
    } finally {
      setGerandoQrPix(false);
    }
  };

  const salvarConfig = () => {
    salvarDadosEmpresa(empresa);
    localStorage.setItem("pdv_tipo_impressao", tipoImpressao);
    setShowConfig(false);
    toast.success("Configurações salvas!");
  };

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

  const todosClientes = useMemo(() => [...clientes, ...clientesExtra], [clientes, clientesExtra]);

  // Fiado embarcado no PDV: escolher "Fiado" sem cliente cadastrado ja'
  // abre o cadastro na hora, em vez de deixar a lista vazia sem acao (ver
  // app/pdv/fiado/page.tsx pro contexto de por que o fiado nao pede mais
  // aprovacao do admin master).
  const abrirSelecaoCliente = () => {
    setShowModalCliente(true);
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
      setShowModalCliente(false);
      toast.success("Cliente cadastrado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar cliente");
    } finally {
      setSalvandoNovoCliente(false);
    }
  };

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
    // Etiqueta impressa (/pdv/etiquetas) usa o estoqueId como codigo pra
    // produto com variacao, ja' que o EAN e' compartilhado entre variantes
    // e nao identificaria qual delas foi escaneada (ver lib/pdv/agruparPorCatalogo.ts).
    let grupo = produtosPorEan.get(cod);
    if (!grupo) {
      const porId = produtos.find((p) => p.estoqueId === cod);
      if (porId) grupo = [porId];
    }
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

  const podeFinalizar = carrinho.length > 0 && !finalizando && !(metodoPagamento === "dinheiro" && (typeof valorPago !== "number" || valorPago < total));

  // Atalhos de teclado -- quem opera caixa o dia todo ganha velocidade sem
  // precisar do mouse (mesmo espirito dos F2/F3/F4/F9 do sistema de
  // referencia, adaptados pras acoes que a nossa tela realmente tem).
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showScanner) setShowScanner(false);
        else if (showBusca) { setShowBusca(false); setBuscaTexto(""); }
        else if (grupoParaEscolher) setGrupoParaEscolher(null);
        else if (showModalCliente) { setShowModalCliente(false); setMostrarCadastroCliente(false); }
        else if (showConfig) setShowConfig(false);
        else if (qrPixUrl) setQrPixUrl(null);
        else if (resumoFiado) setResumoFiado(null);
        return;
      }
      if (e.key === "F2") { e.preventDefault(); inputCodigoRef.current?.focus(); return; }
      if (e.key === "F3") { e.preventDefault(); setShowBusca(true); return; }
      if (e.key === "F9") { e.preventDefault(); abrirSelecaoCliente(); return; }
      if (e.key === "F4") {
        e.preventDefault();
        if (podeFinalizar) confirmar(false);
        return;
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner, showBusca, grupoParaEscolher, showModalCliente, showConfig, qrPixUrl, resumoFiado, podeFinalizar]);

  const confirmar = async (forcarLimite = false) => {
    if (metodoPagamento === "fiado" && !clienteSelecionado) {
      abrirSelecaoCliente();
      return;
    }
    const itensAntes = carrinho;
    const subtotalAntes = subtotal;
    const descontoAntes = desconto;
    const totalAntes = total;
    const clienteAntes = clienteSelecionado;
    const formaAntes = metodoPagamento;
    const valorPagoAntes = valorPago;
    const vendaNumeroAntes = vendasHoje.length + 1;

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
    if (formaAntes === "fiado" && clienteAntes) {
      // Fiado nao mostra o cupom/nota generico -- o que importa aqui e' o
      // saldo total que o cliente passou a dever, nao o comprovante da
      // venda em si (ele ja e' registrado sozinho no /pdv/fiado).
      setResumoFiado({
        cliente: clienteAntes,
        valor: totalAntes,
        vencimento: resultado.dataVencimentoFiado || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        saldoTotal: resultado.saldoTotalCliente ?? totalAntes,
      });
    } else if (tipoImpressao === "nota") {
      imprimirNotaVenda({
        vendaNumero: vendaNumeroAntes,
        itens: itensAntes,
        subtotal: subtotalAntes,
        desconto: descontoAntes,
        total: totalAntes,
        formaPagamento: formaAntes,
        valorPago: formaAntes === "dinheiro" ? Number(valorPagoAntes || totalAntes) : null,
        troco: resultado.troco || 0,
        cliente: clienteAntes,
        empresa,
      });
    } else {
      imprimirComprovante(
        itensAntes.map((i) => ({ nome: i.nome, preco: i.preco, quantidade: i.quantidade })),
        subtotalAntes, descontoAntes, totalAntes, clienteAntes, empresa.nome
      );
    }
    setClienteSelecionado(null);
    setValorPago("");
    setMetodoPagamento("dinheiro");
    setQrPixUrl(null);
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
          <div className="flex items-center gap-3">
            <button onClick={abrirSelecaoCliente} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium" title="Selecionar cliente (F9)">
              <User className="w-4 h-4" /> {clienteSelecionado?.nome || "Consumidor final"}
            </button>
            <button onClick={() => setShowConfig(true)} className="text-gray-400 hover:text-gray-600" title="Dados da empresa e tipo de recibo">
              <Settings className="w-4 h-4" />
            </button>
          </div>
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
              placeholder="Código de barras (F2) — escaneia ou digita e aperta Enter"
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button onClick={() => setShowScanner(true)} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl" title="Escanear com a câmera">
            <ScanBarcode className="w-5 h-5" />
          </button>
          <button onClick={() => setShowBusca(true)} className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl" title="Buscar por nome (F3)">
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
                onClick={() => { setMetodoPagamento(id); if (id === "fiado" && !clienteSelecionado) abrirSelecaoCliente(); }}
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

          {metodoPagamento === "pix" && (
            <button
              onClick={gerarQrPix}
              disabled={gerandoQrPix || total <= 0}
              className="px-3 py-2.5 bg-white border-2 border-blue-200 text-blue-700 rounded-xl text-sm font-medium disabled:opacity-50 whitespace-nowrap"
            >
              {gerandoQrPix ? "Gerando..." : "Mostrar QR Code"}
            </button>
          )}

          <button
            onClick={() => confirmar(false)}
            disabled={!podeFinalizar}
            title="Finalizar venda (F4)"
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap"
          >
            {finalizando ? "Processando..." : "Finalizar venda (F4)"}
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
              onChange={(e) => { setBuscaTexto(e.target.value); setBuscaIndiceAtivo(0); }}
              onKeyDown={(e) => {
                if (gruposBusca.length === 0) return;
                if (e.key === "ArrowDown") { e.preventDefault(); setBuscaIndiceAtivo((i) => Math.min(i + 1, gruposBusca.length - 1)); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setBuscaIndiceAtivo((i) => Math.max(i - 1, 0)); }
                else if (e.key === "Enter") {
                  e.preventDefault();
                  const grupo = gruposBusca[buscaIndiceAtivo];
                  if (grupo) { adicionarOuEscolher(grupo, qtdEntrada || 1); setQtdEntrada(1); setShowBusca(false); setBuscaTexto(""); }
                }
              }}
              placeholder="Nome do produto... (setas pra navegar, Enter pra adicionar)"
              className="w-full px-3 py-2.5 border rounded-xl text-sm mb-2"
            />
            <div className="max-h-72 overflow-y-auto space-y-1">
              {gruposBusca.map((grupo, idx) => (
                <button
                  key={grupo[0].catalogoId || grupo[0].estoqueId}
                  onClick={() => { adicionarOuEscolher(grupo, qtdEntrada || 1); setQtdEntrada(1); setShowBusca(false); setBuscaTexto(""); }}
                  onMouseEnter={() => setBuscaIndiceAtivo(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center text-sm border-2 transition-colors ${idx === buscaIndiceAtivo ? "bg-blue-100 border-blue-500" : "border-transparent hover:bg-gray-50"}`}
                >
                  <span className="text-gray-800 flex items-center gap-1.5">
                    {idx === buscaIndiceAtivo && <span className="text-blue-600">▶</span>}
                    {grupo[0].nome}{grupo.length > 1 && <span className="ml-1.5 text-xs text-blue-600 font-medium">{grupo.length} opções</span>}
                  </span>
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

      {qrPixUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-800">Pague com Pix</h2>
              <button onClick={() => setQrPixUrl(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <img src={qrPixUrl} alt="QR Code Pix" className="mx-auto rounded-lg border" />
            <p className="text-lg font-bold text-gray-800 mt-3">{formatarMoeda(total)}</p>
            <p className="text-xs text-gray-400 mt-1">Peça pro cliente escanear com o app do banco dele. O pagamento cai direto na sua conta — confirme visualmente antes de finalizar a venda.</p>
            <button onClick={() => setQrPixUrl(null)} className="w-full mt-4 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium">Fechar</button>
          </div>
        </div>
      )}

      {resumoFiado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
                onClick={() => abrirWhatsapp(resumoFiado.cliente.telefone, `Olá, ${resumoFiado.cliente.nome}! Aqui é ${empresa.nome || "a loja"}. Compra de ${formatarMoeda(resumoFiado.valor)} no fiado, vencimento em ${formatarDataBR(resumoFiado.vencimento)}. Saldo total em aberto: ${formatarMoeda(resumoFiado.saldoTotal)}.`)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Dados da empresa</h2>
              <button onClick={() => setShowConfig(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Nome da empresa</label>
                <input value={empresa.nome} onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })} placeholder="Ex: Mercadinho da Dona Neide" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">CNPJ (opcional)</label>
                <input value={empresa.cnpj} onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Endereço (opcional)</label>
                <input value={empresa.endereco} onChange={(e) => setEmpresa({ ...empresa, endereco: e.target.value })} placeholder="Rua, número, bairro — Valente/BA" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Telefone (opcional)</label>
                <input value={empresa.telefone} onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })} placeholder="(75) 99999-9999" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="pt-2 border-t">
                <label className="text-xs font-medium text-gray-500">Chave Pix (pra gerar QR Code na venda)</label>
                <input value={empresa.chavePix} onChange={(e) => setEmpresa({ ...empresa, chavePix: e.target.value })} placeholder="CPF, e-mail, telefone ou chave aleatória" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Cidade (pro QR Code Pix)</label>
                <input value={empresa.cidade} onChange={(e) => setEmpresa({ ...empresa, cidade: e.target.value })} placeholder="VALENTE" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="pt-2 border-t">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">O que imprime ao finalizar a venda</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipoImpressao("cupom")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border ${tipoImpressao === "cupom" ? "border-blue-500 bg-blue-50 text-blue-700" : "text-gray-500"}`}
                  >
                    Cupom simples
                  </button>
                  <button
                    onClick={() => setTipoImpressao("nota")}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border ${tipoImpressao === "nota" ? "border-blue-500 bg-blue-50 text-blue-700" : "text-gray-500"}`}
                  >
                    Nota completa (A4)
                  </button>
                </div>
              </div>
              <button onClick={salvarConfig} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mt-2">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {showModalCliente && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[70vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">{mostrarCadastroCliente ? "Novo cliente" : "Selecionar cliente"}</h2>
              <button onClick={() => { setShowModalCliente(false); setMostrarCadastroCliente(false); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {mostrarCadastroCliente ? (
              <div className="space-y-3">
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
                  <button onClick={() => setMostrarCadastroCliente(false)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                    Voltar pra lista de clientes
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <button onClick={() => setMostrarCadastroCliente(true)} className="w-full text-left p-3 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 text-blue-600 font-medium text-sm">
                  + Novo cliente
                </button>
                <button
                  onClick={() => { setClienteSelecionado(null); setShowModalCliente(false); }}
                  className="w-full text-left p-3 border rounded-xl hover:bg-gray-50"
                >
                  <p className="font-medium text-sm">Consumidor final</p>
                  <p className="text-xs text-gray-400">Sem identificação</p>
                </button>
                {todosClientes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setClienteSelecionado(c); setShowModalCliente(false); }}
                    className="w-full text-left p-3 border rounded-xl hover:bg-gray-50"
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
