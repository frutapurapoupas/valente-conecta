// app/api/beneficios/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabase
    .from('admin_beneficios')
    .select('*')
    .order('id');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const beneficios = data.map(b => b.valor);
  return NextResponse.json({ beneficios });
}

