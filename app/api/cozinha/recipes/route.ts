import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromDbToCanonical } from '../receitas/canonical';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Redirecionamento para a API de receitas (mantido para compatibilidade)
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []).map(fromDbToCanonical) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar receitas' },
      { status: 500 }
    );
  }
}



