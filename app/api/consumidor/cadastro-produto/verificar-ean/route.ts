// Caminho: C:\valente_conecta\app\api\consumidor\cadastro-produto\verificar-ean\route.ts
//
// Checagem RAPIDA de duplicidade por EAN pro quiz do consumidor (ver
// components/consumidor/QuizCadastroProduto.tsx) -- chamada assim que o
// codigo de barras e' escaneado, ANTES do consumidor tirar as 3 fotos
// (nota fiscal, produto, QR code). Sem isso, ele so descobria que o
// produto ja existia no final, depois de ja ter feito tudo (ver o mesmo
// bloqueio em POST /api/consumidor/cadastro-produto).
//
// So' consulta o catalogo colaborativo INTERNO (pdv_produtos_catalogo) e as
// submissoes pendentes de QUALQUER consumidor (consumidor_cadastros_produto)
// -- sem chamar a API paga da Kodebar (essa fica reservada pro cadastro
// manual do lojista, ver lib/pdv/kodebarService.ts, pra nao brigar pela
// cota diaria compartilhada com um gatilho de alta frequencia).
//
// A checagem contra consumidor_cadastros_produto existe porque o EAN e'
// unico GLOBALMENTE no catalogo (idx_pdv_catalogo_ean_unico, ver 038) --
// sem ela, dois consumidores em lojas diferentes podiam escanear o MESMO
// codigo de barras e cada um levar o cadastro ate' o final antes de
// qualquer lojista aprovar, gerando duas submissoes redundantes pro mesmo
// produto (so' uma sobrevive quando algum lojista aprova).

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
  if (existente) {
    return NextResponse.json({ success: true, existe: true, pendente: false, nome: existente.nome });
  }

  const { data: pendente, error: erroPendente } = await supabase
    .from('consumidor_cadastros_produto')
    .select('nome_produto')
    .eq('ean', ean)
    .in('status', ['pendente', 'aprovado'])
    .limit(1)
    .maybeSingle();
  if (erroPendente) return NextResponse.json({ success: false, error: erroPendente.message }, { status: 500 });

  return NextResponse.json({ success: true, existe: !!pendente, pendente: !!pendente, nome: pendente?.nome_produto || null });
}
