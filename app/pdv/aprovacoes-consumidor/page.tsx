"use client";

// Caminho: C:\valente_conecta\app\pdv\aprovacoes-consumidor\page.tsx
//
// Lojista revisa cadastros de produto feitos por CONSUMIDORES com nota
// fiscal (ver 093_cadastro_consumidor_produto.sql). Aprovar faz o produto
// aparecer no catálogo colaborativo do PDV imediatamente (pros próximos
// lojistas acharem pronto por EAN) e libera o bônus em Moeda Conecta do
// consumidor, se ele fechou um ciclo. Mesmo layout de
// app/admin-master/pdv-catalogo/moderacao/page.tsx, adaptado pro lojista.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, XCircle, UserCheck, Flag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import { ValidacaoProprietarioLoja } from "@/components/pdv/ValidacaoProprietarioLoja";

interface ItemPendente {
  id: string;
  nome_produto: string;
  categoria: string;
  ean: string | null;
  preco_pago: number | null;
  detalhes: string | null;
  foto_produto_url: string | null;
  foto_nota_fiscal_signed_url: string | null;
  foto_qrcode_signed_url: string | null;
  created_at: string;
}

interface ItemNaoReivindicado {
  id: string;
  nome_produto: string;
  categoria: string;
  nome_loja_texto: string | null;
  cidade: string | null;
  foto_produto_url: string | null;
  created_at: string;
}

export default function AprovacoesConsumidorPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);
  const [lista, setLista] = useState<ItemPendente[]>([]);
  const [naoReivindicados, setNaoReivindicados] = useState<ItemNaoReivindicado[]>([]);
  const [aba, setAba] = useState<"pendentes" | "sem_loja">("pendentes");
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [motivoPorId, setMotivoPorId] = useState<Record<string, string>>({});
  const [validacao, setValidacao] = useState<{ status: string; motivoRecusa: string | null } | null>(null);

  const carregar = (usuarioId: string) => {
    setLoading(true);
    fetch(`/api/pdv/aprovacoes-consumidor?usuarioId=${usuarioId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => setLista(resp.success ? resp.data : []))
      .finally(() => setLoading(false));
  };

  const carregarNaoReivindicados = () => {
    fetch(`/api/pdv/reivindicar-cadastro-consumidor`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => setNaoReivindicados(resp.success ? resp.data : []));
  };

  const carregarValidacao = (usuarioId: string) => {
    fetch(`/api/pdv/validacao-proprietario?usuarioId=${usuarioId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => resp.success && setValidacao(resp.data));
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) {
      carregar(u.id);
      carregarValidacao(u.id);
      carregarNaoReivindicados();
    } else {
      setLoading(false);
    }
  }, []);

  const reivindicar = async (id: string) => {
    if (!usuario) return;
    setProcessando(id);
    try {
      const resp = await fetch(`/api/pdv/reivindicar-cadastro-consumidor?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fornecedorId: usuario.id }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Reivindicado! Agora aparece na aba \"Pendentes\" pra você aprovar.");
      setNaoReivindicados((prev) => prev.filter((r) => r.id !== id));
      carregar(usuario.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao reivindicar");
    } finally {
      setProcessando(null);
    }
  };

  const processar = async (id: string, acao: "aprovar" | "recusar") => {
    if (!usuario) return;
    setProcessando(id);
    try {
      const resp = await fetch(`/api/pdv/aprovacoes-consumidor?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, fornecedorId: usuario.id, motivo: motivoPorId[id] || undefined }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Aprovado — produto já está no catálogo!" : "Recusado");
      setLista((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    } finally {
      setProcessando(null);
    }
  };

  if (!loading && !usuario) {
    return <div className="max-w-md mx-auto p-6 text-center text-gray-500">Complete seu cadastro no app pra usar essa área.</div>;
  }

  if (operador && !temPermissao(operador, "aprovacoes-consumidor")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Aprovações</h1>
      </header>
      <PdvSubNav ativa="aprovacoes-consumidor" operador={operador} />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          Produtos que clientes cadastraram dizendo que compraram na sua loja, com foto da nota fiscal. Aprovar coloca o produto no catálogo colaborativo do PDV.
        </div>

        {loading || !validacao ? (
          <p className="text-center text-sm text-gray-500 py-8">Carregando...</p>
        ) : usuario && validacao.status !== "aprovado" ? (
          <ValidacaoProprietarioLoja
            usuarioId={usuario.id}
            status={validacao.status as any}
            motivoRecusa={validacao.motivoRecusa}
            onEnviado={() => carregarValidacao(usuario.id)}
          />
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setAba("pendentes")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold ${aba === "pendentes" ? "bg-blue-600 text-white" : "bg-white border text-gray-600"}`}
              >
                Pendentes ({lista.length})
              </button>
              <button
                onClick={() => setAba("sem_loja")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold ${aba === "sem_loja" ? "bg-blue-600 text-white" : "bg-white border text-gray-600"}`}
              >
                Sem loja identificada ({naoReivindicados.length})
              </button>
            </div>

            {aba === "sem_loja" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                Clientes cadastraram esses produtos citando uma loja que a busca não achou (ainda sem cadastro no app, ou com nome diferente). Se algum for da sua loja, reivindique pra revisar e aprovar.
              </div>
            )}

            {aba === "pendentes" && lista.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-500">Nenhum cadastro pendente.</div>
            )}

            {aba === "sem_loja" && naoReivindicados.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-500">Nenhum cadastro sem loja identificada.</div>
            )}

            {aba === "sem_loja" && naoReivindicados.length > 0 && (
              <div className="space-y-3">
                {naoReivindicados.map((item) => (
                  <div key={item.id} className="bg-white border rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                      {item.foto_produto_url && (
                        <img src={item.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded-lg border" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800">{item.nome_produto}</p>
                        <p className="text-sm text-gray-500">{item.categoria}</p>
                        <p className="text-sm text-blue-700 mt-1">Loja citada: <strong>{item.nome_loja_texto || "—"}</strong></p>
                        {item.cidade && <p className="text-xs text-gray-400">{item.cidade}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => reivindicar(item.id)}
                      disabled={processando === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                    >
                      <Flag className="w-3.5 h-3.5" /> Essa é a minha loja, reivindicar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && validacao?.status === "aprovado" && aba === "pendentes" && lista.length > 0 && (
          <div className="space-y-3">
            {lista.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-4">
                <div className="flex gap-3 mb-3">
                  {item.foto_produto_url && (
                    <img src={item.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded-lg border" />
                  )}
                  {item.foto_nota_fiscal_signed_url && (
                    <a href={item.foto_nota_fiscal_signed_url} target="_blank" rel="noreferrer">
                      <img src={item.foto_nota_fiscal_signed_url} alt="Nota fiscal" className="w-20 h-20 object-cover rounded-lg border" />
                    </a>
                  )}
                  {item.foto_qrcode_signed_url && (
                    <a href={item.foto_qrcode_signed_url} target="_blank" rel="noreferrer">
                      <img src={item.foto_qrcode_signed_url} alt="QR code da nota" className="w-20 h-20 object-cover rounded-lg border" />
                    </a>
                  )}
                </div>
                <p className="font-medium text-sm text-gray-800">{item.nome_produto}</p>
                <p className="text-sm text-gray-500 mb-1">
                  {item.categoria}{item.ean ? ` · EAN ${item.ean}` : ""}{item.preco_pago ? ` · pago R$ ${Number(item.preco_pago).toFixed(2)}` : ""}
                </p>
                {item.detalhes && <p className="text-sm text-gray-500 mb-2">{item.detalhes}</p>}
                <input
                  value={motivoPorId[item.id] || ""}
                  onChange={(e) => setMotivoPorId((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Motivo da recusa (opcional se aprovar)"
                  className="w-full mb-3 mt-2 px-3 py-1.5 border rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => processar(item.id, "aprovar")}
                    disabled={processando === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                  </button>
                  <button
                    onClick={() => processar(item.id, "recusar")}
                    disabled={processando === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
