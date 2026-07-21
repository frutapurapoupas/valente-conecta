// components/CadastroPopupWrapper.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CadastroPopup } from './CadastroPopup';
import { isUserLoggedIn } from '@/lib/auth';

function CadastroPopupContent() {
  const searchParams = useSearchParams();
  const codigoIndicacao = searchParams.get('ref') || undefined;
  
  // Se jÃ¡ logado, nÃ£o mostrar
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

