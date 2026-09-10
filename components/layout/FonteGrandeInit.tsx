'use client';

// Caminho: C:\valente_conecta\components\layout\FonteGrandeInit.tsx
//
// Aplica a preferencia de "fonte grande" salva (ver lib/preferencias/
// fonteGrande.ts) assim que o app carrega, em qualquer tela -- montado uma
// unica vez no layout raiz.

import { useEffect } from 'react';
import { aplicarFonteGrande, lerFonteGrandeAtiva } from '@/lib/preferencias/fonteGrande';

export function FonteGrandeInit() {
  useEffect(() => {
    aplicarFonteGrande(lerFonteGrandeAtiva());
  }, []);
  return null;
}
