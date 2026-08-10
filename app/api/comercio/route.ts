import { NextRequest, NextResponse } from 'next/server';

// Rota base de comércio para evitar módulo vazio no App Router.
export async function GET() {
	return NextResponse.json({
		success: true,
		message: 'Comercio route ativa',
		data: []
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		return NextResponse.json({
			success: true,
			message: 'Payload de comercio recebido',
			data: body
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Erro ao processar request de comercio' },
			{ status: 400 }
		);
	}
}

