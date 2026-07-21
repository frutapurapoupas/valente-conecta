'use client';

import { useEffect, useState } from 'react';

type SugestaoComercio = {
  id: string | number;
  nome: string;
  descricao?: string;
  categoria?: string;
  endereco?: string;
  telefone?: string;
};

const STORAGE_SUGESTOES = 'sugestoes_comercios';
const STORAGE_APROVADOS = 'outros_comercios_adicionados';

function lerStorage<T>(chave: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function SugestoesComerciosPage() {
  const [sugestoes, setSugestoes] = useState<SugestaoComercio[]>([]);

  useEffect(() => {
    const dados = lerStorage<SugestaoComercio[]>(STORAGE_SUGESTOES, []);
    setSugestoes(Array.isArray(dados) ? dados : []);
  }, []);

  const salvarSugestoes = (lista: SugestaoComercio[]) => {
    setSugestoes(lista);
    localStorage.setItem(STORAGE_SUGESTOES, JSON.stringify(lista));
  };

  const handleApprove = (id: string | number) => {
    const sugestao = sugestoes.find((s) => s.id === id);
    if (!sugestao) return;

    const aprovados = lerStorage<SugestaoComercio[]>(STORAGE_APROVADOS, []);
    const jaExiste = aprovados.some((a) => String(a.id) === String(sugestao.id));
    const novosAprovados = jaExiste ? aprovados : [...aprovados, sugestao];
    localStorage.setItem(STORAGE_APROVADOS, JSON.stringify(novosAprovados));

    const restante = sugestoes.filter((s) => s.id !== id);
    salvarSugestoes(restante);
  };

  const handleRemove = (id: string | number) => {
    const restante = sugestoes.filter((s) => s.id !== id);
    salvarSugestoes(restante);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sugestoes de Comercios</h1>
      <p className="text-sm text-gray-500 mb-6">
        Aprove ou remova sugestoes antes de publicar no catalogo.
      </p>

      {sugestoes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-gray-500">
          Nenhuma sugestao pendente.
        </div>
      ) : (
        <div className="space-y-3">
          {sugestoes.map((sugestao) => (
            <div
              key={String(sugestao.id)}
              className="rounded-xl border bg-white p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{sugestao.nome}</p>
                {sugestao.descricao ? (
                  <p className="text-sm text-gray-600">{sugestao.descricao}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(sugestao.id)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleRemove(sugestao.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

