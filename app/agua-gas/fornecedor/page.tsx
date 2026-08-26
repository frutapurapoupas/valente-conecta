"use client";

// Caminho: C:\valente_conecta\app\agua-gas\fornecedor\page.tsx
//
// Painel do fornecedor de agua/gas (camada 2 — admin da loja). Reescrito do
// zero: a versao anterior era um wizard de CNPJ que so' simulava
// "await new Promise(setTimeout)" e nunca salvava nada de verdade, alem de
// ficar atras de um isAdmin (admin master) que nunca fica true sem login —
// tornando a pagina inalcancavel na pratica. Agora usa o mesmo padrao de
// identidade local (lib/usuarioLocal.ts) usado no resto do catalogo, e
// persiste de verdade via /api/agua-gas (ver 014_agua_gas_supabase.sql).

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Store, Package, ShoppingBag, Plus, Trash2, Loader2, Truck, MapPin, Users, Clock, Wallet, CheckCircle2 } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

const DIAS_SEMANA = [
  { chave: "seg", label: "Segunda" },
  { chave: "ter", label: "Terça" },
  { chave: "qua", label: "Quarta" },
  { chave: "qui", label: "Quinta" },
  { chave: "sex", label: "Sexta" },
  { chave: "sab", label: "Sábado" },
  { chave: "dom", label: "Domingo" },
] as const;

interface DiaFuncionamento { ativo: boolean; abre: string; fecha: string; }
type DiasFuncionamento = Record<string, DiaFuncionamento>;

const diasFuncionamentoPadrao = (): DiasFuncionamento =>
  Object.fromEntries(DIAS_SEMANA.map((d) => [d.chave, { ativo: d.chave !== "dom", abre: "08:00", fecha: "18:00" }]));

const FORMAS_PAGAMENTO = [
  { chave: "aceitaDinheiro", label: "Dinheiro" },
  { chave: "aceitaCartao", label: "Cartão" },
  { chave: "aceitaPix", label: "PIX" },
  { chave: "aceitaValeGas", label: "Vale-Gás / benefício do governo" },
  { chave: "aceitaFiado", label: "Fiado" },
] as const;

const TIPOS_PRODUTO = [
  { id: "agua_garrafao", label: "Garrafão 20L", unidade: "unidade" },
  { id: "agua_mineral", label: "Água Mineral", unidade: "fardo" },
  { id: "gas_p13", label: "Gás P13", unidade: "unidade" },
  { id: "gas_p20", label: "Gás P20", unidade: "unidade" },
  { id: "gas_p45", label: "Gás P45", unidade: "unidade" },
  { id: "gas_granel", label: "Gás Granel", unidade: "kg" },
  { id: "outro", label: "Outro produto", unidade: "unidade" },
];

interface Produto { tipo: string; descricao: string; preco: number; unidade: string; disponivel: boolean; }
interface Fornecedor {
  id: string; nome: string; responsavel: string; telefone: string; whatsapp: string;
  bairro: string; cidade: string; descricao: string; horario: string;
  atendimento24h: boolean; diasFuncionamento: DiasFuncionamento | null;
  temEntrega: boolean; taxaEntrega: number; freteGratisAcima: number;
  produtos: Produto[]; status: string; destaque: boolean;
  latitude: number | null; longitude: number | null;
  precoAguaPadrao: number | null; descricaoAguaPadrao: string;
  precoGasPadrao: number | null; descricaoGasPadrao: string;
  mpConectado: boolean;
  aceitaDinheiro: boolean; aceitaCartao: boolean; aceitaPix: boolean; aceitaValeGas: boolean; aceitaFiado: boolean;
}
interface Pedido {
  id: string; clienteNome: string; clienteTelefone: string; produto: string;
  quantidade: number; valorTotal: number | null; endereco: string; status: string; createdAt: string;
  formaPagamento: string; entregadorId: string | null;
}
interface Entregador {
  id: string; fornecedorId: string; nome: string; telefone: string;
  fotoUrl: string; veiculo: string; ativo: boolean;
  latitude: number | null; longitude: number | null;
}

type Aba = "dados" | "produtos" | "entregadores" | "pedidos";

export default function FornecedorAguaGasPage() {
  const searchParams = useSearchParams();
  const [donoId, setDonoId] = useState("");
  const [aba, setAba] = useState<Aba>("dados");
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setDonoId(obterUsuarioLocalId());
  }, []);

  useEffect(() => {
    if (!donoId) return;
    carregarMeuFornecedor();
  }, [donoId]);

  useEffect(() => {
    const mpConectado = searchParams?.get("mpConectado");
    const mpErro = searchParams?.get("mpErro");
    if (mpConectado) {
      toast.success("Conta Mercado Pago conectada! Agora você já pode receber pagamentos online no pedido rápido.");
      if (donoId) carregarMeuFornecedor();
      window.history.replaceState(null, "", "/agua-gas/fornecedor");
    } else if (mpErro) {
      toast.error(mpErro);
      window.history.replaceState(null, "", "/agua-gas/fornecedor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, donoId]);

  const carregarMeuFornecedor = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/agua-gas?donoId=${donoId}`);
      const resultado = await resp.json();
      const meu = resultado.success && resultado.data.length > 0 ? resultado.data[0] : null;
      setFornecedor(meu);
    } finally {
      setLoading(false);
    }
  };

  const criarCadastro = async (
    dados: Omit<Fornecedor, "id" | "status" | "destaque" | "produtos" | "atendimento24h" | "diasFuncionamento" | "precoAguaPadrao" | "descricaoAguaPadrao" | "precoGasPadrao" | "descricaoGasPadrao" | "mpConectado">
  ) => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/agua-gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, donoId, produtos: [] }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setFornecedor(resultado.data);
      toast.success("Cadastro criado! Agora adicione seus produtos.");
      setAba("produtos");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao criar cadastro");
    } finally {
      setSalvando(false);
    }
  };

  const atualizarFornecedor = async (patch: Partial<Fornecedor>) => {
    if (!fornecedor) return;
    try {
      const resp = await fetch(`/api/agua-gas?id=${fornecedor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setFornecedor(resultado.data);
      return resultado.data;
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!fornecedor) {
    return <FormularioCadastroInicial onSalvar={criarCadastro} salvando={salvando} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-1">{fornecedor.nome}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Status: <span className={fornecedor.status === "publicado" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
          {fornecedor.status === "publicado" ? "Publicado" : "Aguardando aprovação do admin master"}
        </span>
      </p>

      <div className="flex gap-1 border-b mb-6">
        <AbaBotao ativo={aba === "dados"} onClick={() => setAba("dados")} icone={<Store className="w-4 h-4" />} label="Meus dados" />
        <AbaBotao ativo={aba === "produtos"} onClick={() => setAba("produtos")} icone={<Package className="w-4 h-4" />} label="Produtos" />
        <AbaBotao ativo={aba === "entregadores"} onClick={() => setAba("entregadores")} icone={<Users className="w-4 h-4" />} label="Entregadores" />
        <AbaBotao ativo={aba === "pedidos"} onClick={() => setAba("pedidos")} icone={<ShoppingBag className="w-4 h-4" />} label="Pedidos recebidos" />
      </div>

      {aba === "dados" && <AbaDados fornecedor={fornecedor} onSalvar={atualizarFornecedor} />}
      {aba === "produtos" && <AbaProdutos fornecedor={fornecedor} onSalvar={atualizarFornecedor} />}
      {aba === "entregadores" && <AbaEntregadores fornecedorId={fornecedor.id} />}
      {aba === "pedidos" && <AbaPedidos fornecedorId={fornecedor.id} />}
    </div>
  );
}

function AbaBotao({ ativo, onClick, icone, label }: { ativo: boolean; onClick: () => void; icone: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        ativo ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icone} {label}
    </button>
  );
}

function FormularioCadastroInicial({ onSalvar, salvando }: { onSalvar: (dados: any) => void; salvando: boolean }) {
  const [form, setForm] = useState({
    nome: "", responsavel: "", telefone: "", whatsapp: "", bairro: "", cidade: "Valente",
    descricao: "", horario: "", temEntrega: true, taxaEntrega: 0, freteGratisAcima: 0,
    latitude: null as number | null, longitude: null as number | null,
    aceitaDinheiro: true, aceitaCartao: false, aceitaPix: false, aceitaValeGas: false, aceitaFiado: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Preencha ao menos nome e telefone");
      return;
    }
    onSalvar(form);
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Truck className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Cadastrar como fornecedor</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Água e gás — preencha os dados da sua empresa para começar a vender pelo Valente Conecta.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 space-y-4">
        <Campo label="Nome da empresa *" value={form.nome} onChange={(v) => setForm((p) => ({ ...p, nome: v }))} />
        <Campo label="Responsável" value={form.responsavel} onChange={(v) => setForm((p) => ({ ...p, responsavel: v }))} />
        <Campo label="Telefone *" value={form.telefone} onChange={(v) => setForm((p) => ({ ...p, telefone: v }))} placeholder="(75) 9xxxx-xxxx" />
        <Campo label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))} />
        <Campo label="Bairro" value={form.bairro} onChange={(v) => setForm((p) => ({ ...p, bairro: v }))} />
        <Campo label="Horário de funcionamento" value={form.horario} onChange={(v) => setForm((p) => ({ ...p, horario: v }))} placeholder="Seg a sáb, 8h às 18h" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.temEntrega} onChange={(e) => setForm((p) => ({ ...p, temEntrega: e.target.checked }))} />
          Faço entrega
        </label>
        {form.temEntrega && (
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Taxa de entrega (R$)" type="number" value={String(form.taxaEntrega)} onChange={(v) => setForm((p) => ({ ...p, taxaEntrega: Number(v) || 0 }))} />
            <Campo label="Frete grátis acima de (R$)" type="number" value={String(form.freteGratisAcima)} onChange={(v) => setForm((p) => ({ ...p, freteGratisAcima: Number(v) || 0 }))} />
          </div>
        )}
        <button type="submit" disabled={salvando} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium">
          {salvando ? "Salvando..." : "Criar cadastro"}
        </button>
      </form>
    </div>
  );
}

function Campo({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function AbaDados({ fornecedor, onSalvar }: { fornecedor: Fornecedor; onSalvar: (p: Partial<Fornecedor>) => Promise<any> }) {
  const [form, setForm] = useState({ ...fornecedor, diasFuncionamento: fornecedor.diasFuncionamento || diasFuncionamentoPadrao() });
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [freteGratis, setFreteGratis] = useState(fornecedor.taxaEntrega === 0);
  const [salvando, setSalvando] = useState(false);

  const usarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta localização");
      return;
    }
    setBuscandoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        toast.success("Localização capturada!");
        setBuscandoLocalizacao(false);
      },
      () => {
        toast.error("Não foi possível obter sua localização");
        setBuscandoLocalizacao(false);
      }
    );
  };

  const setDia = (chave: string, patch: Partial<DiaFuncionamento>) => {
    setForm((p) => ({ ...p, diasFuncionamento: { ...p.diasFuncionamento, [chave]: { ...p.diasFuncionamento![chave], ...patch } } }));
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({ ...form, taxaEntrega: freteGratis ? 0 : form.taxaEntrega });
      toast.success("Dados salvos!");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="bg-white rounded-lg shadow p-5 space-y-5 max-w-lg">
      <div className="space-y-4">
        <Campo label="Nome da empresa" value={form.nome} onChange={(v) => setForm((p) => ({ ...p, nome: v }))} />
        <Campo label="Telefone" value={form.telefone} onChange={(v) => setForm((p) => ({ ...p, telefone: v }))} />
        <Campo label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))} />
        <Campo label="Bairro" value={form.bairro} onChange={(v) => setForm((p) => ({ ...p, bairro: v }))} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
        <button
          type="button"
          onClick={usarLocalizacaoAtual}
          disabled={buscandoLocalizacao}
          className="flex items-center gap-1.5 text-sm px-3 py-2 border rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-60"
        >
          <MapPin className="w-4 h-4" />
          {buscandoLocalizacao ? "Buscando..." : form.latitude ? "Localização salva — atualizar" : "Usar minha localização atual"}
        </button>
        <p className="text-xs text-gray-400 mt-1">Usada pra mostrar a distância até o cliente na hora do pedido.</p>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 text-blue-600" /> Dias e horários de funcionamento
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <input type="checkbox" checked={form.atendimento24h} onChange={(e) => setForm((p) => ({ ...p, atendimento24h: e.target.checked }))} />
          Atendimento 24h
        </label>
        {!form.atendimento24h && (
          <div className="space-y-1.5">
            {DIAS_SEMANA.map((d) => {
              const dia = form.diasFuncionamento![d.chave];
              return (
                <div key={d.chave} className="flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-1.5 w-24 shrink-0 text-gray-700">
                    <input type="checkbox" checked={dia.ativo} onChange={(e) => setDia(d.chave, { ativo: e.target.checked })} />
                    {d.label}
                  </label>
                  <input
                    type="time"
                    value={dia.abre}
                    disabled={!dia.ativo}
                    onChange={(e) => setDia(d.chave, { abre: e.target.value })}
                    className="border rounded-lg px-2 py-1 text-sm disabled:opacity-40"
                  />
                  <span className="text-gray-400">às</span>
                  <input
                    type="time"
                    value={dia.fecha}
                    disabled={!dia.ativo}
                    onChange={(e) => setDia(d.chave, { fecha: e.target.value })}
                    className="border rounded-lg px-2 py-1 text-sm disabled:opacity-40"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.temEntrega} onChange={(e) => setForm((p) => ({ ...p, temEntrega: e.target.checked }))} />
          Faço entrega
        </label>
        {form.temEntrega && (
          <div className="mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={freteGratis} onChange={(e) => setFreteGratis(e.target.checked)} />
              Frete grátis
            </label>
            {!freteGratis && (
              <div className="mt-2 max-w-[10rem]">
                <Campo label="Valor do frete (R$)" type="number" value={String(form.taxaEntrega)} onChange={(v) => setForm((p) => ({ ...p, taxaEntrega: Number(v) || 0 }))} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Formas de pagamento aceitas</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {FORMAS_PAGAMENTO.map((f) => (
            <label key={f.chave} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form[f.chave]}
                onChange={(e) => setForm((p) => ({ ...p, [f.chave]: e.target.checked }))}
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Preço do pedido rápido (1 toque)</p>
        <p className="text-xs text-gray-400 -mt-2">
          É o preço que aparece quando o cliente aperta direto no botão Água ou Gás na página principal, sem precisar escolher entre vários produtos.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Descrição (água)" value={form.descricaoAguaPadrao || ""} onChange={(v) => setForm((p) => ({ ...p, descricaoAguaPadrao: v }))} placeholder="Garrafão 20L" />
          <Campo label="Preço (R$)" type="number" value={String(form.precoAguaPadrao ?? "")} onChange={(v) => setForm((p) => ({ ...p, precoAguaPadrao: v === "" ? null : Number(v) }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Descrição (gás)" value={form.descricaoGasPadrao || ""} onChange={(v) => setForm((p) => ({ ...p, descricaoGasPadrao: v }))} placeholder="Botijão P13" />
          <Campo label="Preço (R$)" type="number" value={String(form.precoGasPadrao ?? "")} onChange={(v) => setForm((p) => ({ ...p, precoGasPadrao: v === "" ? null : Number(v) }))} />
        </div>
      </div>

      <button type="submit" disabled={salvando} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60">
        {salvando ? "Salvando..." : "Salvar"}
      </button>

      <ContaMercadoPagoCard fornecedor={fornecedor} />
    </form>
  );
}

function ContaMercadoPagoCard({ fornecedor }: { fornecedor: Fornecedor }) {
  if (fornecedor.mpConectado) {
    return (
      <div className="border-t pt-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Conta Mercado Pago conectada</p>
            <p className="text-xs text-green-700">Você já pode receber pagamentos online no pedido rápido, com a taxa da plataforma descontada automaticamente.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="border-t pt-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-sm font-medium text-blue-800 flex items-center gap-1.5"><Wallet className="w-4 h-4" /> Receber pagamento online</p>
        <p className="text-xs text-blue-700 mt-1 mb-2">
          Conecte sua conta Mercado Pago pra receber os pagamentos do pedido rápido direto na sua conta. Sem conectar, esses pedidos só podem ser combinados em dinheiro.
        </p>
        <a
          href={`/api/agua-gas/fornecedor/mercadopago/conectar?fornecedorId=${fornecedor.id}`}
          className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Conectar Mercado Pago
        </a>
      </div>
    </div>
  );
}

function AbaProdutos({ fornecedor, onSalvar }: { fornecedor: Fornecedor; onSalvar: (p: Partial<Fornecedor>) => Promise<any> }) {
  const [produtos, setProdutos] = useState<Produto[]>(fornecedor.produtos);
  const [novo, setNovo] = useState<Produto>({ tipo: "gas_p13", descricao: "", preco: 0, unidade: "unidade", disponivel: true });

  const adicionar = async () => {
    if (!novo.descricao.trim() || novo.preco <= 0) {
      toast.error("Preencha descrição e preço");
      return;
    }
    const atualizados = [...produtos, novo];
    setProdutos(atualizados);
    setNovo({ tipo: "gas_p13", descricao: "", preco: 0, unidade: "unidade", disponivel: true });
    await onSalvar({ produtos: atualizados });
    toast.success("Produto adicionado!");
  };

  const remover = async (index: number) => {
    const atualizados = produtos.filter((_, i) => i !== index);
    setProdutos(atualizados);
    await onSalvar({ produtos: atualizados });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        {produtos.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Nenhum produto cadastrado ainda.</p>
        ) : (
          produtos.map((p, i) => (
            <div key={i} className="flex items-center gap-3 border-b last:border-0 py-2">
              <span className="flex-1 text-sm">{p.descricao || TIPOS_PRODUTO.find((t) => t.id === p.tipo)?.label}</span>
              <span className="text-sm font-medium text-blue-600">R$ {p.preco.toFixed(2)}</span>
              <button onClick={() => remover(i)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Novo produto</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={novo.tipo}
            onChange={(e) => {
              const t = TIPOS_PRODUTO.find((x) => x.id === e.target.value);
              setNovo((p) => ({ ...p, tipo: e.target.value, unidade: t?.unidade || "unidade" }));
            }}
            className="border rounded-lg px-2 py-2 text-sm"
          >
            {TIPOS_PRODUTO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <input
            value={novo.descricao}
            onChange={(e) => setNovo((p) => ({ ...p, descricao: e.target.value }))}
            placeholder="Descrição"
            className="border rounded-lg px-2 py-2 text-sm"
          />
          <input
            type="number"
            step="0.5"
            value={novo.preco}
            onChange={(e) => setNovo((p) => ({ ...p, preco: Number(e.target.value) }))}
            placeholder="Preço"
            className="border rounded-lg px-2 py-2 text-sm"
          />
          <button onClick={adicionar} className="flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg px-2 py-2 text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

function AbaEntregadores({ fornecedorId }: { fornecedorId: string }) {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState({ nome: "", telefone: "", veiculo: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    fetch(`/api/agua-gas?recurso=entregadores&fornecedorId=${fornecedorId}`)
      .then((r) => r.json())
      .then((res) => setEntregadores(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [fornecedorId]);

  const adicionar = async () => {
    if (!novo.nome.trim() || !novo.telefone.trim()) {
      toast.error("Preencha nome e telefone do entregador");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/agua-gas?recurso=entregadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fornecedorId, ...novo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Entregador cadastrado!");
      setNovo({ nome: "", telefone: "", veiculo: "" });
      carregar();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao cadastrar entregador");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (e: Entregador) => {
    await fetch(`/api/agua-gas?recurso=entregadores&id=${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !e.ativo }),
    });
    carregar();
  };

  const remover = async (id: string) => {
    await fetch(`/api/agua-gas?recurso=entregadores&id=${id}`, { method: "DELETE" });
    carregar();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Cadastre quem faz as entregas. Quando você designar um entregador pra um pedido, o cliente vai poder acompanhar no mapa.
      </p>

      <div className="bg-white rounded-lg shadow divide-y">
        {loading ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : entregadores.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">Nenhum entregador cadastrado ainda.</p>
        ) : (
          entregadores.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{e.nome}{e.veiculo ? ` · ${e.veiculo}` : ""}</p>
                <p className="text-xs text-gray-400">{e.telefone}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/agua-gas/entregador/${e.id}`;
                    window.open(`https://wa.me/55${e.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Oi ${e.nome}! Usa esse link no seu celular quando sair pra entregar, pra eu poder te acompanhar: ${link}`)}`, "_blank");
                  }}
                  className="text-xs px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                >
                  Enviar link
                </button>
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input type="checkbox" checked={e.ativo} onChange={() => alternarAtivo(e)} />
                  Ativo
                </label>
                <button onClick={() => remover(e.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Novo entregador</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={novo.nome}
            onChange={(e) => setNovo((p) => ({ ...p, nome: e.target.value }))}
            placeholder="Nome"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={novo.telefone}
            onChange={(e) => setNovo((p) => ({ ...p, telefone: e.target.value }))}
            placeholder="Telefone / WhatsApp"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={novo.veiculo}
            onChange={(e) => setNovo((p) => ({ ...p, veiculo: e.target.value }))}
            placeholder="Veículo (moto, carro...)"
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={adicionar}
          disabled={salvando}
          className="mt-2 flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> Adicionar entregador
        </button>
      </div>
    </div>
  );
}

function AbaPedidos({ fornecedorId }: { fornecedorId: string }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    Promise.all([
      fetch(`/api/agua-gas?recurso=pedidos&fornecedorId=${fornecedorId}`).then((r) => r.json()),
      fetch(`/api/agua-gas?recurso=entregadores&fornecedorId=${fornecedorId}`).then((r) => r.json()),
    ]).then(([resPedidos, resEntregadores]) => {
      setPedidos(resPedidos.success ? resPedidos.data : []);
      setEntregadores(resEntregadores.success ? resEntregadores.data.filter((e: Entregador) => e.ativo) : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [fornecedorId]);

  const atualizarStatus = async (id: string, status: string) => {
    await fetch(`/api/agua-gas?recurso=pedidos&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Pedido atualizado");
    carregar();
  };

  const enviarParaEntrega = async (id: string, entregadorId: string) => {
    if (!entregadorId) {
      toast.error("Escolha um entregador");
      return;
    }
    await fetch(`/api/agua-gas?recurso=pedidos&id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entregadorId, status: "em_entrega" }),
    });
    toast.success("Pedido a caminho! O cliente já pode acompanhar no mapa.");
    carregar();
  };

  if (loading) return <p className="text-gray-400 text-sm">Carregando...</p>;
  if (pedidos.length === 0) return <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhum pedido recebido ainda.</div>;

  return (
    <div className="space-y-2">
      {pedidos.map((p) => (
        <PedidoCard key={p.id} pedido={p} entregadores={entregadores} onAtualizarStatus={atualizarStatus} onEnviarParaEntrega={enviarParaEntrega} />
      ))}
    </div>
  );
}

function PedidoCard({ pedido: p, entregadores, onAtualizarStatus, onEnviarParaEntrega }: {
  pedido: Pedido; entregadores: Entregador[];
  onAtualizarStatus: (id: string, status: string) => void;
  onEnviarParaEntrega: (id: string, entregadorId: string) => void;
}) {
  const [entregadorEscolhido, setEntregadorEscolhido] = useState("");

  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{p.clienteNome} · {p.clienteTelefone}</p>
          <p className="text-sm text-gray-600">{p.produto} × {p.quantidade}{p.valorTotal ? ` — R$ ${p.valorTotal.toFixed(2)}` : ""}</p>
          {p.endereco && <p className="text-xs text-gray-400">{p.endereco}</p>}
          {p.formaPagamento && <p className="text-xs text-gray-400">Pagamento: {p.formaPagamento}</p>}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
          p.status === "confirmado" ? "bg-emerald-100 text-emerald-700" :
          p.status === "em_entrega" ? "bg-indigo-100 text-indigo-700" :
          p.status === "cancelado" ? "bg-red-100 text-red-700" :
          p.status === "entregue" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
        }`}>
          {p.status}
        </span>
      </div>
      {p.status === "pendente" && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => onAtualizarStatus(p.id, "confirmado")} className="text-xs px-2.5 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-medium">Confirmar</button>
          <button onClick={() => onAtualizarStatus(p.id, "cancelado")} className="text-xs px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">Cancelar</button>
        </div>
      )}
      {p.status === "confirmado" && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <select
            value={entregadorEscolhido}
            onChange={(e) => setEntregadorEscolhido(e.target.value)}
            className="text-xs border rounded-lg px-2 py-1.5"
          >
            <option value="">Escolher entregador...</option>
            {entregadores.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <button onClick={() => onEnviarParaEntrega(p.id, entregadorEscolhido)} className="text-xs px-2.5 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium">Enviar para entrega</button>
          <button onClick={() => onAtualizarStatus(p.id, "entregue")} className="text-xs px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">Marcar como entregue</button>
        </div>
      )}
      {p.status === "em_entrega" && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => onAtualizarStatus(p.id, "entregue")} className="text-xs px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">Marcar como entregue</button>
        </div>
      )}
    </div>
  );
}
