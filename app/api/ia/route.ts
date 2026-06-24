import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({
		success: true,
		message: 'IA route ativa',
		data: []
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		return NextResponse.json({
			success: true,
			message: 'Request de IA recebida',
			data: body
		});
	} catch {
		return NextResponse.json(
			{ success: false, message: 'Erro ao processar request de IA' },
			{ status: 400 }
		);
	}
}
