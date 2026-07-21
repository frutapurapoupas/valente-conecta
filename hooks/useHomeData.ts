// Arquivo: hooks/useHomeData.ts
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// HOOK - HOME PRINCIPAL
// Gerencia estados e lógica da Home
// ============================================

import { useState, useEffect } from 'react';
import { homeConstants } from '@/constants/homeConstants';
import { HomeData } from '@/types/home.types';

export function useHomeData(): HomeData {
  const [bannerAtual, setBannerAtual] = useState(0);
  const [abaAtual, setAbaAtual] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Carrossel de banners - troca a cada 10 segundos
    const bannerInterval = setInterval(() => {
      setBannerAtual((prev) => (prev + 1) % homeConstants.banners.length);
    }, 10000);

    // Rotação das abas do card Indique - troca a cada 10 segundos
    const abaInterval = setInterval(() => {
      setAbaAtual((prev) => (prev + 1) % homeConstants.abasIndique.length);
    }, 10000);

    // Verificar se usuário está logado e se é admin
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setIsAdmin(parsed.isAdmin === true);
      } catch (e) {
        console.error('Erro ao parsear user do localStorage:', e);
      }
    }

    // Cleanup dos intervalos ao desmontar componente
    return () => {
      clearInterval(bannerInterval);
      clearInterval(abaInterval);
    };
  }, []);

  return {
    bannerAtual,
    abaAtual,
    isAdmin,
    user
  };
}

