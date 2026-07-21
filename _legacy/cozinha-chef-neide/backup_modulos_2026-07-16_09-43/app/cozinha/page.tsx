// app/cozinha/page.tsx
// ?? LÓGICA - Seleção de Perfil com Cores

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SelecaoPerfilUI from '@/components/cozinha/SelecaoPerfilUI';
import ModalAssinatura from '@/components/cozinha/ModalAssinatura';
import ModalRevendedor from '@/components/cozinha/ModalRevendedor';
import { useApp } from '@/app/context/AppContext';

// ============================================================
// PERFIS COM CORES DIFERENTES
// ============================================================
const perfis = [
  {
    id: 'publico',
    nome: 'Público Geral',
    icone: '??',
    descricao: 'Preço cheio, sem compromisso',
    desconto: 0,
    badge: 'Sem desconto',
    cor: '#3B82F6', // Azul
    corDestaque: '#60A5FA'
  },
  {
    id: 'assinante',
    nome: 'Cliente Assinatura',
    icone: '?',
    descricao: '15% de desconto, mínimo 5 porções',
    desconto: 15,
    badge: '15% OFF',
    cor: '#EAB308', // Amarelo
    corDestaque: '#FCD34D'
  },
  {
    id: 'revendedor',
    nome: 'Parceiro Revendedor',
    icone: '??',
    descricao: '19% de desconto, contato com a cozinha',
    desconto: 19,
    badge: '19% OFF',
    cor: '#8B5CF6', // Roxo
    corDestaque: '#A78BFA'
  }
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function CozinhaPage() {
  const router = useRouter();
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState<'assinante' | 'revendedor' | null>(null);

  const selecionarPerfil = (perfilId: string) => {
    if (perfilId === 'assinante') {
      setModalAberto('assinante');
    } else if (perfilId === 'revendedor') {
      setModalAberto('revendedor');
    } else {
      setLoading(true);
      router.push(`/cozinha/catalogo?perfil=${perfilId}`);
    }
  };

  const confirmarAssinatura = () => {
    setModalAberto(null);
    setLoading(true);
    router.push('/cozinha/catalogo?perfil=assinante');
  };

  const confirmarRevendedor = () => {
    setModalAberto(null);
    setLoading(true);
    router.push('/cozinha/catalogo?perfil=revendedor');
  };

  return (
    <>
      <SelecaoPerfilUI
        perfis={perfis}
        onSelecionar={selecionarPerfil}
        loading={loading}
      />

      <ModalAssinatura
        isOpen={modalAberto === 'assinante'}
        onConfirm={confirmarAssinatura}
        onCancel={() => setModalAberto(null)}
      />

      <ModalRevendedor
        isOpen={modalAberto === 'revendedor'}
        onConfirm={confirmarRevendedor}
        onCancel={() => setModalAberto(null)}
        user={user}
      />
    </>
  );
}

