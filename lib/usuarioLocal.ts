// Caminho: C:\valente_conecta\lib\usuarioLocal.ts
//
// Placeholder de identidade enquanto o login nao existe (ver
// VALENTE_CONECTA_MASTER_SPEC.md, secao 9: "os fluxos que dependeriam de
// usuario_id real usam placeholders temporarios, sinalizados com // TODO").
//
// Gera um uuid por dispositivo/navegador na primeira visita e reaproveita
// em toda chamada que hoje precisaria de auth.uid() (marketplace, push).
// TODO: substituir por auth.uid() real quando o login for implementado.

const CHAVE = 'valente_conecta_usuario_local_id';

export function obterUsuarioLocalId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CHAVE);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CHAVE, id);
  }
  return id;
}
