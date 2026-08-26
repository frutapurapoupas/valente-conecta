import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

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

function normalizeStatus(status: string) {
	if (status === 'approved') return 'pago';
	if (status === 'cancelled' || status === 'rejected') return 'cancelado';
	return 'pendente';
}

async function fetchPaymentFromMP(paymentId: string) {
	const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
	if (!accessToken) {
		throw new Error('MERCADO_PAGO_ACCESS_TOKEN nao configurado.');
	}

	const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data?.message || 'Falha ao consultar pagamento no Mercado Pago.');
	}

	return data;
}

async function processWebhookPlano(assinaturaId: string, payment: any) {
	const supabase = createClient();
	const statusPedido = normalizeStatus(String(payment?.status || ''));

	const { data: assinatura, error } = await supabase
		.from('assinaturas_planos')
		.update({
			status: statusPedido === 'pago' ? 'pago' : statusPedido === 'cancelado' ? 'recusado' : 'pendente_pagamento',
			mp_payment_id: String(payment?.id || ''),
			atualizado_em: new Date().toISOString(),
		})
		.eq('id', assinaturaId)
		.select('*')
		.single();

	if (error || !assinatura) {
		return NextResponse.json({ success: true, ignored: true, reason: 'assinatura nao encontrada' });
	}

	if (statusPedido === 'pago' && assinatura.usuario_local_id) {
		await enviarPushParaUsuario(assinatura.usuario_local_id, {
			titulo: 'Pagamento confirmado!',
			corpo: 'Falta só completar os dados do seu negócio pra ativar o plano.',
			url: '/planos/dados',
		});
	}

	return NextResponse.json({ success: true, assinaturaId, status: statusPedido });
}

// Usuario pagou a assinatura do Plano Geral (basico/ilimitado) — confirma
// e ativa o nivel dele por 30 dias a partir de agora (ver 055_plano_geral.sql).
async function processWebhookPlanoGeral(assinaturaId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: assinatura, error } = await supabase
		.from('plano_geral_assinaturas')
		.select('*')
		.eq('id', assinaturaId)
		.maybeSingle();
	if (error || !assinatura) {
		return NextResponse.json({ success: true, ignored: true, reason: 'assinatura nao encontrada' });
	}

	if (statusPagamento === 'pago') {
		const validoAte = new Date();
		validoAte.setDate(validoAte.getDate() + 30);

		await supabase.from('plano_geral_assinaturas').update({
			status: 'pago',
			mp_payment_id: String(payment?.id || ''),
			valido_ate: validoAte.toISOString(),
			updated_at: new Date().toISOString(),
		}).eq('id', assinaturaId);

		await supabase.from('usuarios').update({
			plano_geral: assinatura.tier,
			plano_geral_valido_ate: validoAte.toISOString(),
		}).eq('id', assinatura.usuario_id);
	} else if (statusPagamento === 'cancelado') {
		await supabase.from('plano_geral_assinaturas').update({
			status: 'cancelado',
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		}).eq('id', assinaturaId);
	}

	return NextResponse.json({ success: true, assinaturaId, status: statusPagamento });
}

// Motorista pagou a taxa pra ter a viagem de Carona Solidaria exibida na
// vitrine — confirma o pagamento e publica a viagem.
async function processWebhookCaronaListagem(viagemId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: viagem, error } = await supabase
		.from('carona_viagens')
		.update({
			status: statusPagamento === 'pago' ? 'publicada' : statusPagamento === 'cancelado' ? 'cancelada' : 'aguardando_pagamento',
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		})
		.eq('id', viagemId)
		.select('*')
		.single();

	if (error || !viagem) {
		return NextResponse.json({ success: true, ignored: true, reason: 'viagem nao encontrada' });
	}

	return NextResponse.json({ success: true, viagemId, status: statusPagamento });
}

// Caronista pagou a taxa pra desbloquear o contato do motorista numa
// viagem especifica.
async function processWebhookCaronaDesbloqueio(desbloqueioId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: desbloqueio, error } = await supabase
		.from('carona_desbloqueios')
		.update({
			status: statusPagamento === 'pago' ? 'pago' : 'pendente',
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		})
		.eq('id', desbloqueioId)
		.select('*')
		.single();

	if (error || !desbloqueio) {
		return NextResponse.json({ success: true, ignored: true, reason: 'desbloqueio nao encontrado' });
	}

	return NextResponse.json({ success: true, desbloqueioId, status: statusPagamento });
}

// Passageiro pagou a(s) vaga(s) de uma viagem de Carona Solidaria com split
// automatico pro motorista (ver 080_carona_split_pagamento.sql). Ao
// confirmar: libera o contato (reaproveita carona_desbloqueios, mesmo
// mecanismo que a tela ja consulta) e desconta as vagas da viagem.
async function processWebhookCaronaReserva(reservaId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: reserva, error } = await supabase
		.from('carona_reservas')
		.update({
			status: statusPagamento === 'pago' ? 'pago' : 'pendente',
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		})
		.eq('id', reservaId)
		.select('*')
		.single();

	if (error || !reserva) {
		return NextResponse.json({ success: true, ignored: true, reason: 'reserva nao encontrada' });
	}

	if (statusPagamento === 'pago') {
		// Libera o contato pra essa viagem -- mesma tabela/checagem que
		// GET /api/carona/desbloqueios ja usa, entao a tela nao precisa mudar.
		const { data: desbloqueioExistente } = await supabase
			.from('carona_desbloqueios')
			.select('id')
			.eq('viagem_id', reserva.viagem_id)
			.eq('usuario_id', reserva.usuario_id)
			.maybeSingle();
		if (desbloqueioExistente) {
			await supabase.from('carona_desbloqueios').update({ status: 'pago', updated_at: new Date().toISOString() }).eq('id', desbloqueioExistente.id);
		} else {
			await supabase.from('carona_desbloqueios').insert({ viagem_id: reserva.viagem_id, usuario_id: reserva.usuario_id, valor: 0, status: 'pago' });
		}

		const { data: viagem } = await supabase.from('carona_viagens').select('vagas_disponiveis').eq('id', reserva.viagem_id).maybeSingle();
		if (viagem) {
			const restantes = Math.max(0, Number(viagem.vagas_disponiveis) - Number(reserva.vagas));
			await supabase.from('carona_viagens').update({ vagas_disponiveis: restantes, updated_at: new Date().toISOString() }).eq('id', reserva.viagem_id);
		}
	}

	return NextResponse.json({ success: true, reservaId, status: statusPagamento });
}

// Cliente ou motorista pagou a taxa de uso da plataforma no Moto Taxi (ver
// lib/mototaxi/taxaUso.ts) -- confirma a linha em mototaxi_taxas_uso.
async function processWebhookMototaxiTaxa(taxaId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: taxa, error } = await supabase
		.from('mototaxi_taxas_uso')
		.update({
			status: statusPagamento === 'pago' ? 'pago' : 'pendente',
			pago_via: statusPagamento === 'pago' ? 'mercadopago' : null,
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		})
		.eq('id', taxaId)
		.select('*')
		.single();

	if (error || !taxa) {
		return NextResponse.json({ success: true, ignored: true, reason: 'taxa nao encontrada' });
	}

	return NextResponse.json({ success: true, taxaId, status: statusPagamento });
}

// Cliente ou fornecedor pagou a taxa de uso da plataforma no pedido
// expresso de Agua e Gas (ver lib/aguaGas/taxaUso.ts) -- confirma a linha
// em agua_gas_taxas_uso. So' acontece quando o pedido foi combinado em
// dinheiro (pagamento online ja' desconta a taxa via marketplace_fee, ver
// processWebhookAguaGasPedido abaixo).
async function processWebhookAguaGasTaxa(taxaId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: taxa, error } = await supabase
		.from('agua_gas_taxas_uso')
		.update({
			status: statusPagamento === 'pago' ? 'pago' : 'pendente',
			pago_via: statusPagamento === 'pago' ? 'mercadopago' : null,
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		})
		.eq('id', taxaId)
		.select('*')
		.single();

	if (error || !taxa) {
		return NextResponse.json({ success: true, ignored: true, reason: 'taxa nao encontrada' });
	}

	return NextResponse.json({ success: true, taxaId, status: statusPagamento });
}

// Cliente pagou um pedido expresso de Agua e Gas online, com split
// automatico pro fornecedor (ver 081_agua_gas_pedido_expresso.sql) -- so'
// confirma o pagamento e avisa o fornecedor; a taxa da plataforma ja saiu
// via marketplace_fee, nao precisa de cobranca separada.
async function processWebhookAguaGasPedido(pedidoId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: pedido, error } = await supabase
		.from('agua_gas_pedidos')
		.update({
			pagamento_status: statusPagamento === 'pago' ? 'pago_online' : 'aguardando_pagamento',
			mp_payment_id: String(payment?.id || ''),
			updated_at: new Date().toISOString(),
		})
		.eq('id', pedidoId)
		.select('*')
		.single();

	if (error || !pedido) {
		return NextResponse.json({ success: true, ignored: true, reason: 'pedido nao encontrado' });
	}

	if (statusPagamento === 'pago') {
		const { data: fornecedor } = await supabase.from('agua_gas_fornecedores').select('dono_id').eq('id', pedido.fornecedor_id).maybeSingle();
		if (fornecedor?.dono_id) {
			await enviarPushParaUsuario(fornecedor.dono_id, {
				titulo: 'Novo pedido pago — Água e Gás',
				corpo: `${pedido.cliente_nome} pagou ${pedido.produto} × ${pedido.quantidade}. Confirme e providencie a entrega.`,
				url: '/agua-gas/fornecedor',
			});
		}
	}

	return NextResponse.json({ success: true, pedidoId, status: statusPagamento });
}

// Comprador pagou pra desbloquear o contato de um item da vitrine (cota
// diaria gratis do Plano Geral ja estourada — ver
// lib/catalogo/catalogoService.ts::criarInteresse).
async function processWebhookVitrineDesbloqueio(interesseId: string, payment: any) {
	const supabase = createClient();
	const statusPagamento = normalizeStatus(String(payment?.status || ''));

	const { data: interesse, error } = await supabase
		.from('interesses')
		.update({
			status_comprador: statusPagamento === 'pago' ? 'liberado' : 'pendente_pagamento',
			mp_payment_id: String(payment?.id || ''),
		})
		.eq('id', interesseId)
		.select('*')
		.single();

	if (error || !interesse) {
		return NextResponse.json({ success: true, ignored: true, reason: 'interesse nao encontrado' });
	}

	return NextResponse.json({ success: true, interesseId, status: statusPagamento });
}

async function processWebhook(request: NextRequest, payload: any) {
	try {
		const { searchParams } = new URL(request.url);
		const type = String(
			payload?.type ||
			payload?.topic ||
			searchParams.get('type') ||
			searchParams.get('topic') ||
			''
		).toLowerCase();

		const paymentId = String(
			payload?.data?.id ||
			payload?.id ||
			searchParams.get('data.id') ||
			searchParams.get('id') ||
			''
		);

		if (!paymentId) {
			return NextResponse.json({ success: true, ignored: true, reason: 'paymentId ausente' });
		}

		if (type && type !== 'payment') {
			return NextResponse.json({ success: true, ignored: true, reason: 'evento nao-payment' });
		}

		const payment = await fetchPaymentFromMP(paymentId);
		const pedidoId = String(payment?.external_reference || payment?.metadata?.pedidoId || '');

		if (!pedidoId) {
			return NextResponse.json({ success: true, ignored: true, reason: 'external_reference ausente' });
		}

		// Checa o prefixo mais especifico ("plano_geral_") ANTES do mais curto
		// ("plano_") — senao "plano_geral_XXX" ia cair sempre no primeiro if.
		if (pedidoId.startsWith('plano_geral_')) {
			return processWebhookPlanoGeral(pedidoId.replace('plano_geral_', ''), payment);
		}
		if (pedidoId.startsWith('plano_')) {
			return processWebhookPlano(pedidoId.replace('plano_', ''), payment);
		}
		if (pedidoId.startsWith('carona_listagem_')) {
			return processWebhookCaronaListagem(pedidoId.replace('carona_listagem_', ''), payment);
		}
		if (pedidoId.startsWith('carona_desbloqueio_')) {
			return processWebhookCaronaDesbloqueio(pedidoId.replace('carona_desbloqueio_', ''), payment);
		}
		if (pedidoId.startsWith('vitrine_desbloqueio_')) {
			return processWebhookVitrineDesbloqueio(pedidoId.replace('vitrine_desbloqueio_', ''), payment);
		}
		if (pedidoId.startsWith('mototaxi_taxa_')) {
			return processWebhookMototaxiTaxa(pedidoId.replace('mototaxi_taxa_', ''), payment);
		}
		if (pedidoId.startsWith('carona_reserva_')) {
			return processWebhookCaronaReserva(pedidoId.replace('carona_reserva_', ''), payment);
		}
		if (pedidoId.startsWith('agua_gas_taxa_')) {
			return processWebhookAguaGasTaxa(pedidoId.replace('agua_gas_taxa_', ''), payment);
		}
		if (pedidoId.startsWith('agua_gas_pedido_')) {
			return processWebhookAguaGasPedido(pedidoId.replace('agua_gas_pedido_', ''), payment);
		}

		const pedidos = readPedidos();
		const index = pedidos.findIndex((item: any) => item.id === pedidoId);

		if (index === -1) {
			return NextResponse.json({ success: true, ignored: true, reason: 'pedido nao encontrado' });
		}

		const statusPedido = normalizeStatus(String(payment?.status || ''));
		pedidos[index] = {
			...pedidos[index],
			status: statusPedido,
			paymentMethod: {
				...(pedidos[index].paymentMethod || {}),
				provider: 'mercado_pago',
				paymentId: String(payment?.id || ''),
				paymentStatusRaw: String(payment?.status || ''),
				paymentStatusDetail: String(payment?.status_detail || ''),
				status: statusPedido
			},
			updatedAt: new Date().toISOString(),
			paidAt: statusPedido === 'pago' ? new Date().toISOString() : pedidos[index].paidAt
		};

		writePedidos(pedidos);
		return NextResponse.json({ success: true, pedidoId, status: statusPedido });
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error?.message || 'Erro no webhook.' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	let payload: any = {};
	try {
		payload = await request.json();
	} catch {
		payload = {};
	}
	return processWebhook(request, payload);
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const payload = {
		type: searchParams.get('type') || searchParams.get('topic') || '',
		data: {
			id: searchParams.get('data.id') || searchParams.get('id') || ''
		}
	};
	return processWebhook(request, payload);
}


