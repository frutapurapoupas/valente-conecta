// components/CadastroPopupWrapper.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CadastroPopup } from './CadastroPopup';
import { isUserLoggedIn } from '@/lib/auth';

function CadastroPopupContent() {
  const searchParams = useSearchParams();
  // Prioridade: ?ref= na URL atual; se nao tiver, cai pro codigo que ficou
  // salvo em localStorage quando a pessoa visitou /convite/CODIGO antes e
  // nao completou o cadastro na hora (ex: celular lento) — antes esse valor
  // ficava gravado no aparelho mas nunca era lido de volta, perdendo a
  // indicacao quando o cadastro acontecia fora da propria pagina de convite.
  const refUrl = searchParams?.get('ref') || undefined;
  const refStorage = typeof window !== 'undefined' ? localStorage.getItem('convite_codigo') || undefined : undefined;
  const codigoIndicacao = refUrl || refStorage;

  // Se já logado, não mostrar
  if (isUserLoggedIn()) return null;

  return <CadastroPopup codigoIndicacao={codigoIndicacao} />;
}

export function CadastroPopupWrapper() {
  return (
    <Suspense fallback={null}>
      <CadastroPopupContent />
    </Suspense>
  );
}

