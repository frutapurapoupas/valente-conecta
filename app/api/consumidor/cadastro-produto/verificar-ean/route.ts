// Caminho: C:\valente_conecta\app\api\consumidor\cadastro-produto\verificar-ean\route.ts
//
// Checagem RAPIDA de duplicidade por EAN pro quiz do consumidor (ver
// components/consumidor/QuizCadastroProduto.tsx) -- chamada assim que o
// codigo de barras e' escaneado, ANTES do consumidor tirar as 3 fotos
// (nota fiscal, produto, QR code). Sem isso, ele so descobria que o
// produto ja existia no final, depois de ja ter feito tudo (ver o mesmo
// bloqueio em POST /api/consumidor/cadastro-produto).
//
// So' consulta o catalogo colaborativo INTERNO (pdv_produtos_catalogo) --
// sem chamar a API paga da Kodebar (essa fica reservada pro cadastro
// manual do lojista, ver lib/pdv/kodebarService.ts, pra nao brigar pela
// cota diaria compartilhada com um gatilho de alta frequencia).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const ean = (request.nextUrl.searchParams.get('ean') || '').trim();
  if (!ean) return NextResponse.json({ success: false, error: 'ean é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data: existente, error } = await supabase.from('pdv_produtos_catalogo').select('nome').eq('ean', ean).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, existe: !!existente, nome: existente?.nome || null });
}
