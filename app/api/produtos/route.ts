import { NextResponse } from 'next/server'

// Armazenamento em memória (temporário)
let produtosGlobal: any[] = []

export async function GET() {
  return NextResponse.json({ produtos: produtosGlobal })
}

export async function POST(request: Request) {
  const { produtos } = await request.json()
  produtosGlobal = produtos
  return NextResponse.json({ success: true })
}