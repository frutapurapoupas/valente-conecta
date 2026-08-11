"use client";

import { useCallback, useEffect, useState } from 'react';

export const EMPRESA_ID_STORAGE_KEY = 'academia_empresa_local_id';

export interface AcademiaPlano {
  id: string;
  nome: string;
  descricao: string | null;
  preco_mensal: number;
  limite_alunos: number | null;
  limite_usuarios_adicionais: number;
  ordem_exibicao: number;
}

export interface GymUnit {
  id: string;
  nome: string;
  responsavel: string;
  cidade: string;
  contato: string;
  endereco: string;
  localizador: string;
  latitude: number | null;
  longitude: number | null;
  alunos: number;
  ativa: boolean;
  plano_id: string | null;
  dono_nome: string;
  dono_email: string | null;
  dono_telefone: string;
  status_assinatura: 'trial' | 'ativo' | 'inadimplente' | string;
  academia_planos?: AcademiaPlano | AcademiaPlano[] | null;
}

export function getEmpresaIdLocal(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(EMPRESA_ID_STORAGE_KEY);
}

export function setEmpresaIdLocal(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMPRESA_ID_STORAGE_KEY, id);
}

export function planoDaEmpresa(empresa: GymUnit | null): AcademiaPlano | null {
  if (!empresa?.academia_planos) return null;
  return Array.isArray(empresa.academia_planos) ? (empresa.academia_planos[0] || null) : empresa.academia_planos;
}

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<GymUnit | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const id = getEmpresaIdLocal();
    setEmpresaId(id);
    if (!id) {
      setEmpresa(null);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const res = await fetch(`/api/academia?recurso=empresas&id=${id}`);
      const data = await res.json();
      const encontrada = Array.isArray(data?.data) ? data.data[0] : null;
      setEmpresa(encontrada || null);
    } catch {
      // silencioso — tela trata empresa nula pedindo pra recarregar
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return { empresa, empresaId, carregando, recarregar: carregar };
}
