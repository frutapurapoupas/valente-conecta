// Caminho: C:\valente_conecta\app\profissionais\cadastro\page.tsx
//
// Ver app/profissionais/page.tsx -- redirect pra manter links antigos
// funcionando apos a unificacao com /servicos.

import { redirect } from 'next/navigation';

export default function ProfissionaisCadastroRedirect() {
  redirect('/servicos/cadastro?tipo=profissional');
}
