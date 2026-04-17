'use client'
import { useState, useEffect, useCallback } from 'react'
import { 
  buscarProdutosPorNome, 
  buscarProdutoPorEAN, 
  salvarProdutoPendente,
  registrarVenda,
  buscarVendasDoDia,
  Produto,
  Venda
} from '@/services/pdvSupabase'

interface CarrinhoItem extends Produto {
  quantidade: number
  subtotal: number
}

export function usePDVSupabase() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [buscaTermo, setBuscaTermo] = useState('')
  const [produtosEncontrados, setProdutosEncontrados] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendasDoDia, setVendasDoDia] = useState<Venda[]>([])
  const [showCadastroRapido, setShowCadastroRapido] = useState(false)
  const [produtoPendente, setProdutoPendente] = useState<{
    nome: string
    ean: string | null
  } | null>(null)

  // Buscar produtos por nome
  const buscarProdutos = useCallback(async (termo: string) => {
    if (termo.length < 2) {
      setProdutosEncontrados([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const produtos = await buscarProdutosPorNome(termo, 10)
      setProdutosEncontrados(produtos)
    } catch (err) {
      setError('Erro ao buscar produtos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Processar código de barras
  const processarCodigo = useCallback(async (ean: string) => {
    setLoading(true)
    setError(null)

    try {
      const produto = await buscarProdutoPorEAN(ean)
      
      if (produto) {
        adicionarAoCarrinho(produto)
      } else {
        // Produto não encontrado, mostrar cadastro rápido
        setProdutoPendente({ nome: '', ean })
        setShowCadastroRapido(true)
      }
    } catch (err) {
      setError('Erro ao processar código de barras')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = useCallback((produto: Produto) => {
    setCarrinho(prev => {
      const itemExistente = prev.find(item => item.id === produto.id)
      
      if (itemExistente) {
        return prev.map(item =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                subtotal: (item.quantidade + 1) * (item.preco || 0)
              }
            : item
        )
      } else {
        return [...prev, {
          ...produto,
          quantidade: 1,
          subtotal: produto.preco || 0
        }]
      }
    })
  }, [])

  // Remover item do carrinho
  const removerItem = useCallback((produtoId: string) => {
    setCarrinho(prev => prev.filter(item => item.id !== produtoId))
  }, [])

  // Atualizar quantidade
  const atualizarQuantidade = useCallback((produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(produtoId)
      return
    }

    setCarrinho(prev => prev.map(item => {
      if (item.id === produtoId) {
        return {
          ...item,
          quantidade,
          subtotal: quantidade * (item.preco || 0)
        }
      }
      return item
    }))
  }, [removerItem])

  // Limpar carrinho
  const limparCarrinho = useCallback(() => {
    setCarrinho([])
  }, [])

  // Calcular total
  const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0)

  // Cadastrar produto rápido
  const cadastrarProdutoRapido = useCallback(async (
    nome: string,
    ean: string | null,
    preco: number,
    quantidade: number = 1
  ) => {
    setLoading(true)
    setError(null)

    try {
      // Salvar como pendente para aprovação
      await salvarProdutoPendente(nome, ean, 'usuario_temp', 'loja_temp')
      
      // Adicionar ao carrinho mesmo que pendente
      const produtoTemp: Produto = {
        id: Date.now().toString(),
        nome,
        ean,
        preco,
        imagem: null,
        estoque: quantidade,
        status: 'pendente_validacao',
        loja_id: 'loja_temp',
        created_at: new Date().toISOString()
      }

      adicionarAoCarrinho(produtoTemp)
      setShowCadastroRapido(false)
      setProdutoPendente(null)
    } catch (err) {
      setError('Erro ao cadastrar produto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [adicionarAoCarrinho])

  // Finalizar venda
  const finalizarVenda = useCallback(async (
    formaPagamento: string,
    clienteNome?: string,
    clienteTelefone?: string
  ) => {
    if (carrinho.length === 0) {
      setError('Carrinho vazio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const venda: Omit<Venda, 'id' | 'created_at'> = {
        loja_id: 'loja_temp',
        usuario_id: 'usuario_temp',
        itens: carrinho.map(item => ({
          produto_id: item.id,
          produto_nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco || 0,
          subtotal: item.subtotal
        })),
        total,
        forma_pagamento: formaPagamento,
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        status: 'confirmada'
      }

      await registrarVenda(venda)
      limparCarrinho()
      
      // Buscar vendas atualizadas
      await buscarVendas()
      
      return true
    } catch (err) {
      setError('Erro ao finalizar venda')
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [carrinho, total, limparCarrinho])

  // Buscar vendas do dia
  const buscarVendas = useCallback(async () => {
    try {
      const vendas = await buscarVendasDoDia('loja_temp')
      setVendasDoDia(vendas)
    } catch (err) {
      console.error('Erro ao buscar vendas:', err)
    }
  }, [])

  // Efeito para buscar produtos quando digitar
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      buscarProdutos(buscaTermo)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [buscaTermo, buscarProdutos])

  // Carregar vendas do dia ao iniciar
  useEffect(() => {
    buscarVendas()
  }, [buscarVendas])

  return {
    // Estado
    carrinho,
    buscaTermo,
    produtosEncontrados,
    loading,
    error,
    vendasDoDia,
    showCadastroRapido,
    produtoPendente,
    total,
    
    // Actions
    setBuscaTermo,
    processarCodigo,
    adicionarAoCarrinho,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    cadastrarProdutoRapido,
    finalizarVenda,
    setShowCadastroRapido,
    buscarVendas,
    
    // Utilitários
    formatarPreco: (valor: number) => `R$ ${valor.toFixed(2)}`,
    formatarData: (data: string) => new Date(data).toLocaleString('pt-BR')
  }
}
