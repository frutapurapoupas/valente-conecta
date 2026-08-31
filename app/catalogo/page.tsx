// Caminho: C:\valente_conecta\app\catalogo\page.tsx
//
// Pagina antiga de protótipo (consultava uma tabela "produtos" que nunca
// chegou a existir em nenhuma migration -- sempre caia em erro) e seu link
// pra /catalogo/produto/[id] (que so' mostrava dado falso "Produto de
// Exemplo", sem fornecedor real). O catalogo de verdade e' /busca +
// /item/[id] (lib/catalogo/catalogoService.ts, catalogo_itens). Redireciona
// pra nao deixar essa URL orfa mostrando tela quebrada/falsa.

import { redirect } from "next/navigation";

export default function CatalogoPage() {
  redirect("/busca");
}
