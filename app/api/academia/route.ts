import { NextResponse } from 'next/server';

// Rota stub para academia — implementação completa em app/academia/
export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST() {
  return NextResponse.json({ success: false, message: 'Use /api/academia/atletas ou /api/academia/treinos' }, { status: 404 });
}
