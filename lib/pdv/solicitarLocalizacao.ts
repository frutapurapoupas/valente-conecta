// Caminho: C:\valente_conecta\lib\pdv\solicitarLocalizacao.ts
//
// Pede a localização do navegador uma única vez por dispositivo, no
// primeiro acesso ao PDV — alimenta perfis_fornecedor.latitude/longitude
// (reaproveitado do resto do marketplace, ver lib/catalogo/marketplaceTypes.ts)
// pra ordenação por distância quando o estoque é publicado na vitrine
// pública (app/api/pdv/estoque/publicar-vitrine). Nunca bloqueia o uso: se
// o navegador não suportar geolocalização ou a loja recusar a permissão,
// só fica sem ordenação por distância, sem nenhum aviso insistente.

const CHAVE = "pdv_localizacao_solicitada";

export function solicitarLocalizacaoUmaVez(usuarioId: string) {
  if (typeof window === "undefined" || !navigator.geolocation) return;
  if (localStorage.getItem(CHAVE) === "1") return;
  localStorage.setItem(CHAVE, "1");

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      fetch("/api/pdv/localizacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        }),
      }).catch(() => {});
    },
    () => {
      // recusou ou falhou -- segue sem localizacao, sem incomodar
    },
    { timeout: 8000 }
  );
}
