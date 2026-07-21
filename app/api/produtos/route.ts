// app/cozinha/api/produtos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ProdutoService } from '@/src/modules/cozinha/services/ProdutoService';

export async function GET(req: NextRequest) {
  try {
    const service = new ProdutoService();
    const produtos = await service.listarTodos();

    return NextResponse.json({
      success: true,
      data: produtos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar produtos';
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const service = new ProdutoService();
    const produto = await service.criar(body);

    return NextResponse.json({
      success: true,
      data: produto,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar produto';
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}