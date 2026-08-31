"use client";

// Caminho: C:\valente_conecta\lib\hooks\useExigirAceitePolitica.ts
//
// Gate reutilizavel pra qualquer tela de publicacao (vaga de emprego,
// classificado, curriculo etc.): chame executarComAceite(acao) no lugar de
// chamar a acao direto -- se o usuario ja aceitou a versao atual da
// politica de conteudo (lib/politicaConteudo.ts), a acao roda na hora; senao
// abre o popup (PoliticaConteudoModal) e so' roda a acao depois do aceite.

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";
import { POLITICA_CONTEUDO_VERSAO } from "@/lib/politicaConteudo";

export function jaAceitouPoliticaConteudo(user: { aceitou_politica_conteudo_versao?: number | null } | null): boolean {
  return !!user && (user.aceitou_politica_conteudo_versao || 0) >= POLITICA_CONTEUDO_VERSAO;
}

export function useExigirAceitePolitica() {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const acaoPendente = useRef<(() => void) | null>(null);

  const executarComAceite = useCallback((acao: () => void) => {
    const user = getCurrentUser();
    if (jaAceitouPoliticaConteudo(user)) {
      acao();
      return;
    }
    acaoPendente.current = acao;
    setAberto(true);
  }, []);

  const aceitar = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return;
    setEnviando(true);
    try {
      const resposta = await fetch("/api/usuarios/aceitar-politica-conteudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id }),
      });
      const resultado = await resposta.json();
      if (!resultado?.success) {
        // Nao deixa a publicacao passar sem o aceite ter sido gravado de
        // verdade -- so' fecha o popup e roda a acao pendente quando o
        // servidor confirma o registro.
        toast.error("Não foi possível registrar seu aceite agora. Tente de novo.");
        return;
      }
      const atualizado = {
        ...user,
        aceitou_politica_conteudo_versao: POLITICA_CONTEUDO_VERSAO,
        aceitou_politica_conteudo_em: new Date().toISOString(),
      };
      localStorage.setItem("user_data", JSON.stringify(atualizado));
      setAberto(false);
      const acao = acaoPendente.current;
      acaoPendente.current = null;
      acao?.();
    } finally {
      setEnviando(false);
    }
  }, []);

  const cancelar = useCallback(() => {
    setAberto(false);
    acaoPendente.current = null;
  }, []);

  return { aberto, enviando, executarComAceite, aceitar, cancelar };
}
