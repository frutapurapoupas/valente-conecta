// Caminho: C:\valente_conecta\lib\pdv\operadorPdv.ts
//
// Sessão do OPERADOR (funcionário logado por PIN) no dispositivo, por
// cima da identidade da loja (lib/auth.ts -> getCurrentUser(), que
// continua sendo o dono/usuario_id usado em toda escrita do PDV). Fica
// só no localStorage do terminal, sem expiração — dura até "Trocar
// operador" (decisão do dono do produto: sessão manual, sem timeout).

import type { ChavePermissaoPdv, PermissoesFuncionario } from "./permissoesFuncionario";

const CHAVE_STORAGE = "pdv_operador_ativo";

export interface OperadorAtivo {
  id: string | null; // null quando é o próprio dono operando
  nome: string;
  permissoes: PermissoesFuncionario;
  ehDono: boolean;
}

export function getOperadorAtivo(): OperadorAtivo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CHAVE_STORAGE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setOperadorAtivo(operador: OperadorAtivo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(operador));
}

export function limparOperadorAtivo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAVE_STORAGE);
}

export function temPermissao(operador: OperadorAtivo | null, chave: ChavePermissaoPdv): boolean {
  if (!operador) return true; // sem gate ativo (loja sem funcionários) -- mantém acesso total de sempre
  if (operador.ehDono) return true;
  return Boolean(operador.permissoes[chave]);
}
