import { NextResponse } from 'next/server';
import { dispatchWebhook } from '@/lib/webhookDispatch';

export async function POST(req: Request) {
  const { valor, origem, cpf } = await req.json();

  if (origem === 'INDICAÇÃO') {
    const LIMITE = 50.00;
    // Simulação: buscar total sacado no mês pelo CPF
    const totalSacadoMes = 0; 

    if (totalSacadoMes + valor > LIMITE) {
      return NextResponse.json({ 
        success: false, 
        message: "TETO DE INDICAÇÃO ATINGIDO. O Banco Mãe libera apenas R$ 50,00/mês para este tipo de bônus." 
      }, { status: 403 });
    }
  }

  await dispatchWebhook('resgate_pix', { valor, origem, cpf })
  return NextResponse.json({ success: true, message: "Resgate enviado para processamento Pix." });
}