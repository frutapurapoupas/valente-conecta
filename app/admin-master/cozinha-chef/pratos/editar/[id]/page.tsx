// app/admin-master/cozinha-chef/pratos/editar/[id]/page.tsx

"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type ReceitaApi = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  ingredients?: any[];
  preparationTime?: number;
  servings?: number;
  isAvailable?: boolean;
  images?: string[];
};

function normalizarNome(valor: string) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export default function EditarPratoPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rotaVoltar = useMemo(() => '/admin-master/cozinha-chef/pratos', []);

  useEffect(() => {
    async function resolverTelaUnificada() {
      if (!id) {
        setError('ID não informado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1) Busca o prato pela tabela legacy (pratos).
        const { data: prato, error: pratoError } = await supabase
          .from('pratos')
          .select('*')
          .eq('id', id)
          .single();

        if (pratoError || !prato) {
          // Fallback: se o id já for de receita, abre direto na tela única de edição.
          router.replace(`/admin-master/cozinha-chef/receitas/editar/${id}`);
          return;
        }

        const nomePrato = String(prato.nome || '');
        const chaveNome = normalizarNome(nomePrato);

        // 2) Carrega receitas e tenta casar por nome.
        const receitasRes = await fetch('/api/cozinha/recipes', { cache: 'no-store' });
        const receitasJson = await receitasRes.json();
        const receitas: ReceitaApi[] = receitasJson?.data || [];

        const receitaMesma = receitas.find((r) => normalizarNome(r.name || '') === chaveNome);

        if (receitaMesma?.id) {
          router.replace(`/admin-master/cozinha-chef/receitas/editar/${receitaMesma.id}`);
          return;
        }

        // 3) Se não existe receita com o mesmo nome, cria um espelho para manter as telas idênticas.
        const payload = {
          name: prato.nome || '',
          description: prato.descricao || '',
          price: Number(prato.preco || 0),
          category: prato.categoria || 'prato',
          ingredients: Array.isArray(prato.ingredientes) ? prato.ingredientes : [],
          preparationTime: Number(prato.tempo_preparo || 30),
          servings: Number(prato.porcoes || 1),
          isAvailable: prato.ativo !== false,
          images: prato.imagem_url ? [prato.imagem_url] : []
        };

        const criarRes = await fetch('/api/cozinha/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const criarJson = await criarRes.json();

        if (!criarJson?.success || !criarJson?.data?.id) {
          throw new Error('Não foi possível sincronizar prato com receita');
        }

        router.replace(`/admin-master/cozinha-chef/receitas/editar/${criarJson.data.id}`);
      } catch (err: any) {
        setError(err?.message || 'Erro ao sincronizar prato com receita');
        setLoading(false);
      }
    }

    resolverTelaUnificada();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-300">Sincronizando item entre pratos e receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400">❌ {error || 'Não foi possível abrir a edição'}</h1>
        <button
          onClick={() => router.push(rotaVoltar)}
          className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white transition"
        >
          Voltar para lista de pratos
        </button>
      </div>
    </div>
  );
}