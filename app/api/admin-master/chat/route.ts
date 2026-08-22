// Caminho: C:\valente_conecta\app\api\admin-master\chat\route.ts
//
// Lista de conversas do admin master: uma linha por usuario_id, com a
// ultima mensagem e quantas estao sem ler. Agrupado aqui no servidor (client
// do Supabase nao faz group-by direto), volume esperado e' baixo o
// suficiente pra isso ser tranquilo.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mensagens_chat')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const porUsuario = new Map<string, { usuarioId: string; ultimaMensagem: string; ultimoRemetente: string; ultimaData: string; naoLidas: number }>();
  for (const msg of data || []) {
    const atual = porUsuario.get(msg.usuario_id);
    if (!atual) {
      porUsuario.set(msg.usuario_id, {
        usuarioId: msg.usuario_id,
        ultimaMensagem: msg.texto,
        ultimoRemetente: msg.remetente,
        ultimaData: msg.created_at,
        naoLidas: msg.remetente === 'usuario' && !msg.lida ? 1 : 0,
      });
    } else if (msg.remetente === 'usuario' && !msg.lida) {
      atual.naoLidas += 1;
    }
  }

  const conversas = Array.from(porUsuario.values()).sort(
    (a, b) => new Date(b.ultimaData).getTime() - new Date(a.ultimaData).getTime()
  );

  return NextResponse.json({ success: true, data: conversas });
}
