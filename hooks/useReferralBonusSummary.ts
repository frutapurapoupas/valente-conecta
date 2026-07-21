"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateReferralWallet, type ReferralConfig, type ReferralCounts, type ReferralWalletSummary } from '@/utils/referralBonus';

const defaultConfig: ReferralConfig = {
  rules: [
    { id: 'usuarios_gerais', nome: 'UsuÃ¡rios Gerais', bonus: 10, meta: 30, ativo: true },
    { id: 'empresas_lojas', nome: 'Empresas / Lojas', bonus: 5, meta: 3, ativo: true },
    { id: 'profissionais_liberais', nome: 'Profissionais Liberais', bonus: 4, meta: 5, ativo: true }
  ],
  pixMinimo: 1
};

const emptyWallet: ReferralWalletSummary = {
  disponivel: 0,
  bloqueado: 0,
  pago: 0,
  totalLiberado: 0,
  lotes: {
    usuarios_gerais: 0,
    empresas_lojas: 0,
    profissionais_liberais: 0
  }
};

export function useReferralBonusSummary(userId?: string) {
  const [wallet, setWallet] = useState<ReferralWalletSummary>(emptyWallet);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!userId) {
        setWallet(emptyWallet);
        return;
      }

      setLoading(true);
      try {
        const [configResp, payoutResp, usuariosResp, indicacoesResp] = await Promise.all([
          fetch('/api/referrals/config').then((res) => res.json()).catch(() => ({ success: false })),
          fetch(`/api/referrals/payout-requests?userId=${userId}`).then((res) => res.json()).catch(() => ({ success: false, data: [] })),
          supabase.from('usuarios').select('id').eq('convidado_por_id', userId),
          supabase.from('indicacoes_estabelecimentos').select('id, tipo, status').eq('usuario_id', userId)
        ]);

        const config = configResp?.success ? configResp.data : defaultConfig;
        const payoutRequests = Array.isArray(payoutResp?.data) ? payoutResp.data : [];

        const counts: ReferralCounts = {
          usuariosGerais: Array.isArray(usuariosResp.data) ? usuariosResp.data.length : 0,
          empresasLojas: Array.isArray(indicacoesResp.data)
            ? indicacoesResp.data.filter((item: any) => item.tipo === 'comercio' && (item.status === 'aprovado' || item.status === 'pago')).length
            : 0,
          profissionaisLiberais: Array.isArray(indicacoesResp.data)
            ? indicacoesResp.data.filter((item: any) => item.tipo === 'servico' && (item.status === 'aprovado' || item.status === 'pago')).length
            : 0
        };

        setWallet(calculateReferralWallet(config, counts, payoutRequests));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  return { wallet, loading };
}

