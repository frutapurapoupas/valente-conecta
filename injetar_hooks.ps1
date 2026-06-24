$conteudoHook = @"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useDemandCapture = (category: string) => {
  const [loading, setLoading] = useState(false);

  const handleCapture = async (data: { 
    name: string, 
    whatsapp: string, 
    description: string, 
    extra_data?: any 
  }) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('demands').insert({
        ...data,
        category,
        source_entry_point: category,
        urgency_level: 'medio',
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Erro na captura:", err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const calculateMargins = (totalValue: number) => {
    return {
      insumos: totalValue * 0.40,
      chef: totalValue * 0.30,
      parceiro: totalValue * 0.30
    };
  };

  return { handleCapture, calculateMargins, loading };
};
"@

$modulos = Get-ChildItem -Path "app/admin-master" -Directory

foreach ($m in $modulos) {
    $caminhoHook = Join-Path $m.FullName "hooks\useDemandCapture.ts"
    
    if (Test-Path (Join-Path $m.FullName "hooks")) {
        $conteudoHook | Out-File -FilePath $caminhoHook -Encoding utf8
        Write-Host "Hook injetado em: $($m.Name)" -ForegroundColor Cyan
    }
}