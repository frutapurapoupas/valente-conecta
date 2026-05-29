// app/api/user/from-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
  }
  
  // Buscar sessão no Supabase
  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('session_token', token)
    .single();
  
  if (error || !session) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }
  
  return NextResponse.json({ userId: session.user_id });
}