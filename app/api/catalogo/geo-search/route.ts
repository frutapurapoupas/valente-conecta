import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();

  const lojasProximas = [
    { id: '1', nome: 'Fruta Pura Loja 1', bairro: 'Centro', produto: 'Polpa', preco: 5.90, estoque: true, tipo: 'catalogo', emPromocao: false },
    { id: '2', nome: 'Mercado Juazeiro', bairro: 'Juazeiro', produto: 'Polpa', preco: 4.50, precoAnterior: 5.90, estoque: true, tipo: 'promocao', emPromocao: true },
    { id: '3', nome: 'Açougue Central', bairro: 'Centro', produto: 'Carne Bovina', preco: 35.00, estoque: true, tipo: 'estoque', emPromocao: false },
  ];

  const filtradas = lojasProximas.filter(l => l.produto.toLowerCase().includes(q || ''));
  return NextResponse.json(filtradas);
}