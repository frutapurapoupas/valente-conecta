// Caminho: C:\valente_conecta\app\api\demandas-busca\atender\route.ts
//
// O proprio fornecedor chama isso ao publicar um item que atende uma
// demanda (ver components/catalogo/LojaAdminShell.tsx e app/api/pdv/
// responder-demanda/route.ts). Varios fornecedores podem publicar pro
// mesmo termo simultaneamente — so o primeiro fecha e avisa quem buscou
// (idempotente); os demais continuam publicando normalmente, so' nao
// repetem o aviso. Logica em lib/busca/atenderDemanda.ts, compartilhada
// entre esta rota HTTP e o fechamento automatico do PDV colaborativo.

import { NextRequest, NextResponse } from 'next/server';
import { atenderDemanda } from '@/lib/busca/atenderDemanda';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.demandaId || !body.itemId) {
      return NextResponse.json({ success: false, error: 'demandaId e itemId são obrigatórios' }, { status: 400 });
    }

    const resultado = await atenderDemanda(body.demandaId, body.itemId);
    if (!resultado.success) {
      return NextResponse.json(resultado, { status: 404 });
    }
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atender demanda' }, { status: 500 });
  }
}
