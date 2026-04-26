'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Car, User, Camera, MapPin, Check, X, AlertTriangle } from 'lucide-react'

interface Veiculo {
  tipo: string
  marca: string
  cor: string
  placa: string
  foto: string
}

interface MotoristaCadastro {
  nomeCompleto: string
  rg: string
  cpf: string
  fotoRosto: string
  endereco: string
  localizador: string
  pix: string
  fotoCnh: string
  termoAceito: boolean
  veiculo: Veiculo
  valorKm: number
}

export default function MotoristaTransportePage() {
  const [step, setStep] = useState(1)
  const [cadastro, setCadastro] = useState<MotoristaCadastro>({
    nomeCompleto: '',
    rg: '',
    cpf: '',
    fotoRosto: '',
    endereco: '',
    localizador: '',
    pix: '',
    fotoCnh: '',
    termoAceito: false,
    veiculo: {
      tipo: '',
      marca: '',
      cor: '',
      placa: '',
      foto: ''
    },
    valorKm: 0
  })
  const [capturandoLocalizacao, setCapturandoLocalizacao] = useState(false)
  const [showCameraRosto, setShowCameraRosto] = useState(false)
  const [showCameraCnh, setShowCameraCnh] = useState(false)
  const [showCameraVeiculo, setShowCameraVeiculo] = useState(false)
  const [videoRefRosto, setVideoRefRosto] = useState<HTMLVideoElement | null>(null)
  const [videoRefCnh, setVideoRefCnh] = useState<HTMLVideoElement | null>(null)
  const [videoRefVeiculo, setVideoRefVeiculo] = useState<HTMLVideoElement | null>(null)

  const capturarLocalizacao = () => {
    setCapturandoLocalizacao(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCadastro(prev => ({
            ...prev,
            localizador: `${latitude},${longitude}`
          }))
          setCapturandoLocalizacao(false)
        },
        (error) => {
          alert('Erro ao capturar localização. Tente novamente.')
          setCapturandoLocalizacao(false)
        }
      )
    } else {
      alert('Geolocalização não suportada pelo navegador.')
      setCapturandoLocalizacao(false)
    }
  }

  const abrirCamera = async (tipo: 'rosto' | 'cnh' | 'veiculo') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: tipo === 'veiculo' ? 'environment' : 'user' } 
      })
      
      if (tipo === 'rosto') {
        setShowCameraRosto(true)
        if (videoRefRosto) {
          videoRefRosto.srcObject = stream
          videoRefRosto.play()
        }
      } else if (tipo === 'cnh') {
        setShowCameraCnh(true)
        if (videoRefCnh) {
          videoRefCnh.srcObject = stream
          videoRefCnh.play()
        }
      } else if (tipo === 'veiculo') {
        setShowCameraVeiculo(true)
        if (videoRefVeiculo) {
          videoRefVeiculo.srcObject = stream
          videoRefVeiculo.play()
        }
      }
    } catch (error) {
      alert('Erro ao acessar câmera. Verifique as permissões.')
      console.error(error)
    }
  }

  const tirarFoto = (tipo: 'rosto' | 'cnh' | 'veiculo') => {
    const video = tipo === 'rosto' ? videoRefRosto : tipo === 'cnh' ? videoRefCnh : videoRefVeiculo
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const fotoData = canvas.toDataURL('image/jpeg')
      
      if (tipo === 'rosto') {
        setCadastro(prev => ({ ...prev, fotoRosto: fotoData }))
        setShowCameraRosto(false)
      } else if (tipo === 'cnh') {
        setCadastro(prev => ({ ...prev, fotoCnh: fotoData }))
        setShowCameraCnh(false)
      } else if (tipo === 'veiculo') {
        setCadastro(prev => ({ ...prev, veiculo: { ...prev.veiculo, foto: fotoData } }))
        setShowCameraVeiculo(false)
      }

      // Parar stream
      const stream = video.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const fecharCamera = (tipo: 'rosto' | 'cnh' | 'veiculo') => {
    const video = tipo === 'rosto' ? videoRefRosto : tipo === 'cnh' ? videoRefCnh : videoRefVeiculo
    if (video) {
      const stream = video.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
    
    if (tipo === 'rosto') setShowCameraRosto(false)
    else if (tipo === 'cnh') setShowCameraCnh(false)
    else if (tipo === 'veiculo') setShowCameraVeiculo(false)
  }

  const salvarCadastro = () => {
    // Validar campos
    if (!cadastro.nomeCompleto || !cadastro.rg || !cadastro.cpf || !cadastro.pix || 
        !cadastro.fotoCnh || !cadastro.termoAceito ||
        !cadastro.veiculo.tipo || !cadastro.veiculo.marca || !cadastro.veiculo.cor || !cadastro.veiculo.placa ||
        cadastro.valorKm <= 0) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    // Salvar no localStorage
    const motoristasSalvos = localStorage.getItem('motoristas_transportes')
    const motoristas = motoristasSalvos ? JSON.parse(motoristasSalvos) : []
    
    const novoMotorista = {
      id: Date.now().toString(),
      ...cadastro,
      aprovado: false, // Requer aprovação do admin
      dataCadastro: new Date().toISOString(),
      pendencias: []
    }
    
    motoristas.push(novoMotorista)
    localStorage.setItem('motoristas_transportes', JSON.stringify(motoristas))
    
    alert('Cadastro enviado para aprovação! Você será notificado quando for aprovado.')
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/transportes-delivery" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Cadastro de Motorista</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Progresso */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-emerald-600' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Dados Pessoais */}
        {step === 1 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Dados Pessoais
            </h3>
            
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome Completo *</label>
              <input
                value={cadastro.nomeCompleto}
                onChange={e => setCadastro(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">RG *</label>
                <input
                  value={cadastro.rg}
                  onChange={e => setCadastro(prev => ({ ...prev, rg: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">CPF *</label>
                <input
                  value={cadastro.cpf}
                  onChange={e => setCadastro(prev => ({ ...prev, cpf: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Endereço Residencial *</label>
              <input
                value={cadastro.endereco}
                onChange={e => setCadastro(prev => ({ ...prev, endereco: e.target.value }))}
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Localizador *</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={cadastro.localizador}
                  readOnly
                  placeholder="Coordenadas GPS"
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none"
                />
                <button
                  onClick={capturarLocalizacao}
                  disabled={capturandoLocalizacao}
                  className="px-4 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  {capturandoLocalizacao ? 'Capturando...' : 'Capturar'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Chave PIX *</label>
              <input
                value={cadastro.pix}
                onChange={e => setCadastro(prev => ({ ...prev, pix: e.target.value }))}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Foto do Rosto *</label>
              <div className="mt-1 flex items-center gap-3">
                {cadastro.fotoRosto ? (
                  <div className="relative">
                    <img src={cadastro.fotoRosto} alt="Foto do rosto" className="w-20 h-20 rounded-xl object-cover" />
                    <button
                      onClick={() => abrirCamera('rosto')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <User className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
                <button
                  onClick={() => abrirCamera('rosto')}
                  className="px-4 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {cadastro.fotoRosto ? 'Refazer' : 'Tirar Foto'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Foto da CNH *</label>
              <div className="mt-1 flex items-center gap-3">
                {cadastro.fotoCnh ? (
                  <div className="relative">
                    <img src={cadastro.fotoCnh} alt="Foto da CNH" className="w-20 h-20 rounded-xl object-cover" />
                    <button
                      onClick={() => abrirCamera('cnh')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Camera className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
                <button
                  onClick={() => abrirCamera('cnh')}
                  className="px-4 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {cadastro.fotoCnh ? 'Refazer' : 'Tirar Foto'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all"
            >
              Próximo
            </button>
          </div>
        )}

        {/* Step 2: Dados do Veículo */}
        {step === 2 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-400" />
              Dados do Veículo
            </h3>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Tipo *</label>
              <select
                value={cadastro.veiculo.tipo}
                onChange={e => setCadastro(prev => ({ ...prev, veiculo: { ...prev.veiculo, tipo: e.target.value } }))}
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Selecione</option>
                <option value="automovel">Automóvel</option>
                <option value="moto">Moto</option>
                <option value="caminhao">Caminhão</option>
                <option value="utilitario">Utilitário</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Marca *</label>
              <input
                value={cadastro.veiculo.marca}
                onChange={e => setCadastro(prev => ({ ...prev, veiculo: { ...prev.veiculo, marca: e.target.value } }))}
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Cor *</label>
              <input
                value={cadastro.veiculo.cor}
                onChange={e => setCadastro(prev => ({ ...prev, veiculo: { ...prev.veiculo, cor: e.target.value } }))}
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Placa *</label>
              <input
                value={cadastro.veiculo.placa}
                onChange={e => setCadastro(prev => ({ ...prev, veiculo: { ...prev.veiculo, placa: e.target.value.toUpperCase() } }))}
                placeholder="ABC-1234"
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Foto do Veículo *</label>
              <div className="mt-1 flex items-center gap-3">
                {cadastro.veiculo.foto ? (
                  <div className="relative">
                    <img src={cadastro.veiculo.foto} alt="Foto do veículo" className="w-20 h-20 rounded-xl object-cover" />
                    <button
                      onClick={() => abrirCamera('veiculo')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Car className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
                <button
                  onClick={() => abrirCamera('veiculo')}
                  className="px-4 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {cadastro.veiculo.foto ? 'Refazer' : 'Tirar Foto'}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-white hover:bg-zinc-700 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Valor e Termos */}
        {step === 3 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white">Configurações e Termos</h3>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Valor por km (R$) *</label>
              <input
                type="number"
                step="0.10"
                value={cadastro.valorKm || ''}
                onChange={e => setCadastro(prev => ({ ...prev, valorKm: parseFloat(e.target.value) || 0 }))}
                placeholder="Ex: 2.50"
                className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-400 text-sm">Termo de Responsabilidade</h4>
                  <p className="text-xs text-zinc-400 mt-2">
                    Ao me cadastrar como motorista, declaro que estou ciente e concordo que a plataforma Valente Conecta não se responsabiliza por quaisquer danos, acidentes ou prejuízos ocorridos durante os trajetos. A responsabilidade total é do motorista e do passageiro. A plataforma atua apenas como intermediador.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={cadastro.termoAceito}
                onChange={e => setCadastro(prev => ({ ...prev, termoAceito: e.target.checked }))}
                className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
              />
              <label className="text-sm text-zinc-400">
                Li e concordo com o termo de responsabilidade acima *
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-white hover:bg-zinc-700 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={salvarCadastro}
                className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all"
              >
                Enviar Cadastro
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Sucesso */}
        {step === 4 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-white">Cadastro Enviado!</h3>
            <p className="text-zinc-400">
              Seu cadastro foi enviado para aprovação. Você será notificado quando for aprovado para começar a receber corridas.
            </p>
            <Link
              href="/transportes-delivery"
              className="inline-block px-8 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all"
            >
              Voltar
            </Link>
          </div>
        )}
      </main>

      {/* Modal de Câmera - Rosto */}
      {showCameraRosto && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-zinc-900">
            <button
              onClick={() => fecharCamera('rosto')}
              className="p-2 bg-zinc-800 rounded-xl"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-bold">Foto do Rosto</h2>
            <button
              onClick={() => tirarFoto('rosto')}
              className="px-4 py-2 bg-emerald-600 rounded-xl font-bold text-white"
            >
              Capturar
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <video
              ref={setVideoRefRosto}
              autoPlay
              playsInline
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}

      {/* Modal de Câmera - CNH */}
      {showCameraCnh && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-zinc-900">
            <button
              onClick={() => fecharCamera('cnh')}
              className="p-2 bg-zinc-800 rounded-xl"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-bold">Foto da CNH</h2>
            <button
              onClick={() => tirarFoto('cnh')}
              className="px-4 py-2 bg-emerald-600 rounded-xl font-bold text-white"
            >
              Capturar
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <video
              ref={setVideoRefCnh}
              autoPlay
              playsInline
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}

      {/* Modal de Câmera - Veículo */}
      {showCameraVeiculo && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-zinc-900">
            <button
              onClick={() => fecharCamera('veiculo')}
              className="p-2 bg-zinc-800 rounded-xl"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-bold">Foto do Veículo</h2>
            <button
              onClick={() => tirarFoto('veiculo')}
              className="px-4 py-2 bg-emerald-600 rounded-xl font-bold text-white"
            >
              Capturar
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black">
            <video
              ref={setVideoRefVeiculo}
              autoPlay
              playsInline
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
