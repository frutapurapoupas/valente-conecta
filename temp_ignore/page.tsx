'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Plus, Trash2, Clock, DollarSign, MapPin, Building2 } from 'lucide-react'
import ServicoAutocomplete from '@/components/ui/ServicoAutocomplete'
import { ServicoItem, categorias } from '@/lib/servicosCategorias'

interface ServicoCadastro {
  id: string
  nome: string
  descricao: string
  duracao: number
  preco: number
  categoria: string
  subcategoria: string
}

export default function CadastroServicoPage() {
  const [passo, setPasso] = useState(1)
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    endereco: '',
    cidade: '',
    bairro: ''
  })
  const [servicos, setServicos] = useState<ServicoCadastro[]>([])
  const [servicoAtual, setServicoAtual] = useState<Partial<ServicoCadastro>>({})
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('')
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState('')

  const handleAddServico = () => {
    if (!servicoAtual.nome) return
    
    const novoServico: ServicoCadastro = {
      id: Math.random().toString(36).substring(2),
      nome: servicoAtual.nome,
      descricao: servicoAtual.descricao || '',
      duracao: servicoAtual.duracao || 30,
      preco: servicoAtual.preco || 0,
      categoria: categoriaSelecionada,
      subcategoria: subcategoriaSelecionada
    }
    
    setServicos([...servicos, novoServico])
    setServicoAtual({})
    setCategoriaSelecionada('')
    setSubcategoriaSelecionada('')
  }

  const handleRemoveServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id))
  }

  const handleSalvar = () => {
    const dadosCompletos = {
      empresa: dadosEmpresa,
      servicos: servicos
    }
    console.log('Dados salvos:', dadosCompletos)
    localStorage.setItem('cadastro_servico', JSON.stringify(dadosCompletos))
    alert('Cadastro realizado com sucesso!')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Cadastrar Serviços</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Indicador de Passo */}
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-1 rounded-full transition-all ${passo >= 1 ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${passo >= 2 ? 'bg-yellow-500' : 'bg-zinc-800'}`} />
        </div>

        {/* Passo 1: Dados da Empresa */}
        {passo === 1 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-yellow-400" />
              Dados da Empresa/Profissional
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Nome da Empresa/Profissional *</label>
                <input type="text" value={dadosEmpresa.nome} onChange={e => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})} placeholder="Ex: Barbearia do João" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">CNPJ/CPF</label>
                  <input type="text" value={dadosEmpresa.cnpj} onChange={e => setDadosEmpresa({...dadosEmpresa, cnpj: e.target.value})} placeholder="00.000.000/0001-00" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Telefone *</label>
                  <input type="tel" value={dadosEmpresa.telefone} onChange={e => setDadosEmpresa({...dadosEmpresa, telefone: e.target.value})} placeholder="(75) 9 8888-7777" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Endereço *</label>
                <input type