import { supabase } from '@/lib/supabase'

export interface Produto {
  id: string
  nome: string
  codigo_barras: string | null
  preco: number | null
  foto: string | null
  estoque: number
  status: 'ativo' | 'pendente_validacao' | 'inativo'
  criado_por: string
  fonte_origem: 'manual' | 'leitor' | 'crowdsourcing' | 'integracao'
  created_at: string
  updated_at: string
  em_promocao?: boolean
  preco_anterior?: number
  preco_atualizado_em?: string
}

export interface NotificacaoAdmin {
  id: string
  tipo: 'validacao_produto' | 'novo_usuario' | 'sistema'
  conteudo: any
  lida: boolean
  created_at: string
}

export interface NotificacaoLoja {
  id: string
  loja_id: string
  mensagem: string
  lida: boolean
  created_at: string
}

// Buscar produtos por nome (busca inteligente)
export async function buscarProdutosPorNome(nome: string, limite: number = 10): Promise<Produto[]> {
  if (!nome || nome.length < 2) return []
  
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .ilike('nome', `${nome}%`)
    .or('status.eq.ativo,and(status.eq.pendente_validacao,estoque.gt.0)')
    .order('nome')
    .limit(limite)
  
  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
  
  return data || []
}

// Criar produto parcial (pendente validação)
export async function criarProdutoParcial(
  nome: string, 
  usuarioId: string, 
  lojaId: string
): Promise<Produto | null> {
  const novoProduto = {
    nome: nome,
    codigo_barras: null,
    preco: null,
    foto: null,
    estoque: 0,
    status: 'pendente_validacao',
    criado_por: usuarioId,
    loja_id: lojaId,
    fonte_origem: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('produtos')
    .insert(novoProduto)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar produto parcial:', error)
    return null
  }
  
  // Criar notificação para admin master
  await criarNotificacaoAdmin({
    tipo: 'validacao_produto',
    conteudo: {
      produto_id: data.id,
      produto_nome: nome,
      usuario_id: usuarioId,
      loja_id: lojaId,
      criado_em: new Date().toISOString()
    }
  })
  
  // Criar notificação para loja
  await criarNotificacaoLoja({
    loja_id: lojaId,
    mensagem: `📦 Produto "${nome}" criado parcialmente. Complete o cadastro com preço, estoque e fornecedor.`
  })
  
  return data
}

// Atualizar produto com informações completas
export async function atualizarProdutoCompleto(
  produtoId: string,
  dados: { preco: number; estoque: number; codigo_barras?: string; fornecedor?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from('produtos')
    .update({
      preco: dados.preco,
      estoque: dados.estoque,
      codigo_barras: dados.codigo_barras || null,
      status: 'ativo',
      updated_at: new Date().toISOString()
    })
    .eq('id', produtoId)
  
  if (error) {
    console.error('Erro ao atualizar produto:', error)
    return false
  }
  
  return true
}

// Criar notificação para admin master
export async function criarNotificacaoAdmin(notificacao: Omit<NotificacaoAdmin, 'id' | 'lida' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('notificacoes_admin')
    .insert({
      tipo: notificacao.tipo,
      conteudo: notificacao.conteudo,
      lida: false,
      created_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Erro ao criar notificação admin:', error)
  }
}

// Criar notificação para loja
export async function criarNotificacaoLoja(notificacao: Omit<NotificacaoLoja, 'id' | 'lida' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('notificacoes_loja')
    .insert({
      loja_id: notificacao.loja_id,
      mensagem: notificacao.mensagem,
      lida: false,
      created_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Erro ao criar notificação loja:', error)
  }
}

// Verificar duplicidade de produto (para admin master)
export async function verificarDuplicidadeProduto(nome: string): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .ilike('nome', `%${nome}%`)
    .eq('status', 'ativo')
    .limit(5)
  
  if (error) {
    console.error('Erro ao verificar duplicidade:', error)
    return []
  }
  
  return data || []
}