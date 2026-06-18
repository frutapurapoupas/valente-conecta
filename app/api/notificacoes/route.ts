import { NextResponse } from 'next/server';

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  produtoId: string;
  lida: boolean;
  data: string;
}

// Salvar notificações no localStorage (simulação)
function getNotificacoes(): Notificacao[] {
  if (typeof localStorage === 'undefined') return [];
  const notificacoes = localStorage.getItem('notificacoes_usuario');
  return notificacoes ? JSON.parse(notificacoes) : [];
}

function salvarNotificacoes(notificacoes: Notificacao[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('notificacoes_usuario', JSON.stringify(notificacoes));
}

export async function GET() {
  try {
    const notificacoes = getNotificacoes();
    // Retornar apenas as últimas 20 notificações
    const ultimasNotificacoes = notificacoes.slice(0, 20);
    return NextResponse.json({ success: true, notificacoes: ultimasNotificacoes });
  } catch (error) {
    return NextResponse.json({ success: true, notificacoes: [] });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
  }
  
  try {
    const notificacoes = getNotificacoes();
    const notificacoesAtualizadas = notificacoes.map((n: Notificacao) =>
      n.id === parseInt(id) ? { ...n, lida: true } : n
    );
    salvarNotificacoes(notificacoesAtualizadas);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}