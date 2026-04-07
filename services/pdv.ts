// services/pdv.ts
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

export interface AlertaAdmin {
  id: string
  tipo: 'NOVO_PRODUTO_PENDENTE' | 'PRODUTO_VALIDADO' | 'ERRO_SISTEMA'
  origem: string
  dados: any
  status: 'pendente' | 'lido' | 'processado'
  created_at: string
}

// Buscar produtos por nome (busca inteligente)
export async function buscarProdutosPorNome(nome: string, limite: number = 10): Promise<Produto[]> {
  if (!nome || nome.length < 2) return []
  
  // Simulação - substituir pelo Supabase
  const saved = localStorage.getItem('produtos_estoque')
  const todosProdutos = saved ? JSON.parse(saved) : []
  
  const resultados = todosProdutos
    .filter((p: any) => p.nome.toLowerCase().includes(nome.toLowerCase()))
    .slice(0, limite)
  
  return resultados
}

// Buscar produto por EAN
export async function buscarProdutoPorEAN(ean: string): Promise<Produto | null> {
  if (!ean) return null
  
  const saved = localStorage.getItem('produtos_estoque')
  const todosProdutos = saved ? JSON.parse(saved) : []
  
  const produto = todosProdutos.find((p: any) => p.codigo === ean)
  return produto || null
}

// Salvar produto pendente
export async function salvarProdutoPendente(
  nome: string,
  ean: string | null,
  usuarioId: string,
  lojaId: string
): Promise<ProdutoPendente> {
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
  
  // Criar alerta para admin
  await enviarAlertaAdmin({
    tipo: 'NOVO_PRODUTO_PENDENTE',
    origem: 'PDV',
    dados: {
      produto_nome: nome,
      produto_ean: ean,
      usuario_id: usuarioId,
      loja_id: lojaId
    },
    status: 'pendente'
  })
  
  return novoPendente
}

// Enviar alerta para admin master
export async function enviarAlertaAdmin(alerta: Omit<AlertaAdmin, 'id' | 'created_at'>): Promise<void> {
  const novoAlerta: AlertaAdmin = {
    id: Date.now().toString(),
    ...alerta,
    created_at: new Date().toISOString()
  }
  
  const alertas = localStorage.getItem('alertas_admin')
  const listaAlertas = alertas ? JSON.parse(alertas) : []
  listaAlertas.push(novoAlerta)
  localStorage.setItem('alertas_admin', JSON.stringify(listaAlertas))
}

// Atualizar produto após aprovação
export async function aprovarProdutoPendente(pendenteId: string, dadosCompletos: any): Promise<void> {
  // Buscar pendente
  const pendentes = localStorage.getItem('produtos_pendentes')
  const listaPendentes = pendentes ? JSON.parse(pendentes) : []
  const pendente = listaPendentes.find((p: any) => p.id === pendenteId)
  
  if (!pendente) return
  
  // Criar produto real
  const novoProduto = {
    id: Date.now().toString(),
    nome: pendente.nome_digitado,
    ean: pendente.ean,
    preco: dadosCompletos.preco,
    imagem: dadosCompletos.imagem || null,
    estoque: dadosCompletos.estoque || 0,
    status: 'ativo',
    loja_id: pendente.loja_id,
    created_at: new Date().toISOString()
  }
  
  const produtos = localStorage.getItem('produtos_estoque')
  const listaProdutos = produtos ? JSON.parse(produtos) : []
  listaProdutos.push(novoProduto)
  localStorage.setItem('produtos_estoque', JSON.stringify(listaProdutos))
  
  // Atualizar status do pendente
  const pendentesAtualizados = listaPendentes.map((p: any) =>
    p.id === pendenteId ? { ...p, status: 'aprovado' } : p
  )
  localStorage.setItem('produtos_pendentes', JSON.stringify(pendentesAtualizados))
}

// Verificar configuração de auto aprovação
export async function getAutoAprovarConfig(): Promise<boolean> {
  const config = localStorage.getItem('auto_aprovar_produtos')
  return config === 'true'
}

// Salvar configuração de auto aprovação
export async function setAutoAprovarConfig(valor: boolean): Promise<void> {
  localStorage.setItem('auto_aprovar_produtos', String(valor))
}