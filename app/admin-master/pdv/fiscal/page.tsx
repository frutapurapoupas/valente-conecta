"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv\fiscal\page.tsx
// Visibilidade do admin master sobre a base fiscal do PDV (ver
// app/api/admin-master/pdv/relatorio-fiscal/route.ts). Sem emissao real
// ainda — so' acompanhamento de quem ja tem dado fiscal e do que esta
// pendente no livro manual de notas.

import { useEffect, useState } from "react";
import { FileText, Building2, Clock, CheckCircle2 } from "lucide-react";

interface Relatorio {
  totalFornecedores: number;
  comDadoFiscal: number;
  totalNotas: number;
  totalPendentes: number;
  totalEmitidas: number;
  pendentesDetalhe: { id: string; lojaNome: string; tipo: string; valor: number; created_at: string }[];
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export default function RelatorioFiscalPage() {
  const [dados, setDados] = useState<Relatorio | null>(null);

  useEffect(() => {
    fetch("/api/admin-master/pdv/relatorio-fiscal", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setDados(res.data); });
  }, []);

  if (!dados) return <p className="p-6 text-gray-400 text-sm">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" /> Base Fiscal do PDV
        </h1>
        <p className="text-sm text-gray-500">
          Controle manual, sem emissão automática ainda — acompanhamento de quem já preencheu dado fiscal e do que está pendente.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CardStat icone={<Building2 className="w-4 h-4" />} label="Fornecedores com CNPJ/CPF" valor={`${dados.comDadoFiscal}/${dados.totalFornecedores}`} />
        <CardStat icone={<FileText className="w-4 h-4" />} label="Notas registradas" valor={dados.totalNotas} />
        <CardStat icone={<Clock className="w-4 h-4" />} label="Pendentes" valor={dados.totalPendentes} />
        <CardStat icone={<CheckCircle2 className="w-4 h-4" />} label="Emitidas" valor={dados.totalEmitidas} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Notas pendentes</h3>
        {dados.pendentesDetalhe.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Nenhuma nota pendente.</p>
        ) : (
          <div className="space-y-2">
            {dados.pendentesDetalhe.map((n) => (
              <div key={n.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="text-gray-800 font-medium">{n.lojaNome}</p>
                  <p className="text-xs text-gray-400">{n.tipo.toUpperCase()} · {new Date(n.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <p className="font-semibold text-amber-600">{formatarMoeda(Number(n.valor))}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardStat({ icone, label, valor }: { icone: React.ReactNode; label: string; valor: number | string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">{icone} {label}</div>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
    </div>
  );
}
