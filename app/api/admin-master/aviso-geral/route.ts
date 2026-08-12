// Caminho: C:\valente_conecta\app\api\admin-master\aviso-geral\route.ts
//
// Aviso geral do admin master: dispara push pra todo mundo com inscricao
// ativa (push_subscriptions). So alcanca quem ja e usuario do app — pra
// contatos fora da plataforma, ver app/api/admin-master/contatos-divulgacao.

import { NextRequest, NextResponse } from 'next/server';
import { enviarPushParaTodos } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.titulo?.trim() || !body.mensagem?.trim()) {
      return NextResponse.json({ success: false, error: 'Título e mensagem são obrigatórios' }, { status: 400 });
    }

    const resultado = await enviarPushParaTodos(
      {
        titulo: body.titulo.trim(),
        corpo: body.mensagem.trim(),
        url: body.url || '/',
      },
      {
        cidades: Array.isArray(body.cidades) ? body.cidades : undefined,
        grupos: Array.isArray(body.grupos) ? body.grupos : undefined,
      }
    );

    return NextResponse.json({ success: true, data: resultado });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao enviar aviso' }, { status: 500 });
  }
}
