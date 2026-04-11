'use client'

import { useState, useEffect } from 'react'

interface Produto {
  id: string
  nome: string
  codigo: string
  preco: number
  quantidade: number
  foto?: string
  fornecedor?: string
  precoCompra?: number
  validade?: string
  pendenteAprovacao?: boolean
  dataCadastro?: string
  emPromocao?: boolean
  precoAnterior?: number
  precoAtualizadoEm?: string
}

type FormData = {
  nome: string
  codigo: string
  preco: string
  quantidade: string
  fornecedor: string
  precoCompra: string
  validade: string
}

const FORM_VAZIO: FormData = {
  nome: '',
  codigo: '',
  preco: '',
  quantidade: '',
  fornecedor: '',
  precoCompra: '',
  validade: '',
}

const EXEMPLOS: Produto[] = [
  { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, quantidade: 50, fornecedor: 'Distribuidora A', precoCompra: 6.50, validade: '2025-12-31', dataCadastro: new Date().toISOString() },
  { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, quantidade: 30, fornecedor: 'Distribuidora A', precoCompra: 5.80, validade: '2025-10-15', dataCadastro: new Date().toISOString() },
  { id: '3', nome: 'Açúcar 1kg', codigo: '7891234567892', preco: 4.50, quantidade: 100, fornecedor: 'Distribuidora B', precoCompra: 3.20, validade: '2026-01-20', dataCadastro: new Date().toISOString() },
  { id: '4', nome: 'Café 500g', codigo: '7891234567893', preco: 12.90, quantidade: 25, fornecedor: 'Distribuidora C', precoCompra: 9.50, validade: '2025-08-10', dataCadastro: new Date().toISOString() },
]

export function useEstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [planoPago] = useState(false)
  const [formData, setFormData] = useState<FormData>(FORM_VAZIO)
  const [showCatalogo, setShowCatalogo] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutos(JSON.parse(saved))
    } else {
      setProdutos(EXEMPLOS)
      localStorage.setItem('produtos_estoque', JSON.stringify(EXEMPLOS))
    }
  }, [])

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.nome || !formData.codigo || !formData.preco || !formData.quantidade) {
      alert('Preencha os campos obrigatórios: Nome, Código, Preço e Quantidade')
      return
    }

    // Limit check for new products
    if (!editando) {
      const modConfig = localStorage.getItem('admin_config_moderacao')
      const limite = modConfig ? parseInt(JSON.parse(modConfig).limiteProdutosPorEmpresa, 10) : 50
      if (produtos.length >= limite) {
        alert(`❌ Limite de ${limite} produtos por empresa atingido. Solicite ao administrador o aumento do limite.`)
        return
      }
    }

    // Promotion detection: price reduction vs previous day
    const novoPreco = parseFloat(formData.preco)
    let emPromocao = false
    let precoAnterior: number | undefined
    let precoAtualizadoEm: string | undefined

    if (editando) {
      const hoje = new Date().toDateString()
      if (novoPreco < editando.preco) {
        const foiAlteradoHoje = editando.precoAtualizadoEm &&
          new Date(editando.precoAtualizadoEm).toDateString() === hoje
        if (!foiAlteradoHoje) {
          // First reduction of the day — capture yesterday's price
          precoAnterior = editando.preco
          precoAtualizadoEm = new Date().toISOString()
        } else {
          // Same-day edit — keep the original reference price
          precoAnterior = editando.precoAnterior
          precoAtualizadoEm = editando.precoAtualizadoEm
        }
        emPromocao = true
      }
      // price same or higher: leave emPromocao false, precoAnterior undefined
    }

    const novoProduto: Produto = {
      id: editando?.id || Date.now().toString(),
      nome: formData.nome,
      codigo: formData.codigo,
      preco: novoPreco,
      quantidade: parseInt(formData.quantidade),
      fornecedor: formData.fornecedor || undefined,
      precoCompra: formData.precoCompra ? parseFloat(formData.precoCompra) : undefined,
      validade: formData.validade || undefined,
      pendenteAprovacao: !editando,
      dataCadastro: editando?.dataCadastro || new Date().toISOString(),
      emPromocao: emPromocao || undefined,
      precoAnterior,
      precoAtualizadoEm,
    }

    const novosProdutos = editando
      ? produtos.map(p => p.id === editando.id ? novoProduto : p)
      : [...produtos, novoProduto]

    setProdutos(novosProdutos)
    localStorage.setItem('produtos_estoque', JSON.stringify(novosProdutos))

    if (!editando) {
      alert('✅ Produto adicionado! Aguardando aprovação do Admin Master para publicação no catálogo.')
    } else {
      alert('✅ Produto atualizado com sucesso!')
    }

    const catalogo = localStorage.getItem('catalogo_automatico')
    const novoCatalogo: Produto[] = catalogo ? JSON.parse(catalogo) : []
    const indexCatalogo = novoCatalogo.findIndex(p => p.codigo === formData.codigo)
    if (indexCatalogo !== -1) {
      novoCatalogo[indexCatalogo] = { ...novoProduto }
    } else {
      novoCatalogo.push(novoProduto)
    }
    localStorage.setItem('catalogo_automatico', JSON.stringify(novoCatalogo))

    setShowModal(false)
    setEditando(null)
    setFormData(FORM_VAZIO)
  }

  const handleEdit = (produto: Produto) => {
    setEditando(produto)
    setFormData({
      nome: produto.nome,
      codigo: produto.codigo,
      preco: produto.preco.toString(),
      quantidade: produto.quantidade.toString(),
      fornecedor: produto.fornecedor || '',
      precoCompra: produto.precoCompra?.toString() || '',
      validade: produto.validade || '',
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      const novosProdutos = produtos.filter(p => p.id !== id)
      setProdutos(novosProdutos)
      localStorage.setItem('produtos_estoque', JSON.stringify(novosProdutos))

      const catalogo = localStorage.getItem('catalogo_automatico')
      if (catalogo) {
        const novoCatalogo = (JSON.parse(catalogo) as Produto[]).filter(p => p.id !== id)
        localStorage.setItem('catalogo_automatico', JSON.stringify(novoCatalogo))
      }

      alert('✅ Produto excluído com sucesso!')
    }
  }

  const abrirNovoProduto = () => {
    setEditando(null)
    setFormData(FORM_VAZIO)
    setShowModal(true)
  }

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.includes(searchTerm)
  )

  // Produtos aprovados = visíveis no catálogo online (não pendentes)
  const produtosAprovados = produtos.filter(p => !p.pendenteAprovacao)

  const produtosVencidos = produtos.filter(p => p.validade && new Date(p.validade) < new Date())

  const produtosProximosVencer = produtos.filter(p => {
    if (!p.validade) return false
    const diasRestantes = Math.ceil((new Date(p.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 30 && diasRestantes > 0
  })

  return {
    produtos,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    editando,
    planoPago,
    formData,
    updateFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    abrirNovoProduto,
    produtosFiltrados,
    produtosVencidos,
    produtosProximosVencer,
    showCatalogo,
    setShowCatalogo,
    produtosAprovados,
  }
}
