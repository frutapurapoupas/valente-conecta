// Caminho: C:\valente_conecta\app\catalogo\produto\[id]\page.tsx
//
// Pagina antiga de protótipo — as APIs que ela chamava (/api/catalogo/produto/[id]
// e /api/catalogo/produtos) nunca existiram nesta versao do projeto, entao
// sempre caia no fallback de dado falso "Produto de Exemplo" (sem telefone
// nem endereco reais). O item de verdade com esse mesmo id (se existir) vive
// em /item/[id], ja com a trava de desbloqueio de contato (InteresseButton).

import { redirect } from "next/navigation";

export default function ProdutoDetalhePage({ params }: { params: { id: string } }) {
  redirect(`/item/${params.id}`);
}
