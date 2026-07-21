import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const pedidosPath = path.join(process.cwd(), 'data', 'pedidos.json');

function ensurePedidosFile() {
	if (!fs.existsSync(pedidosPath)) {
		fs.writeFileSync(pedidosPath, JSON.stringify([], null, 2));
	}
}

function readPedidos() {
	ensurePedidosFile();
	return JSON.parse(fs.readFileSync(pedidosPath, 'utf-8'));
}

function writePedidos(data: any[]) {
	fs.writeFileSync(pedidosPath, JSON.stringify(data, null, 2));
}

function getNotificationUrl(request: NextRequest) {
	const envUrl = process.env.MP_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL;
	if (envUrl) {
		return `${envUrl.replace(/\/$/, '')}/api/webhooks/mercadopago`;
	}

	const origin = request.headers.get('origin');
	if (origin) {
		return `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago`;
	}

	return '';
}

export async function POST(request: NextRequest) {
	try {
		const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
		if (!accessToken) {
			return NextResponse.json(
				{ success: false, error: 'MERCADO_PAGO_ACCESS_TOKEN nao configurado no ambiente.' },
				{ status: 500 }
			);
		}

		const body = await request.json();
		const pedidoId = String(body?.pedidoId || '');
		const metodo = String(body?.metodo || 'pix').toLowerCase();

		if (!pedidoId) {
			return NextResponse.json({ success: false, error: 'pedidoId nao informado.' }, { status: 400 });
		}

		const pedidos = readPedidos();
		const index = pedidos.findIndex((item: any) => item.id === pedidoId);

		if (index === -1) {
			return NextResponse.json({ success: false, error: 'Pedido nao encontrado.' }, { status: 404 });
		}

		const pedido = pedidos[index];
		const valor = Number(pedido?.valor || 0);

		if (valor <= 0) {
			return NextResponse.json({ success: false, error: 'Valor do pedido invalido.' }, { status: 400 });
		}

		const emailPayer = String(body?.payerEmail || pedido?.clienteContato || '').includes('@')
			? String(body?.payerEmail || pedido?.clienteContato)
			: `pedido_${pedidoId.replace(/[^a-zA-Z0-9]/g, '')}@valenteconecta.local`;

		const notificationUrl = getNotificationUrl(request);
		const paymentMethodIds = metodo === 'pix' ? ['pix'] : undefined;

		const preferencePayload: any = {
			external_reference: pedidoId,
			notification_url: notificationUrl || undefined,
			payer: {
				name: pedido?.clienteNome || 'Cliente',
				email: emailPayer
			},
			items: [
				{
					id: pedidoId,
					title: `Pedido Cozinha #${pedidoId}`,
					quantity: 1,
					currency_id: 'BRL',
					unit_price: Number(valor.toFixed(2))
				}
			],
			payment_methods: paymentMethodIds ? { payment_method_ids: paymentMethodIds.map((id) => ({ id })) } : undefined,
			metadata: {
				pedidoId,
				origem: 'cozinha'
			}
		};

		const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(preferencePayload)
		});

		const mpData = await response.json();
		if (!response.ok) {
			return NextResponse.json(
				{
					success: false,
					error: mpData?.message || 'Erro ao criar checkout no Mercado Pago.',
					details: mpData
				},
				{ status: response.status }
			);
		}

		pedidos[index] = {
			...pedido,
			paymentMethod: {
				...(pedido.paymentMethod || {}),
				type: metodo,
				valor,
				provider: 'mercado_pago',
				preferenceId: mpData.id,
				checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
				status: 'pendente'
			},
			updatedAt: new Date().toISOString()
		};

		writePedidos(pedidos);

		return NextResponse.json({
			success: true,
			data: {
				pedidoId,
				preferenceId: mpData.id,
				checkoutUrl: mpData.init_point || mpData.sandbox_init_point || ''
			}
		});
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, error: error?.message || 'Erro interno ao criar pagamento.' },
			{ status: 500 }
		);
	}
}


