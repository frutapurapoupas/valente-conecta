// Caminho: C:\valente_conecta\lib\preferencias\fonteGrande.ts
//
// "Aumentar letra" (ver proposta "Modo Valente Facil", kit visual): como
// quase todo texto do app usa classes Tailwind em rem (text-sm, text-lg...),
// a forma mais simples de aumentar tudo de uma vez -- sem reescrever cada
// tela -- e' aumentar o font-size da raiz (html), que e' a base de todo rem.
// Persistido em localStorage, aplicado direto no <html> (sem depender de
// re-render de React) pra nao esperar hidratacao.

const CHAVE = 'fonte_grande_ativa';
const ESCALA = '112%';

export function lerFonteGrandeAtiva(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CHAVE) === 'true';
}

export function aplicarFonteGrande(ativa: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.fontSize = ativa ? ESCALA : '';
  try {
    localStorage.setItem(CHAVE, String(ativa));
  } catch {
    // localStorage indisponivel (modo privado etc) -- so' nao persiste, sem quebrar a tela
  }
}
