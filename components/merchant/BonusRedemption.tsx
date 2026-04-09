'use client'

import { Wallet, Landmark, ArrowRight } from 'lucide-react'

export default function MerchantBonusRedemption({ merchant }: { merchant: any }) {
  return (
    <div className="bg-dark-2 p-6 rounded-3xl border border-secondary/20 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Saldo Recebido em Bônus</p>
          <h3 className="text-3xl font-black text-white">R$ {merchant.bonus_to_redeem}</h3>
        </div>
        <Wallet className="text-secondary w-10 h-10" />
      </div>

      {/* Alerta de Cadastro Necessário para Resgate */}
      {!merchant.is_fully_registered && (
        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
          <p className="text-primary text-sm font-bold">Atenção Lojista!</p>
          <p className="text-white text-xs mt-1">
            Para resgatar este valor em R$ via Pix no final do mês, complete seu cadastro profissional (CNPJ e Dados Bancários).
          </p>
          <button className="mt-3 flex items-center gap-2 text-primary font-bold text-sm underline">
            Completar Cadastro Agora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] text-gray-500 uppercase">Próximo Resgate Disponível</p>
        <p className="text-white font-mono">30/04/2026 - Via Pix</p>
      </div>
    </div>
  )
}