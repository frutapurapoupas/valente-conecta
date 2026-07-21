// ============================================================================
// ARQUIVO 2: app/api/configuracoes/route.ts
// Funcionalidade: API para gerenciar configuraÃ§Ãµes do sistema
// Rotas:
//   GET /api/configuracoes?chave=xxx - Buscar configuraÃ§Ã£o especÃ­fica
//   GET /api/configuracoes?categoria=xxx - Buscar todas configs de uma categoria
//   POST /api/configuracoes - Salvar/Atualizar configuraÃ§Ã£o
//   GET /api/configuracoes/grupos - Listar todos os grupos
//   POST /api/configuracoes/grupos - Criar novo grupo
//   PUT /api/configuracoes/grupos - Atualizar grupo
//   DELETE /api/configuracoes/grupos?id=xxx - Deletar/Desativar grupo
//   GET /api/configuracoes/logs?notificacaoId=xxx - Buscar logs
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ServiÃ§o inline de configuraÃ§Ãµes (substitui import inexistente)
const configuracoesService = {
  async getGrupos() {
    try {
      const { data } = await supabase.from('grupos_notificacao').select('*').eq('ativo', true);
      return data || [];
    } catch { return []; }
  },
  async getLogsPorNotificacao(notificacaoId: string) {
    try {
      const { data } = await supabase.from('logs_notificacao').select('*').eq('notificacao_id', notificacaoId);
      return data || [];
    } catch { return []; }
  },
  async getLogsPorUsuario(usuarioId: string) {
    try {
      const { data } = await supabase.from('logs_notificacao').select('*').eq('usuario_id', usuarioId);
      return data || [];
    } catch { return []; }
  },
  async getConfiguracao(chave: string) {
    try {
      const { data } = await supabase.from('configuracoes').select('valor').eq('chave', chave).single();
      return data?.valor ?? null;
    } catch { return null; }
  },
  async setConfiguracao(chave: string, valor: any) {
    try {
      const { error } = await supabase.from('configuracoes').upsert({ chave, valor }, { onConflict: 'chave' });
      return !error;
    } catch { return false; }
  },
  async criarGrupo(grupo: any) {
    try {
      const { data } = await supabase.from('grupos_notificacao').insert(grupo).select().single();
      return data;
    } catch { return null; }
  },
  async atualizarGrupo(id: string, dados: any) {
    try {
      const { data } = await supabase.from('grupos_notificacao').update(dados).eq('id', id).select().single();
      return data;
    } catch { return null; }
  },
  async adicionarUsuarioAoGrupo(usuarioId: string, grupoId: string) {
    try {
      const { error } = await supabase
        .from('usuarios_grupos')
        .insert({
          usuario_id: usuarioId,
          grupo_id: grupoId
        });

      return !error;
    } catch {
      return false;
    }
  },
  async removerUsuarioDoGrupo(usuarioId: string, grupoId: string) {
    try {
      const { error } = await supabase
        .from('usuarios_grupos')
        .delete()
        .eq('usuario_id', usuarioId)
        .eq('grupo_id', grupoId);

      return !error;
    } catch {
      return false;
    }
  },
  async deletarGrupo(id: string) {
    try {
      const { error } = await supabase
        .from('grupos_notificacao')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },
  async desativarGrupo(id: string) {
    try {
      await supabase.from('grupos_notificacao').update({ ativo: false }).eq('id', id);
      return true;
    } catch { return false; }
  }
};

// Verificar se o usuÃ¡rio Ã© Admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Verificar na tabela de usuÃ¡rios se Ã© admin
    const { data } = await supabase
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    return data?.is_admin === true;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
}

// ============================================================================
// GET - Buscar configuraÃ§Ãµes
// ============================================================================
export async function GET(request: NextRequest) {
  // Verificar autenticaÃ§Ã£o
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const chave = searchParams.get('chave');
  const categoria = searchParams.get('categoria');
  const tipo = searchParams.get('tipo'); // 'grupos' ou 'logs'

  // Buscar grupos
  if (tipo === 'grupos') {
    const grupos = await configuracoesService.getGrupos();
    return NextResponse.json({ success: true, data: grupos });
  }

  // Buscar logs por notificaÃ§Ã£o
  if (tipo === 'logs') {
    const notificacaoId = searchParams.get('notificacaoId');
    if (notificacaoId) {
      const logs = await configuracoesService.getLogsPorNotificacao(notificacaoId);
      return NextResponse.json({ success: true, data: logs });
    }
    
    const usuarioId = searchParams.get('usuarioId');
    if (usuarioId) {
      const logs = await configuracoesService.getLogsPorUsuario(usuarioId);
      return NextResponse.json({ success: true, data: logs });
    }
    
    return NextResponse.json({ success: true, data: [] });
  }

  // Buscar configuraÃ§Ã£o especÃ­fica
  if (chave) {
    const valor = await configuracoesService.getConfiguracao(chave);
    return NextResponse.json({ success: true, data: { chave, valor } });
  }

  // Buscar todas configuraÃ§Ãµes de uma categoria
  if (categoria) {
    const chavesPorCategoria: Record<string, string[]> = {
      telegram: ['telegram_bot_token', 'telegram_grupo_teste_id', 'telegram_grupo_todos_id'],
      push: ['push_vapid_public_key', 'push_vapid_private_key', 'push_firebase_config'],
      geral: ['modo_teste', 'notificacao_timeout']
    };
    
    const chavesParaBuscar = chavesPorCategoria[categoria] || [];
    const resultados: Record<string, any> = {};
    
    for (const ch of chavesParaBuscar) {
      resultados[ch] = await configuracoesService.getConfiguracao(ch);
    }
    
    return NextResponse.json({ success: true, data: resultados });
  }

  // Listar todas configuraÃ§Ãµes (apenas chaves pÃºblicas)
  const configuracoesPublicas = {
    modo_teste: await configuracoesService.getConfiguracao('modo_teste'),
    telegram_grupo_teste_id: await configuracoesService.getConfiguracao('telegram_grupo_teste_id'),
    telegram_grupo_todos_id: await configuracoesService.getConfiguracao('telegram_grupo_todos_id'),
    notificacao_timeout: await configuracoesService.getConfiguracao('notificacao_timeout')
  };
  
  return NextResponse.json({ success: true, data: configuracoesPublicas });
}

// ============================================================================
// POST - Salvar configuraÃ§Ã£o
// ============================================================================
export async function POST(request: NextRequest) {
  // Verificar autenticaÃ§Ã£o
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tipo, ...dados } = body;

    // Criar novo grupo
    if (tipo === 'grupo') {
      const { nome, descricao, icone, cor, telegram_chat_id } = dados;
      
      if (!nome) {
        return NextResponse.json({ error: 'Nome do grupo Ã© obrigatÃ³rio' }, { status: 400 });
      }
      
      const novoGrupo = await configuracoesService.criarGrupo({
        nome,
        descricao: descricao || '',
        icone: icone || 'Users',
        cor: cor || '#6366f1',
        telegram_chat_id: telegram_chat_id || null,
        ativo: true
      });
      
      return NextResponse.json({ success: true, data: novoGrupo });
    }
    
    // Salvar configuraÃ§Ã£o individual
    if (tipo === 'config') {
      const { chave, valor } = dados;
      
      if (!chave) {
        return NextResponse.json({ error: 'Chave Ã© obrigatÃ³ria' }, { status: 400 });
      }
      
      // CORRIGIDO: removido o terceiro parÃ¢metro usuarioId
      const salvou = await configuracoesService.setConfiguracao(chave, valor);
      
      if (salvou) {
        return NextResponse.json({ success: true, message: 'ConfiguraÃ§Ã£o salva com sucesso' });
      } else {
        return NextResponse.json({ error: 'Erro ao salvar configuraÃ§Ã£o' }, { status: 500 });
      }
    }
    
    // Adicionar usuÃ¡rio a grupo
    if (tipo === 'usuario_grupo') {
      const { usuarioId, grupoId } = dados;
      
      if (!usuarioId || !grupoId) {
        return NextResponse.json({ error: 'UsuÃ¡rio e grupo sÃ£o obrigatÃ³rios' }, { status: 400 });
      }
      
      // CORRIGIDO: removido o terceiro parÃ¢metro adminId
      const adicionou = await configuracoesService.adicionarUsuarioAoGrupo(usuarioId, grupoId);
      
      if (adicionou) {
        return NextResponse.json({ success: true, message: 'UsuÃ¡rio adicionado ao grupo' });
      } else {
        return NextResponse.json({ error: 'Erro ao adicionar usuÃ¡rio ao grupo' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Tipo de operaÃ§Ã£o nÃ£o reconhecido' }, { status: 400 });
    
  } catch (error) {
    console.error('Erro na API de configuraÃ§Ãµes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================================================
// PUT - Atualizar configuraÃ§Ã£o existente
// ============================================================================
export async function PUT(request: NextRequest) {
  // Verificar autenticaÃ§Ã£o
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tipo, ...dados } = body;

    // Atualizar grupo
    if (tipo === 'grupo') {
      const { id, nome, descricao, icone, cor, telegram_chat_id, ativo } = dados;
      
      if (!id) {
        return NextResponse.json({ error: 'ID do grupo Ã© obrigatÃ³rio' }, { status: 400 });
      }
      
      const atualizou = await configuracoesService.atualizarGrupo(id, {
        nome,
        descricao,
        icone,
        cor,
        telegram_chat_id,
        ativo
      });
      
      if (atualizou) {
        return NextResponse.json({ success: true, message: 'Grupo atualizado' });
      } else {
        return NextResponse.json({ error: 'Erro ao atualizar grupo' }, { status: 500 });
      }
    }
    
    // Remover usuÃ¡rio de grupo
    if (tipo === 'usuario_grupo') {
      const { usuarioId, grupoId } = dados;
      
      if (!usuarioId || !grupoId) {
        return NextResponse.json({ error: 'UsuÃ¡rio e grupo sÃ£o obrigatÃ³rios' }, { status: 400 });
      }
      
      const removeu = await configuracoesService.removerUsuarioDoGrupo(usuarioId, grupoId);
      
      if (removeu) {
        return NextResponse.json({ success: true, message: 'UsuÃ¡rio removido do grupo' });
      } else {
        return NextResponse.json({ error: 'Erro ao remover usuÃ¡rio do grupo' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Tipo de operaÃ§Ã£o nÃ£o reconhecido' }, { status: 400 });
    
  } catch (error) {
    console.error('Erro na API de configuraÃ§Ãµes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Remover configuraÃ§Ã£o/grupo
// ============================================================================
export async function DELETE(request: NextRequest) {
  // Verificar autenticaÃ§Ã£o
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    
    // Deletar grupo
    if (tipo === 'grupo') {
      const id = searchParams.get('id');
      
      if (!id) {
        return NextResponse.json({ error: 'ID do grupo Ã© obrigatÃ³rio' }, { status: 400 });
      }
      
      const deletou = await configuracoesService.deletarGrupo(id);
      
      if (deletou) {
        return NextResponse.json({ success: true, message: 'Grupo removido' });
      } else {
        return NextResponse.json({ error: 'Erro ao remover grupo' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Tipo de operaÃ§Ã£o nÃ£o reconhecido' }, { status: 400 });
    
  } catch (error) {
    console.error('Erro na API de configuraÃ§Ãµes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

