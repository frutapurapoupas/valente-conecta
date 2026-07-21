import { NextRequest, NextResponse } from 'next/server';

// Endpoint simples de autenticaÃ§Ã£o para evitar rota vazia no App Router.
export async function GET() {
	return NextResponse.json({
		success: true,
		message: 'Auth route ativa'
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		return NextResponse.json({
			success: true,
			message: 'Auth request recebida',
			data: body
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Erro ao processar request de auth' },
			{ status: 400 }
		);
	}
}

