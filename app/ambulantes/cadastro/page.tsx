'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, Save, User, Mail, Phone, MapPin, Briefcase, 
  Camera, Plus, Trash2, CheckCircle, X, Upload, Loader2, 
  Bell, Sparkles, Package, Store, Clock, DollarSign, CreditCard,
  Smartphone, Wallet, Truck, Home, Calendar, Eye, EyeOff
} from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string
  foto: string
  preco: number
  quantidade: number
  unidade: string
}

interface FormaPagamento {
  id: string
  nome: string
  icone: string
  aceita: boolean
  condicoes: string
}

export default function CadastroAmbulantePage() {
  const router = useRouter()
  const [passo, setPasso] = useState(1)
  const [carregando, setCarregando] = useState(false)
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [showModalItem, setShowModalItem] = useState(false)
  const [editandoItem, setEditandoItem] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [modoCamera, setModoCamera] = useState(false)
  const [erroCamera, setErroCamera] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Dados do ambulante
  const [dados, setDados] = useState({
    nome: '',
    nomeFantasia: '',
    cpf: '',
    email: '',
    telefone: '',
    localTrabalho: '',
    referenciaLocal: '',
    cidade: '',
    bairro: '',
    descricao: '',
    status: 'trabalhando' // trabalhando, folgando, ferias
  })

  // Produtos
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoAtual, setProdutoAtual] = useState<Partial<Produto>>({})

  // Formas de pagamento
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([
    { id: 'dinheiro', nome: 'Dinheiro', icone: '💵', aceita: true, condicoes: 'À vista' },
    { id: 'pix', nome: 'PIX', icone: '📱', aceita: true, condicoes: 'À vista' },
    { id: 'cartao_credito', nome: 'Cartão Crédito', icone: '💳', aceita: false, condicoes: '' },
    { id: 'cartao_debito', nome: 'Cartão Débito', icone: '💳', aceita: false, condicoes: '' },
    { id: 'fiado', nome: 'Fiado', icone: '📝', aceita: false, condicoes: '' }
  ])

  const unidades = [
    { id: 'unidade', label: 'Unidade', abreviacao: 'un', icone: '📦' },
    { id: 'kg', label: 'Quilo', abreviacao: 'kg', icone: '⚖️' },
    { id: 'litro', label: 'Litro', abreviacao: 'L', icone: '💧' },
    { id: 'porcao', label: 'Porção', abreviacao: 'por', icone: '🍽️' },
    { id: 'centena', label: 'Centena', abreviacao: 'cen', icone: '🔢' }
  ]

  const statusOptions = [
    { id: 'trabalhando', label: '🟢 Trabalhando', cor: 'text-emerald-400' },
    { id: 'folgando', label: '🟡 Folgando', cor: 'text-yellow-400' },
    { id: 'ferias', label: '🔴 Férias', cor: 'text-red-400' }
  ]

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem('ambulante_dados')
    if (saved) {
      const parsed = JSON.parse(saved)
      setDados(parsed.dados || dados)
      setProdutos(parsed.produtos || [])
      setFormasPagamento(parsed.formasPagamento || formasPagamento)
    }
  }, [])

  // Câmera
  const iniciarCamera = async () => {
    setErroCamera('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setModoCamera(true)
    } catch (error: any) {
      setErroCamera('📷 Não foi possível acessar a câmera. Use a galeria.')
    }
  }

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const fotoData = canvas.toDataURL('image/jpeg', 0.8)
        setFotoPreview(fotoData)
        setProdutoAtual({ ...produtoAtual, foto: fotoData })
        pararCamera()
      }
    }
  }

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setModoCamera(false)
  }

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
        setProdutoAtual({ ...produtoAtual, foto: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Produtos
  const salvarProduto = () => {
    if (!produtoAtual.nome || !produtoAtual.preco) {
      alert('Preencha nome e preço do produto')
      return
    }

    if (editandoItem) {
      setProdutos(produtos.map(p => 
        p.id === editandoItem 
          ? { ...p, ...produtoAtual, id: p.id } as Produto
          : p
      ))
    } else {
      const novoProduto: Produto = {
        id: Date.now().toString(),
        nome: produtoAtual.nome || '',
        descricao: produtoAtual.descricao || '',
        foto: produtoAtual.foto || '',
        preco: produtoAtual.preco || 0,
        quantidade: produtoAtual.quantidade || 0,
        unidade: produtoAtual.unidade || 'unidade'
      }
      setProdutos([...produtos, novoProduto])
    }
    
    setShowModalItem(false)
    setProdutoAtual({})
    setFotoPreview('')
    setEditandoItem(null)
    pararCamera()
  }

  const removerProduto = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id))
  }

  const editarProduto = (produto: Produto) => {
    setEditandoItem(produto.id)
    setProdutoAtual(produto)
    setFotoPreview(produto.foto)
    setShowModalItem(true)
  }

  const toggleFormaPagamento = (id: string) => {
    setFormasPagamento(prev => prev.map(f => 
      f.id === id ? { ...f, aceita: !f.aceita } : f
    ))
  }

  const atualizarCondicoes = (id: string, condicoes: string) => {
    setFormasPagamento(prev => prev.map(f => 
      f.id === id ? { ...f, condicoes } : f
    ))
  }

  const handleSubmit = async () => {
    setCarregando(true)
    
    const dadosCompletos = {
      dados,
      produtos,
      formasPagamento: formasPagamento.filter(f => f.aceita),
      dataCadastro: new Date().toISOString(),
      tipo: 'ambulante'
    }
    
    localStorage.setItem('ambulante_dados', JSON.stringify(dadosCompletos))
    localStorage.setItem('ambulante_cadastrado', 'true')
    
    // Salvar na API central
    try {
      await fetch('/api/catalogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ambulante',
          dados,
          itens: produtos,
          formasPagamento: formasPagamento.filter(f => f.aceita),
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Erro ao salvar na API:', error)
    }
    
    setCarregando(false)
    setShowConfirmacao(true)
    
    setTimeout(() => {
      setShowConfirmacao(false)
      router.push('/ambulantes')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/ambulantes" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Cadastro - Ambulante</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Progresso */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Passo {passo} de 4</span>
            <span className="text-sm text-yellow-400">{Math.round((passo / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${(passo / 4) * 100}%` }} />
          </div>
        </div>

        {/* Passo 1: Dados Pessoais */}
        {passo === 1 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-400" />
              Seus Dados
            </h2>
            
            <div className="space-y-4">
              <div><label className="block text-white text-sm font-bold mb-2">Nome completo *</label><input type="text" value={dados.nome} onChange={e => setDados({...dados, nome: e.target.value})} placeholder="Como você quer ser chamado" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">Nome Fantasia (opcional)</label><input type="text" value={dados.nomeFantasia} onChange={e => setDados({...dados, nomeFantasia: e.target.value})} placeholder="Ex: Barraca do Zé" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">CPF *</label><input type="text" value={dados.cpf} onChange={e => setDados({...dados, cpf: e.target.value})} placeholder="000.000.000-00" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">E-mail</label><input type="email" value={dados.email} onChange={e => setDados({...dados, email: e.target.value})} placeholder="contato@email.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">WhatsApp *</label><input type="tel" value={dados.telefone} onChange={e => setDados({...dados, telefone: e.target.value})} placeholder="(75) 9 8888-7777" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
            </div>
            
            <button onClick={() => setPasso(2)} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-lg">Próximo →</button>
          </div>
        )}

        {/* Passo 2: Local de Trabalho e Status */}
        {passo === 2 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              Local de Trabalho
            </h2>
            
            <div className="space-y-4">
              <div><label className="block text-white text-sm font-bold mb-2">Local onde trabalha *</label><input type="text" value={dados.localTrabalho} onChange={e => setDados({...dados, localTrabalho: e.target.value})} placeholder="Ex: Feira Livre - Box 15" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">Referência do local</label><input type="text" value={dados.referenciaLocal} onChange={e => setDados({...dados, referenciaLocal: e.target.value})} placeholder="Ex: Em frente ao Mercado Central" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-white text-sm font-bold mb-2">Cidade</label><input type="text" value={dados.cidade} onChange={e => setDados({...dados, cidade: e.target.value})} placeholder="Valente" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div><div><label className="block text-white text-sm font-bold mb-2">Bairro</label><input type="text" value={dados.bairro} onChange={e => setDados({...dados, bairro: e.target.value})} placeholder="Centro" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div></div>
              
              <div><label className="block text-white text-sm font-bold mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map(opt => (
                    <button key={opt.id} onClick={() => setDados({...dados, status: opt.id})} className={`p-3 rounded-xl border-2 transition-all ${dados.status === opt.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-800'}`}>
                      <span className={opt.cor}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div><label className="block text-white text-sm font-bold mb-2">Sobre você</label><textarea value={dados.descricao} onChange={e => setDados({...dados, descricao: e.target.value})} placeholder="Conte um pouco sobre seu trabalho..." rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none" /></div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setPasso(1)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold">← Voltar</button>
              <button onClick={() => setPasso(3)} className="flex-1 py-4 bg-yellow-500 text-black rounded-2xl font-black">Próximo →</button>
            </div>
          </div>
        )}

        {/* Passo 3: Produtos */}
        {passo === 3 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-400" />
              Seus Produtos
            </h2>
            
            <button onClick={() => { setEditandoItem(null); setProdutoAtual({}); setFotoPreview(''); setShowModalItem(true) }} className="w-full py-3 bg-zinc-800 border border-dashed border-yellow-500/50 rounded-xl text-yellow-400 font-bold flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Adicionar Produto
            </button>
            
            {produtos.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">Nenhum produto cadastrado.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {produtos.map(produto => (
                  <div key={produto.id} className="bg-zinc-800/50 rounded-xl p-4">
                    <div className="flex gap-3">
                      {produto.foto && <img src={produto.foto} alt={produto.nome} className="w-16 h-16 rounded-xl object-cover" />}
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{produto.nome}</h3>
                        <p className="text-xs text-zinc-400">{produto.descricao}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{unidades.find(u => u.id === produto.unidade)?.icone} {unidades.find(u => u.id === produto.unidade)?.abreviacao}</span>
                          <span className="text-yellow-400 font-bold">R$ {produto.preco.toFixed(2)}</span>
                          <span className="text-xs text-zinc-500">Estoque: {produto.quantidade}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editarProduto(produto)} className="p-1.5 bg-zinc-700 rounded-lg"><Package className="w-3 h-3" /></button>
                        <button onClick={() => removerProduto(produto.id)} className="p-1.5 bg-red-500/20 rounded-lg"><Trash2 className="w-3 h-3 text-red-400" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => setPasso(2)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold">← Voltar</button>
              <button onClick={() => setPasso(4)} className="flex-1 py-4 bg-yellow-500 text-black rounded-2xl font-black">Próximo →</button>
            </div>
          </div>
        )}

        {/* Passo 4: Formas de Pagamento */}
        {passo === 4 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Formas de Pagamento
            </h2>
            
            <div className="space-y-4">
              {formasPagamento.map(forma => (
                <div key={forma.id} className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{forma.icone}</span>
                      <span className="text-white font-bold">{forma.nome}</span>
                    </div>
                    <button onClick={() => toggleFormaPagamento(forma.id)} className={`px-3 py-1 rounded-full text-xs font-bold ${forma.aceita ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                      {forma.aceita ? '✅ Aceita' : '❌ Não aceita'}
                    </button>
                  </div>
                  {forma.aceita && (
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Condições</label>
                      <input type="text" value={forma.condicoes} onChange={e => atualizarCondicoes(forma.id, e.target.value)} placeholder="Ex: À vista, parcelado em até 3x" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setPasso(3)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold">← Voltar</button>
              <button onClick={handleSubmit} disabled={carregando} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2">
                {carregando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {carregando ? 'Salvando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Produto */}
      {showModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">{editandoItem ? 'Editar Produto' : 'Adicionar Produto'}</h3>
              <button onClick={() => { setShowModalItem(false); pararCamera() }} className="p-1 hover:bg-zinc-800 rounded-lg"><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {erroCamera && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm text-center">{erroCamera}</p></div>}
              
              <div><label className="block text-white text-sm font-bold mb-1">Nome do produto *</label><input type="text" value={produtoAtual.nome || ''} onChange={e => setProdutoAtual({...produtoAtual, nome: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              
              <div>
                <label className="block text-white text-sm font-bold mb-1">Foto do produto</label>
                <div className="flex flex-col gap-3">
                  {fotoPreview && (
                    <div className="relative"><img src={fotoPreview} className="w-full h-40 object-cover rounded-xl" /><button onClick={() => { setFotoPreview(''); setProdutoAtual({...produtoAtual, foto: ''}) }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"><X className="w-4 h-4 text-white" /></button></div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 py-3 bg-zinc-800 border border-dashed border-zinc-700 rounded-xl text-center cursor-pointer"><Upload className="w-5 h-5 mx-auto text-zinc-400" /><span className="text-xs text-zinc-500">Galeria</span><input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" /></label>
                    <button onClick={iniciarCamera} className="flex-1 py-3 bg-zinc-800 border border-dashed border-zinc-700 rounded-xl text-center"><Camera className="w-5 h-5 mx-auto text-zinc-400" /><span className="text-xs text-zinc-500">Tirar Foto</span></button>
                  </div>
                </div>
              </div>
              
              {modoCamera && (
                <div className="fixed inset-0 z-60 bg-black flex flex-col items-center justify-center p-4">
                  <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden">
                    <div className="p-2 bg-zinc-800 flex justify-between items-center"><span className="text-white text-sm">Tirar foto</span><button onClick={pararCamera} className="text-red-400 text-sm">Fechar</button></div>
                    <video ref={videoRef} autoPlay playsInline className="w-full" /><canvas ref={canvasRef} className="hidden" />
                    <div className="p-4 flex justify-center"><button onClick={tirarFoto} className="px-6 py-3 bg-yellow-500 rounded-full text-black font-bold">📸 Tirar Foto</button></div>
                  </div>
                </div>
              )}
              
              <div><label className="block text-white text-sm font-bold mb-1">Descrição</label><textarea value={produtoAtual.descricao || ''} onChange={e => setProdutoAtual({...produtoAtual, descricao: e.target.value})} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none" /></div>
              
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white text-sm font-bold mb-1">Preço (R$) *</label><input type="number" step="0.01" value={produtoAtual.preco || ''} onChange={e => setProdutoAtual({...produtoAtual, preco: parseFloat(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
                <div><label className="block text-white text-sm font-bold mb-1">Quantidade</label><input type="number" value={produtoAtual.quantidade || 0} onChange={e => setProdutoAtual({...produtoAtual, quantidade: parseInt(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              </div>
              
              <div><label className="block text-white text-sm font-bold mb-1">Unidade</label><div className="grid grid-cols-3 gap-2">{unidades.map(u => (<button key={u.id} onClick={() => setProdutoAtual({...produtoAtual, unidade: u.id})} className={`py-2 rounded-xl text-sm font-bold ${produtoAtual.unidade === u.id ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{u.icone} {u.abreviacao}</button>))}</div></div>
              
              <button onClick={salvarProduto} className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold">{editandoItem ? 'Atualizar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmacao && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 text-center max-w-sm">
            <CheckCircle className="w-16 h-16 text-white mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-white mb-2">Cadastro Realizado! 🎉</h2>
            <p className="text-white/80">Seu cadastro foi salvo com sucesso</p>
            <p className="text-white/70 text-sm mt-2">Seus produtos já estão no catálogo!</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce { animation: bounce 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}