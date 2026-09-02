"use client";

// Caminho: C:\valente_conecta\components\pdv\ValidacaoProprietarioLoja.tsx
//
// Gate obrigatorio antes do lojista poder aprovar cadastros de produto de
// consumidor (094_validacao_proprietario_loja.sql): envia documento que
// comprove que e' dono/responsavel pela loja, confirmando a declaracao de
// veracidade (lib/termosDocumentoComprobatorio.ts) no mesmo envio. Admin
// master revisa (aprovar/recusar) -- mesmo padrao de moderacao manual do
// resto do app.

import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, ShieldAlert, Clock, Loader2 } from "lucide-react";
import { CapturaFotoComprovante } from "@/components/pdv/CapturaFotoComprovante";
import { TERMOS_DOCUMENTO_TITULO, TERMOS_DOCUMENTO_TEXTO } from "@/lib/termosDocumentoComprobatorio";

interface Props {
  usuarioId: string;
  status: "nao_enviado" | "pendente" | "aprovado" | "recusado";
  motivoRecusa: string | null;
  onEnviado: () => void;
}

export function ValidacaoProprietarioLoja({ usuarioId, status, motivoRecusa, onEnviado }: Props) {
  const [documentoPath, setDocumentoPath] = useState<string | null>(null);
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (status === "pendente") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-2 text-blue-700">
        <Clock className="w-5 h-5 shrink-0" />
        <p className="text-sm">Documento enviado — aguardando revisão do admin master.</p>
      </div>
    );
  }

  if (status === "aprovado") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <p className="text-sm">Documento validado — você já pode aprovar cadastros de clientes.</p>
      </div>
    );
  }

  const enviar = async () => {
    if (!documentoPath) {
      toast.error("Envie a foto do documento.");
      return;
    }
    if (!aceite) {
      toast.error("É preciso aceitar a declaração de veracidade.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/pdv/validacao-proprietario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, documentoPath, aceiteTermos: true }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Documento enviado! Aguarde a revisão do admin master.");
      setDocumentoPath(null);
      setAceite(false);
      onEnviado();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar documento");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-gray-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="font-semibold text-sm">Valide que você é dono/responsável pela loja</p>
      </div>
      <p className="text-sm text-gray-500">
        Pra poder aprovar produtos que clientes cadastraram, envie um documento que comprove que você é dono ou responsável legal por esse negócio (ex: CNPJ, alvará, contrato social).
      </p>

      {status === "recusado" && motivoRecusa && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-700">
          Documento recusado: {motivoRecusa}. Envie outro documento.
        </div>
      )}

      <CapturaFotoComprovante
        fotoPath={documentoPath}
        donoId={usuarioId}
        titulo="Foto do documento comprobatório"
        obrigatoria
        onFotoPathChange={setDocumentoPath}
      />

      <div className="border rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto text-xs text-gray-600 whitespace-pre-wrap">
        <p className="font-semibold text-gray-700 mb-1">{TERMOS_DOCUMENTO_TITULO}</p>
        {TERMOS_DOCUMENTO_TEXTO}
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5" />
        Declaro que o documento é verdadeiro e sou responsável legal por esse negócio. Sei que apresentar documento falso é crime (falsidade ideológica) e pode levar ao banimento da conta.
      </label>

      <button
        onClick={enviar}
        disabled={enviando || !documentoPath || !aceite}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {enviando ? "Enviando..." : "Enviar documento"}
      </button>
    </div>
  );
}
