'use client';

// Caminho: C:\valente_conecta\components\VerificadorAtualizacao.tsx
//
// O app tem service worker (PWA) e, mesmo sem ele, o React de uma SPA
// aberta há tempo nunca recarrega sozinho — um deploy novo no servidor não
// aparecia pra quem já estava com o app aberto ou instalado, só recarregando
// manualmente (e às vezes nem assim, se o navegador reaproveitasse o app já
// em memória em vez de navegar de verdade). Esse componente compara o
// build_id que ESTE carregamento do app tem (embutido em build,
// NEXT_PUBLIC_BUILD_ID) contra o build_id atual do servidor
// (GET /api/version, sempre sem cache) e recarrega a página sozinho quando
// detecta diferença — sem precisar desinstalar/reinstalar nada.
//
// Checagem roda quando o app volta a ficar visível/em foco (o usuário
// voltando pro app depois de trocar de tela é um momento natural pra
// atualizar, sem interromper uso ativo) e a cada 5 minutos como rede de
// segurança pra quem deixa o app aberto e em primeiro plano por muito tempo.

import { useEffect } from 'react';

export function VerificadorAtualizacao() {
  useEffect(() => {
    const buildAtual = process.env.NEXT_PUBLIC_BUILD_ID;
    if (!buildAtual) return;

    let checando = false;

    async function checar() {
      if (checando || document.visibilityState === 'hidden') return;
      checando = true;
      try {
        const resposta = await fetch('/api/version', { cache: 'no-store' });
        const { buildId } = await resposta.json();
        if (buildId && buildId !== buildAtual) {
          window.location.reload();
        }
      } catch {
        // sem rede ou API fora do ar — nao interrompe o uso, so' nao atualiza agora
      } finally {
        checando = false;
      }
    }

    const aoFicarVisivel = () => {
      if (document.visibilityState === 'visible') checar();
    };

    document.addEventListener('visibilitychange', aoFicarVisivel);
    window.addEventListener('focus', checar);
    const intervalo = setInterval(checar, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', aoFicarVisivel);
      window.removeEventListener('focus', checar);
      clearInterval(intervalo);
    };
  }, []);

  return null;
}
