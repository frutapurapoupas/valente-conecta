// Caminho: C:\valente_conecta\app\profissionais\page.tsx
//
// /profissionais foi unificado com /servicos (ver proposta "Modo Valente
// Facil", item 3) -- agora e' so' o caminho direto pro lado "Profissional"
// da bifurcacao. Mantido como redirect pra nao quebrar links/favoritos
// antigos (inclusive o manifest/PWA, se alguem tiver instalado atalho).

import { redirect } from 'next/navigation';

export default function ProfissionaisRedirect() {
  redirect('/servicos?tipo=profissional');
}
