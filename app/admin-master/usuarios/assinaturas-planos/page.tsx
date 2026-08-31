"use client";

// Caminho: C:\valente_conecta\app\admin-master\usuarios\assinaturas-planos\page.tsx
// Admin master acompanha as assinaturas de plano escolhidas pelos usuarios
// e aprova fiado manualmente.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Check, X as XIcon, Building2 } from "lucide-react";

interface Assinatura {
  id: string;
  servico_id: string;
  plano_id: string;
  com_fiado: boolean;
  metodo_pagamento: string;
  parcelas: number;
  valor: number;
  notas_mensais_estimadas?: number | null;
  status: string;
  dados_complementares: any;
  created_at: string;
  usuario: { nome: string; whatsapp: string; cidade_base: string } | null;
}

// Mesmos ids gerados por buildService() em app/api/planos-config/route.ts
// (slug do nome do servico) -- so' os de comercio, unicos que habilitam o
// plano fisco.
const SERVICOS_FISCO = [
  { id: "mercearia_pequena", label: "Mercearia Pequena" },
  { id: "mercado_grande", label: "Mercado Grande" },
  { id: "lojas", label: "Lojas" },
  { id: "alimentacao", label: "Alimentação" },
  { id: "hotel_pousada", label: "Hotel / Pousada" },
];

const STATUS_LABEL: Record<string, string> = {
  pendente_pagamento: "Aguardando pagamento (online)",
  fiado_pendente: "Fiado — aguardando aprovação",
  pago: "Pago — aguardando dados",
  ativo: "Ativo",
  recusado: "Recusado",
  cancelado: "Cancelado",
};

const STATUS_COR: Record<string, string> = {
  pendente_pagamento: "bg-yellow-100 text-yellow-700",
  fiado_pendente: "bg-orange-100 text-orange-700",
  pago: "bg-blue-100 text-blue-700",
  ativo: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-700",
  cancelado: "bg-gray-100 text-gray-500",
};

export default function AdminAssinaturasPlanosPage() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

  const [fiscoWhatsapp, setFiscoWhatsapp] = useState("");
  const [fiscoServico, setFiscoServico] = useState(SERVICOS_FISCO[0].id);
  const [fiscoValor, setFiscoValor] = useState("");
  const [fiscoNotasEstimadas, setFiscoNotasEstimadas] = useState("");
  const [ativandoFisco, setAtivandoFisco] = useState(false);

  const carregar = () =>
    fetch("/api/admin-master/assinaturas-planos")
      .then((r) => r.json())
      .then((res) => res.success && setAssinaturas(res.data));

  useEffect(() => {
    carregar().finally(() => setCarregando(false));
  }, []);

  const mudarStatus = async (id: string, status: string) => {
    setAtualizandoId(id);
    try {
      const resp = await fetch(`/api/admin-master/assinaturas-planos?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setAssinaturas((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      toast.success("Atualizado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setAtualizandoId(null);
    }
  };

  const ativarFisco = async () => {
    const whatsappLimpo = fiscoWhatsapp.replace(/\D/g, "");
    const valorNum = parseFloat(fiscoValor);
    if (!whatsappLimpo) { toast.error("Informe o WhatsApp do lojista"); return; }
    if (!valorNum || valorNum <= 0) { toast.error("Informe o valor mensal negociado"); return; }
    setAtivandoFisco(true);
    try {
      const resp = await fetch("/api/admin-master/assinaturas-planos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: whatsappLimpo,
          servicoId: fiscoServico,
          valor: valorNum,
          notasMensaisEstimadas: fiscoNotasEstimadas ? parseInt(fiscoNotasEstimadas, 10) : undefined,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(`Plano Fisco ativado pra ${resultado.data.usuario?.nome || "o lojista"}!`);
      setFiscoWhatsapp("");
      setFiscoValor("");
      setFiscoNotasEstimadas("");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao ativar plano");
    } finally {
      setAtivandoFisco(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-blue-600" /> Assinaturas de planos
      </h1>
      <p className="text-sm text-gray-500 mb-6">Planos escolhidos pelos usuários, incluindo pedidos de fiado.</p>

      <div className="bg-white border rounded-lg p-4 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" /> Ativar plano Fisco/Contabilidade manualmente
        </h2>
        <p className="text-sm text-gray-500">
          Use depois de negociar o valor mensal e a quantidade estimada de notas com o lojista pelo chat de suporte.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={fiscoWhatsapp}
            onChange={(e) => setFiscoWhatsapp(e.target.value)}
            placeholder="WhatsApp do lojista"
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <select value={fiscoServico} onChange={(e) => setFiscoServico(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            {SERVICOS_FISCO.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <input
            value={fiscoValor}
            onChange={(e) => setFiscoValor(e.target.value)}
            type="number"
            step="0.01"
            min="0"
            placeholder="Valor mensal negociado (R$)"
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <input
            value={fiscoNotasEstimadas}
            onChange={(e) => setFiscoNotasEstimadas(e.target.value)}
            type="number"
            min="0"
            placeholder="Notas fiscais estimadas / mês"
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button
          onClick={ativarFisco}
          disabled={ativandoFisco}
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold"
        >
          {ativandoFisco ? "Ativando..." : "Ativar plano"}
        </button>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-500">Carregando...</p>
        ) : assinaturas.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Nenhuma assinatura ainda.</p>
        ) : (
          assinaturas.map((a) => (
            <div key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {a.usuario?.nome || "Usuário"} <span className="text-gray-500 font-normal">· {a.usuario?.whatsapp}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {a.plano_id} · {a.servico_id.replace(/_/g, " ")} {a.com_fiado ? "· com módulo fiado" : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    R$ {Number(a.valor).toFixed(2)} · {a.metodo_pagamento}
                    {a.metodo_pagamento === "cartao" && a.parcelas > 1 ? ` em ${a.parcelas}x` : ""}
                    {a.plano_id === "fisco" && a.notas_mensais_estimadas ? ` · ~${a.notas_mensais_estimadas} notas/mês` : ""}
                  </p>
                  {a.dados_complementares && (
                    <div className="mt-2 text-sm bg-gray-50 rounded-lg p-2 space-y-0.5">
                      <p><span className="text-gray-500">Negócio:</span> {a.dados_complementares.nomeNegocio}</p>
                      {a.dados_complementares.cnpj && <p><span className="text-gray-500">CNPJ:</span> {a.dados_complementares.cnpj}</p>}
                      <p><span className="text-gray-500">Endereço:</span> {a.dados_complementares.endereco}</p>
                      <p><span className="text-gray-500">Localizador:</span> {a.dados_complementares.localizador}</p>
                      {a.dados_complementares.faturamentoBruto && (
                        <p><span className="text-gray-500">Faturamento:</span> {a.dados_complementares.faturamentoBruto}</p>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-sm px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COR[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>

              {a.status === "fiado_pendente" && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => mudarStatus(a.id, "pago")}
                    disabled={atualizandoId === a.id}
                    className="flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 disabled:opacity-40 text-green-700 rounded-lg text-sm"
                  >
                    <Check className="w-3 h-3" /> Aprovar fiado
                  </button>
                  <button
                    onClick={() => mudarStatus(a.id, "recusado")}
                    disabled={atualizandoId === a.id}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-700 rounded-lg text-sm"
                  >
                    <XIcon className="w-3 h-3" /> Recusar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
