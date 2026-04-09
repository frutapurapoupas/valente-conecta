import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();

  const lojasProximas = [
    { id: '1', nome: 'Fruta Pura Loja 1', bairro: 'Centro', produto: 'Polpa', estoque: true },
    { id: '2', nome: 'Mercado Juazeiro', bairro: 'Juazeiro', produto: 'Polpa', estoque: true }
  ];

  const filtradas = lojasProximas.filter(l => l.produto.toLowerCase().includes(q || ''));
  return NextResponse.json(filtradas);
}