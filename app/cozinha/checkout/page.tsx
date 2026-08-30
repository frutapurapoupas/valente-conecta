"use client";

// Caminho: C:\valente_conecta\app\cozinha\checkout\page.tsx
//
// Fecha o carrinho iniciado em app/cozinha/catalogo/page.tsx (persistido em
// localStorage pelo hook useCatalogo) num pedido de verdade via
// POST /api/cozinha/pedidos. Resolve identidade sem login real (mesmo
// padrao do resto do projeto: cadastroSimples por nome+WhatsApp), deixa
// escolher retirada (gratis) ou entrega (taxa configuravel pelo admin), e
// a forma de pagamento entre as habilitadas em cozinha_checkout_config.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Copy, Loader2, MapPin, MessageCircle, Store } from "lucide-react";
import { getCurrentUser, cadastroSimples } from "@/lib/auth";

const CARRINHO_STORAGE_KEY = "cozinha_carrinho";

interface CarrinhoItem {
  quantidade: number;
  receitaId: string;
  cardapioId: string | null;
  titulo: string;
  preco: number;
  imagem: string;
}

const LABEL_PAGAMENTO: Record<string, string> = {
  mercado_pago: "Cartão / Pix (Mercado Pago)",
  pix_manual: "Pix direto (chave da cozinha)",
  combinado_admin: "Combinar com a cozinha",
};

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function CheckoutCozinhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perfil = searchParams?.get("perfil") || "publico";

  const [usuario, setUsuario] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);

  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<"retirada" | "entrega">("retirada");
  const [enderecoEntrega, setEnderecoEntrega] = useState("");
  const [observacao, setObservacao] = useState("");
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [formasAceitas, setFormasAceitas] = useState<string[]>(["mercado_pago"]);
  const [formaPagamento, setFormaPagamento] = useState("mercado_pago");
  const [enviando, setEnviando] = useState(false);

  const [confirmacao, setConfirmacao] = useState<{ pedidoId: string; checkoutUrl: string | null } | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (u) {
      setNome(u.nome || "");
      setWhatsapp(u.whatsapp || "");
    }

    try {
      const raw = localStorage.getItem(CARRINHO_STORAGE_KEY);
      const itens = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(itens) || itens.length === 0) {
        router.replace("/cozinha/catalogo");
        return;
      }
      setCarrinho(itens);
    } catch {
      router.replace("/cozinha/catalogo");
    }
  }, [router]);

  useEffect(() => {
    fetch("/api/entrega-avulsa/config")
      .then((r) => r.json())
      .then((resp) => { if (resp.success) setTaxaEntrega(Number(resp.data.taxaEntregaPadrao) || 0); })
      .catch(() => {});

    fetch("/api/cozinha/checkout-config")
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success && Array.isArray(resp.data.formasPagamentoAceitas) && resp.data.formasPagamentoAceitas.length > 0) {
          setFormasAceitas(resp.data.formasPagamentoAceitas);
          setFormaPagamento(resp.data.formasPagamentoAceitas[0]);
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = useMemo(() => carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0), [carrinho]);
  const total = subtotal + (tipoEntrega === "entrega" ? taxaEntrega : 0);

  const opcoesPagamento = useMemo(() => {
    const opcoes = formasAceitas.map((id) => ({ id, label: LABEL_PAGAMENTO[id] || id }));
    if (perfil === "revendedor" && !opcoes.some((o) => o.id === "combinado_admin")) {
      opcoes.push({ id: "combinado_admin", label: "Combinar com a cozinha (sujeito a aprovação)" });
    }
    return opcoes;
  }, [formasAceitas, perfil]);

  const identidadeResolvida = !!usuario;

  const confirmarCadastroRapido = async () => {
    if (!nome.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setSalvandoCadastro(true);
    try {
      const resultado = await cadastroSimples(nome.trim(), whatsapp.trim());
      if (!resultado.success || !resultado.user) throw new Error(resultado.error || "Erro ao cadastrar");
      setUsuario(resultado.user);
      toast.success("Cadastro confirmado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setSalvandoCadastro(false);
    }
  };

  const finalizarPedido = async () => {
    if (!nome.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    if (tipoEntrega === "entrega" && !enderecoEntrega.trim()) {
      toast.error("Informe o endereço de entrega");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch("/api/cozinha/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNome: nome.trim(),
          clienteWhatsapp: whatsapp.trim(),
          perfil,
          itens: carrinho.map((item) => ({ receitaId: item.receitaId, cardapioId: item.cardapioId, quantidade: item.quantidade })),
          tipoEntrega,
          enderecoEntrega: tipoEntrega === "entrega" ? enderecoEntrega.trim() : undefined,
          observacao: observacao.trim() || undefined,
          formaPagamento,
        }),
      }).then((r) => r.json());

      if (!resp.success) throw new Error(resp.error || "Erro ao criar pedido");

      localStorage.removeItem(CARRINHO_STORAGE_KEY);
      setConfirmacao({ pedidoId: resp.data.id, checkoutUrl: resp.checkoutUrl || null });
    } catch (err: any) {
      toast.error(err.message || "Erro ao finalizar pedido");
    } finally {
      setEnviando(false);
    }
  };

  if (confirmacao) {
    const link = typeof window !== "undefined" ? `${window.location.origin}/cozinha/pedido/${confirmacao.pedidoId}` : "";
    const whatsappLimpo = whatsapp.replace(/\D/g, "");
    const numeroCompleto = whatsappLimpo.startsWith("55") ? whatsappLimpo : `55${whatsappLimpo}`;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <Toaster position="top-center" />
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Pedido enviado!</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">Acompanhe o status do seu pedido pelo link abaixo.</p>

        <div className="bg-white border rounded-xl p-3 w-full max-w-sm mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-500 truncate flex-1 text-left">{link}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copiado!"); }}
            className="p-1.5 text-gray-500 hover:text-gray-800"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => window.open(`https://wa.me/${numeroCompleto}?text=${encodeURIComponent(`Meu pedido na Cozinha Chef Neide: ${link}`)}`, "_blank")}
          className="w-full max-w-sm mb-3 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold"
        >
          <MessageCircle className="w-4 h-4" /> Guardar no meu WhatsApp
        </button>

        {confirmacao.checkoutUrl ? (
          <button
            onClick={() => window.location.href = confirmacao.checkoutUrl!}
            className="w-full max-w-sm bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            Pagar agora
          </button>
        ) : (
          <button
            onClick={() => router.push(`/cozinha/pedido/${confirmacao.pedidoId}`)}
            className="w-full max-w-sm bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            Acompanhar meu pedido
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Toaster position="top-center" />
      <div className="max-w-lg mx-auto p-4 sm:p-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar pedido</h1>

        <div className="bg-white rounded-2xl border p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Seus itens</h2>
          <div className="space-y-2">
            {carrinho.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.quantidade}x {item.titulo}</span>
                <span className="text-gray-600">{formatarMoeda(item.preco * item.quantidade)}</span>
              </div>
            ))}
          </div>
        </div>

        {!identidadeResolvida && (
          <div className="bg-white rounded-2xl border p-4 mb-4 space-y-3">
            <h2 className="font-semibold text-gray-700">Seus dados</h2>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp (com DDD)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <button onClick={confirmarCadastroRapido} disabled={salvandoCadastro} className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
              {salvandoCadastro ? "Confirmando..." : "Confirmar dados"}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Como você quer receber?</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setTipoEntrega("retirada")}
              className={`py-2.5 rounded-xl text-sm font-medium border ${tipoEntrega === "retirada" ? "border-orange-500 bg-orange-50 text-orange-700" : "text-gray-500"}`}
            >
              Retirar no local
            </button>
            <button
              onClick={() => setTipoEntrega("entrega")}
              className={`py-2.5 rounded-xl text-sm font-medium border ${tipoEntrega === "entrega" ? "border-orange-500 bg-orange-50 text-orange-700" : "text-gray-500"}`}
            >
              Entrega ({formatarMoeda(taxaEntrega)})
            </button>
          </div>
          {tipoEntrega === "entrega" && (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={enderecoEntrega}
                onChange={(e) => setEnderecoEntrega(e.target.value)}
                placeholder="Rua, número, bairro — Valente/BA"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-4 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Forma de pagamento</h2>
          <div className="space-y-2">
            {opcoesPagamento.map((opcao) => (
              <button
                key={opcao.id}
                onClick={() => setFormaPagamento(opcao.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border ${formaPagamento === opcao.id ? "border-orange-500 bg-orange-50 text-orange-700" : "text-gray-600"}`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4 mb-4">
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação (opcional)"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            rows={2}
          />
        </div>

        <div className="bg-white rounded-2xl border p-4 mb-6 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatarMoeda(subtotal)}</span></div>
          {tipoEntrega === "entrega" && <div className="flex justify-between text-gray-500"><span>Taxa de entrega</span><span>{formatarMoeda(taxaEntrega)}</span></div>}
          <div className="flex justify-between font-bold text-gray-800 text-base pt-1.5 border-t"><span>Total</span><span>{formatarMoeda(total)}</span></div>
        </div>

        <button
          onClick={finalizarPedido}
          disabled={enviando}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalizar pedido"}
        </button>
      </div>
    </div>
  );
}
