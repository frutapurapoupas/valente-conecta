'use client'

import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, Save, User, Mail, Phone, MapPin, Briefcase, 
  Building2, FileText, Camera, Plus, Trash2, CheckCircle,
  ChevronRight, X, Upload, Loader2, Bell, Sparkles, Package
} from 'lucide-react'

interface ProdutoServico {
  id: string
  nome: string
  descricao: string
  foto: string
  unidade: string
  preco: number
}

function CadastroProfissionalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'profissional'
  
  const [passo, setPasso] = useState(1)
  const [dados, setDados] = useState({
    nome: '',
    nomeFantasia: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    bairro: '',
    responsavel: '',
    descricao: ''
  })
  const [itens, setItens] = useState<ProdutoServico[]>([])
  const [itemAtual, setItemAtual] = useState<Partial<ProdutoServico>>({})
  const [showModalItem, setShowModalItem] = useState(false)
  const [editandoItem, setEditandoItem] = useState<string | null>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [modoCamera, setModoCamera] = useState(false)
  const [erroCamera, setErroCamera] = useState('')
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isEmpresa = tipo === 'empresa'

  const unidades = [
    { id: 'unidade', label: 'Por unidade', abreviacao: 'un', icone: '📦' },
    { id: 'metro', label: 'Por metro', abreviacao: 'm', icone: '📏' },
    { id: 'metro_quadrado', label: 'Metro quadrado', abreviacao: 'm²', icone: '📐' },
    { id: 'diaria', label: 'Diária', abreviacao: 'dia', icone: '📅' },
    { id: 'empreita', label: 'Empreita', abreviacao: 'serv', icone: '📝' },
    { id: 'hora', label: 'Por hora', abreviacao: 'h', icone: '⏰' },
    { id: 'kg', label: 'Por kg', abreviacao: 'kg', icone: '⚖️' },
    { id: 'litro', label: 'Por litro', abreviacao: 'L', icone: '💧' },
    { id: 'servico', label: 'Serviço', abreviacao: 'serv', icone: '🛠️' }
  ]

  useEffect(() => {
    const savedDados = localStorage.getItem(`profissional_dados_${tipo}`)
    if (savedDados) {
      const parsed = JSON.parse(savedDados)
      setDados(parsed.dados || dados)
      setItens(parsed.itens || [])
    }
  }, [tipo])

  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setModoCamera(true)
    } catch (error) {
      setErroCamera('📷 Não foi possível acessar a câmera.')
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
        setItemAtual({ ...itemAtual, foto: fotoData })
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
        setItemAtual({ ...itemAtual, foto: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const salvarItem = () => {
    if (!itemAtual.nome || !itemAtual.preco) {
      alert('Preencha nome e preço do item')
      return
    }

    if (editandoItem) {
      setItens(itens.map(item => 
        item.id === editandoItem 
          ? { ...item, ...itemAtual, id: item.id } as ProdutoServico
          : item
      ))
    } else {
      const novoItem: ProdutoServico = {
        id: Date.now().toString(),
        nome: itemAtual.nome || '',
        descricao: itemAtual.descricao || '',
        foto: itemAtual.foto || '',
        unidade: itemAtual.unidade || 'servico',
        preco: itemAtual.preco || 0
      }
      setItens([...itens, novoItem])
    }
    
    setShowModalItem(false)
    setItemAtual({})
    setFotoPreview('')
    setEditandoItem(null)
    pararCamera()
  }

  const removerItem = (id: string) => {
    setItens(itens.filter(item => item.id !== id))
  }

  const editarItem = (item: ProdutoServico) => {
    setEditandoItem(item.id)
    setItemAtual(item)
    setFotoPreview(item.foto)
    setShowModalItem(true)
  }

  const handleSubmit = async () => {
    setCarregando(true)
    
    const dadosCompletos = {
      tipo,
      dados,
      itens,
      dataCadastro: new Date().toISOString()
    }
    
    localStorage.setItem(`profissional_dados_${tipo}`, JSON.stringify(dadosCompletos))
    localStorage.setItem('profissional_tipo', tipo)
    localStorage.setItem('profissional_cadastrado', 'true')
    
    setPedidoConfirmado({
      nome: isEmpresa ? dados.nomeFantasia : dados.nome,
      tipo: isEmpresa ? 'empresa' : 'profissional',
      itens: itens.map(item => ({ nome: item.nome, preco: item.preco })),
      total: itens.reduce((sum, item) => sum + item.preco, 0)
    })
    
    setCarregando(false)
    setShowConfirmacao(true)
    
    setTimeout(() => {
      setShowConfirmacao(false)
      router.push(`/profissional/catalogo/dashboard?tipo=${tipo}`)
    }, 3000)
  }

  const nomeExibicao = isEmpresa ? (dados.nomeFantasia || dados.nome) : dados.nome

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/profissional/catalogo" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">
            {isEmpresa ? 'Cadastro - Escritório/Empresa' : 'Cadastro - Profissional Liberal'}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Passo {passo} de 3</span>
            <span className="text-sm text-yellow-400">{Math.round((passo / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${(passo / 3) * 100}%` }} />
          </div>
        </div>

        {(passo === 2 || passo === 3) && (
          <div className="flex gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sticky top-20 z-30">
            <button onClick={() => setPasso(passo - 1)} className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-bold">← Voltar</button>
            {passo === 2 ? (
              <button onClick={() => setPasso(passo + 1)} className="flex-1 py-2 bg-yellow-500 text-black rounded-xl font-bold">Revisar →</button>
            ) : (
              <button onClick={handleSubmit} disabled={carregando} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {carregando ? 'Salvando...' : 'Finalizar'}
              </button>
            )}
          </div>
        )}

        {passo === 1 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2">
              {isEmpresa ? <Building2 className="w-5 h-5 text-yellow-400" /> : <Briefcase className="w-5 h-5 text-yellow-400" />}
              {isEmpresa ? 'Dados da Empresa' : 'Dados do Profissional'}
            </h2>
            <div className="space-y-4">
              {isEmpresa ? (
                <>
                  <div><label className="block text-white text-sm font-bold mb-2">Nome Fantasia *</label><input type="text" value={dados.nomeFantasia} onChange={e => setDados({...dados, nomeFantasia: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
                  <div><label className="block text-white text-sm font-bold mb-2">Razão Social</label><input type="text" value={dados.nome} onChange={e => setDados({...dados, nome: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
                  <div><label className="block text-white text-sm font-bold mb-2">CNPJ *</label><input type="text" value={dados.cpfCnpj} onChange={e => setDados({...dados, cpfCnpj: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
                </>
              ) : (
                <>
                  <div><label className="block text-white text-sm font-bold mb-2">Nome completo *</label><input type="text" value={dados.nome} onChange={e => setDados({...dados, nome: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
                  <div><label className="block text-white text-sm font-bold mb-2">CPF *</label><input type="text" value={dados.cpfCnpj} onChange={e => setDados({...dados, cpfCnpj: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
                </>
              )}
              <div><label className="block text-white text-sm font-bold mb-2">E-mail *</label><input type="email" value={dados.email} onChange={e => setDados({...dados, email: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">Telefone/WhatsApp *</label><input type="tel" value={dados.telefone} onChange={e => setDados({...dados, telefone: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">Endereço *</label><input type="text" value={dados.endereco} onChange={e => setDados({...dados, endereco: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-white text-sm font-bold mb-2">Cidade</label><input type="text" value={dados.cidade} onChange={e => setDados({...dados, cidade: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div><div><label className="block text-white text-sm font-bold mb-2">Bairro</label><input type="text" value={dados.bairro} onChange={e => setDados({...dados, bairro: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div></div>
              {isEmpresa && <div><label className="block text-white text-sm font-bold mb-2">Nome do Responsável</label><input type="text" value={dados.responsavel} onChange={e => setDados({...dados, responsavel: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>}
              <div><label className="block text-white text-sm font-bold mb-2">Descrição / Sobre</label><textarea value={dados.descricao} onChange={e => setDados({...dados, descricao: e.target.value})} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none" /></div>
            </div>
            <button onClick={() => setPasso(2)} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black">Próximo →</button>
          </div>
        )}

        {passo === 2 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2"><FileText className="w-5 h-5 text-yellow-400" />Itens do Catálogo</h2>
            <button onClick={() => { setEditandoItem(null); setItemAtual({}); setFotoPreview(''); setShowModalItem(true) }} className="w-full py-3 bg-zinc-800 border border-dashed border-yellow-500/50 rounded-xl text-yellow-400 font-bold">+ Adicionar Item</button>
            {itens.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">Nenhum item cadastrado.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {itens.map(item => (
                  <div key={item.id} className="bg-zinc-800/50 rounded-xl p-4">
                    <div className="flex gap-3">
                      {item.foto && <img src={item.foto} className="w-16 h-16 rounded-xl object-cover" />}
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{item.nome}</h3>
                        <p className="text-xs text-zinc-400">{item.descricao}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{unidades.find(u => u.id === item.unidade)?.icone} {unidades.find(u => u.id === item.unidade)?.abreviacao}</span>
                          <span className="text-yellow-400 font-bold">R$ {item.preco.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editarItem(item)} className="p-1.5 bg-zinc-700 rounded-lg"><FileText className="w-3 h-3" /></button>
                        <button onClick={() => removerItem(item.id)} className="p-1.5 bg-red-500/20 rounded-lg"><Trash2 className="w-3 h-3 text-red-400" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {passo === 3 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white text-xl flex items-center gap-2"><CheckCircle className="w-5 h-5 text-yellow-400" />Revise seus dados</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-yellow-400 font-bold text-sm mb-2">{isEmpresa ? 'Dados da Empresa' : 'Dados do Profissional'}</p>
                <p className="text-white"><span className="text-zinc-500">{isEmpresa ? 'Nome Fantasia:' : 'Nome:'}</span> {nomeExibicao}</p>
                <p className="text-white"><span className="text-zinc-500">{isEmpresa ? 'CNPJ:' : 'CPF:'}</span> {dados.cpfCnpj || 'Não informado'}</p>
                <p className="text-white"><span className="text-zinc-500">E-mail:</span> {dados.email}</p>
                <p className="text-white"><span className="text-zinc-500">Telefone:</span> {dados.telefone}</p>
                <p className="text-white"><span className="text-zinc-500">Endereço:</span> {dados.endereco}, {dados.cidade} - {dados.bairro}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-yellow-400 font-bold text-sm mb-2">Itens Cadastrados</p>
                {itens.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-zinc-700 last:border-0">
                    <span className="text-white text-sm">{item.nome}</span>
                    <span className="text-yellow-400 font-bold">R$ {item.preco.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-2 pt-2 border-t border-zinc-700">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-yellow-400 font-bold">R$ {itens.reduce((sum, item) => sum + item.preco, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Adicionar Item */}
      {showModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">{editandoItem ? 'Editar Item' : 'Adicionar Item'}</h3>
              <button onClick={() => { setShowModalItem(false); pararCamera() }} className="p-1 hover:bg-zinc-800 rounded-lg"><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {erroCamera && <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">{erroCamera}</p></div>}
              <div><label className="block text-white text-sm font-bold mb-1">Nome do Item *</label><input type="text" value={itemAtual.nome || ''} onChange={e => setItemAtual({...itemAtual, nome: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div>
                <label className="block text-white text-sm font-bold mb-1">Foto</label>
                <div className="flex flex-col gap-3">
                  {fotoPreview && <div className="relative"><img src={fotoPreview} className="w-full h-40 object-cover rounded-xl" /><button onClick={() => { setFotoPreview(''); setItemAtual({...itemAtual, foto: ''}) }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"><X className="w-4 h-4 text-white" /></button></div>}
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
              <div><label className="block text-white text-sm font-bold mb-1">Descrição</label><textarea value={itemAtual.descricao || ''} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none" /></div>
              <div><label className="block text-white text-sm font-bold mb-1">Unidade</label><div className="grid grid-cols-4 gap-2">{unidades.map(u => (<button key={u.id} onClick={() => setItemAtual({...itemAtual, unidade: u.id})} className={`py-2 rounded-xl text-sm font-bold ${itemAtual.unidade === u.id ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{u.icone} {u.abreviacao}</button>))}</div></div>
              <div><label className="block text-white text-sm font-bold mb-1">Preço (R$) *</label><input type="number" step="0.01" value={itemAtual.preco || ''} onChange={e => setItemAtual({...itemAtual, preco: parseFloat(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <button onClick={salvarItem} className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold">{editandoItem ? 'Atualizar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmacao && pedidoConfirmado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="relative p-6 text-center">
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Cadastro Realizado! 🎉</h2>
                <p className="text-white/80 text-sm">Seu catálogo foi salvo com sucesso</p>
              </div>
            </div>
            <div className="bg-white/10 p-5 space-y-3">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-white/80 text-xs">Perfil cadastrado</p>
                <p className="text-white font-bold text-lg">{pedidoConfirmado.nome}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/80 text-xs mb-2">Itens cadastrados:</p>
                {pedidoConfirmado.itens.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-white text-sm py-1">
                    <span>• {item.nome}</span>
                    <span className="text-yellow-300">R$ {item.preco.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-2 pt-2 border-t border-white/20">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-yellow-300 font-bold">R$ {pedidoConfirmado.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
                <Bell className="w-3 h-3" />
                <span>Seus produtos já estão no catálogo!</span>
              </div>
            </div>
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

export default function CadastroProfissionalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center">Carregando...</div>}>
      <CadastroProfissionalContent />
    </Suspense>
  )
}