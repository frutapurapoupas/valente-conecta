// components/CadastroPopupWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CadastroPopup } from './CadastroPopup';
import { isUserLoggedIn } from '@/lib/auth';

export function CadastroPopupWrapper() {
  const [codigoIndicacao, setCodigoIndicacao] = useState<string | undefined>();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Se já logado, não mostrar
    if (isUserLoggedIn()) return;
    
    // Verificar se tem código de indicação na URL
    const ref = searchParams.get('ref');
    if (ref) {
      setCodigoIndicacao(ref);
    }
  }, [searchParams]);

  return <CadastroPopup codigoIndicacao={codigoIndicacao} />;
}