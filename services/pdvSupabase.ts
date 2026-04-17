// services/pdvSupabase.ts
import { supabase } from '@/lib/supabase'

export interface Produto {
  id: string
  nome: string
  ean: string | null
  preco: number | null
  imagem: string | null
  estoque: number
  status: 'ativo' | 'pendente_validacao'
  loja_id: string
  created_at: string
}

export interface ProdutoPendente {
  id: string
  nome_digitado: string
  ean: string | null
  usuario_id: string
  loja_id: string
  data: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
}

export interface Venda {
  id: string
  loja_id: string
  usuario_id: string
  itens: VendaItem[]
  total: number
  forma_pagamento: string
  cliente_nome?: string
  cliente_telefone?: string
  status: 'pendente' | 'confirmada' | 'cancelada'
  created_at: string
}

export interface VendaItem {
  produto_id: string
  produto_nome: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

// Tabelas necessárias no Supabase:
// - produtos (id, nome, ean, preco, imagem, estoque, status, loja_id, created_at)
// - produtos_pendentes (id, nome_digitado, ean, usuario_id, loja_id, data, status)
// - vendas (id, loja_id, usuario_id, itens, total, forma_pagamento, cliente_nome, cliente_telefone, status, created_at)

// Buscar produtos por nome (busca inteligente)
export async function buscarProdutosPorNome(nome: string, limite: number = 10): Promise<Produto[]> {
  if (!nome || nome.length < 2) return []
  
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .ilike('nome', `%${nome}%`)
      .eq('status', 'ativo')
      .limit(limite)
      .order('nome')
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Erro ao buscar produtos por nome:', error)
    // Fallback para localStorage
    return buscarProdutosPorNomeLocal(nome, limite)
  }
}

// Buscar produto por EAN
export async function buscarProdutoPorEAN(ean: string): Promise<Produto | null> {
  if (!ean) return null
  
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ean', ean)
      .eq('status', 'ativo')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado, tentar criar produto pendente
        return null
      }
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Erro ao buscar produto por EAN:', error)
    // Fallback para localStorage
    return buscarProdutoPorEANLocal(ean)
  }
}

// Salvar produto pendente
export async function salvarProdutoPendente(
  nome: string,
  ean: string | null,
  usuarioId: string,
  lojaId: string
): Promise<ProdutoPendente> {
  try {
    const { data, error } = await supabase
      .from('produtos_pendentes')
      .insert({
        nome_digitado: nome,
        ean: ean,
        usuario_id: usuarioId,
        loja_id: lojaId,
        data: new Date().toISOString(),
        status: 'pendente'
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Enviar notificação para admin master
    await enviarNotificacaoAdmin({
      tipo: 'NOVO_PRODUTO_PENDENTE',
      origem: 'PDV',
      dados: {
        produto_nome: nome,
        produto_ean: ean,
        usuario_id: usuarioId,
        loja_id: lojaId
      }
    })
    
    return data
  } catch (error) {
    console.error('Erro ao salvar produto pendente:', error)
    // Fallback para localStorage
    return salvarProdutoPendenteLocal(nome, ean, usuarioId, lojaId)
  }
}

// Registrar venda
export async function registrarVenda(venda: Omit<Venda, 'id' | 'created_at'>): Promise<Venda> {
  try {
    const { data, error } = await supabase
      .from('vendas')
      .insert({
        ...venda,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro Supabase, usando fallback:', error)
      return registrarVendaLocal(venda)
    }
    
    // Atualizar estoque dos produtos
    for (const item of venda.itens) {
      try {
        await atualizarEstoque(item.produto_id, item.quantidade)
      } catch (estoqueError) {
        console.error('Erro ao atualizar estoque:', estoqueError)
        // Continuar mesmo se falhar estoque
      }
    }
    
    // Enviar notificação de venda
    try {
      await enviarNotificacaoVenda(venda)
    } catch (notifError) {
      console.error('Erro ao enviar notificação:', notifError)
      // Continuar mesmo se falhar notificação
    }
    
    return data
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    // Fallback para localStorage
    return registrarVendaLocal(venda)
  }
}

// Fallback local para registrar venda
function registrarVendaLocal(venda: Omit<Venda, 'id' | 'created_at'>): Venda {
  const novaVenda: Venda = {
    id: Date.now().toString(),
    ...venda,
    created_at: new Date().toISOString()
  }
  
  // Salvar no localStorage
  const vendas = localStorage.getItem('vendas_loja')
  const listaVendas = vendas ? JSON.parse(vendas) : []
  listaVendas.push(novaVenda)
  localStorage.setItem('vendas_loja', JSON.stringify(listaVendas))
  
  // Simular atualização de estoque local
  const produtos = localStorage.getItem('produtos_estoque')
  if (produtos) {
    const listaProdutos = JSON.parse(produtos)
    venda.itens.forEach(item => {
      const produtoIndex = listaProdutos.findIndex((p: any) => p.id === item.produto_id)
      if (produtoIndex >= 0) {
        listaProdutos[produtoIndex].estoque = Math.max(0, listaProdutos[produtoIndex].estoque - item.quantidade)
      }
    })
    localStorage.setItem('produtos_estoque', JSON.stringify(listaProdutos))
  }
  
  return novaVenda
}

// Atualizar estoque
export async function atualizarEstoque(produtoId: string, quantidade: number): Promise<void> {
  try {
    const { error } = await supabase.rpc('atualizar_estoque', {
      p_produto_id: produtoId,
      p_quantidade: quantidade
    })
    
    if (error) throw error
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error)
    throw error
  }
}

// Buscar vendas do dia
export async function buscarVendasDoDia(lojaId: string): Promise<Venda[]> {
  try {
    const hoje = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('loja_id', lojaId)
      .gte('created_at', hoje)
      .eq('status', 'confirmada')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro Supabase, usando fallback:', error)
      return buscarVendasDoDiaLocal()
    }
    
    return data || []
  } catch (error) {
    console.error('Erro ao buscar vendas do dia:', error)
    return buscarVendasDoDiaLocal()
  }
}

// Fallback local para buscar vendas do dia
function buscarVendasDoDiaLocal(): Venda[] {
  try {
    const vendas = localStorage.getItem('vendas_loja')
    const listaVendas = vendas ? JSON.parse(vendas) : []
    
    const hoje = new Date().toISOString().split('T')[0]
    
    return listaVendas
      .filter((venda: Venda) => 
        venda.created_at.startsWith(hoje) && 
        venda.status === 'confirmada'
      )
      .sort((a: Venda, b: Venda) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  } catch (error) {
    console.error('Erro ao buscar vendas locais:', error)
    return []
  }
}

// Enviar notificação para admin
async function enviarNotificacaoAdmin(alerta: any): Promise<void> {
  try {
    // Implementar notificação via Supabase Realtime ou bot Telegram
    console.log('Notificação admin:', alerta)
  } catch (error) {
    console.error('Erro ao enviar notificação admin:', error)
  }
}

// Enviar notificação de venda
async function enviarNotificacaoVenda(venda: any): Promise<void> {
  try {
    // Implementar notificação via Supabase Realtime ou bot Telegram
    console.log('Notificação venda:', venda)
  } catch (error) {
    console.error('Erro ao enviar notificação venda:', error)
  }
}

// Funções fallback para localStorage
function buscarProdutosPorNomeLocal(nome: string, limite: number): Produto[] {
  const saved = localStorage.getItem('produtos_estoque')
  const todosProdutos = saved ? JSON.parse(saved) : []
  
  return todosProdutos
    .filter((p: any) => p.nome.toLowerCase().includes(nome.toLowerCase()))
    .slice(0, limite)
}

function buscarProdutoPorEANLocal(ean: string): Produto | null {
  const saved = localStorage.getItem('produtos_estoque')
  const todosProdutos = saved ? JSON.parse(saved) : []
  
  return todosProdutos.find((p: any) => p.codigo === ean) || null
}

function salvarProdutoPendenteLocal(
  nome: string,
  ean: string | null,
  usuarioId: string,
  lojaId: string
): ProdutoPendente {
  const novoPendente: ProdutoPendente = {
    id: Date.now().toString(),
    nome_digitado: nome,
    ean: ean,
    usuario_id: usuarioId,
    loja_id: lojaId,
    data: new Date().toISOString(),
    status: 'pendente'
  }
  
  const pendentes = localStorage.getItem('produtos_pendentes')
  const listaPendentes = pendentes ? JSON.parse(pendentes) : []
  listaPendentes.push(novoPendente)
  localStorage.setItem('produtos_pendentes', JSON.stringify(listaPendentes))
  
  return novoPendente
}
