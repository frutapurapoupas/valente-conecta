// Caminho: C:\valente_conecta\app\comercio\page.tsx
//
// Antes era um carrinho com produtos FIXOS no código (mercearia, farmácia,
// água/gás hardcoded) e "finalizar compra" só abria o WhatsApp -- nunca
// teve pedido real nem dado vindo do banco. A home ("Comércio Local em
// Destaque" → "Ver todos") e os atalhos de categoria configuráveis em
// /admin/configuracoes ainda apontam pra cá, então viramos redirect pra
// vitrine real em vez de simplesmente apagar a rota.

import { redirect } from "next/navigation";

export default function ComercioPage() {
  redirect("/busca");
}
