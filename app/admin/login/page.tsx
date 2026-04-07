'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, Key, Smartphone, Check, AlertCircle, Fingerprint } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'login' | '2fa' | 'dispositivo'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo2fa, setCodigo2fa] = useState('')
  const [codigoDispositivo, setCodigoDispositivo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deviceInfo, setDeviceInfo] = useState({ nome: '', tipo: '', sistema: '' })

  useEffect(() => {
    // Capturar informações do dispositivo
    const userAgent = navigator.userAgent
    let sistema = 'Desconhecido'
    if (userAgent.includes('Windows')) sistema = 'Windows'
    else if (userAgent.includes('Android')) sistema = 'Android'
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) sistema = 'iOS'
    else if (userAgent.includes('Mac')) sistema = 'macOS'
    
    let tipo = 'desktop'
    if (userAgent.includes('Mobile')) tipo = 'mobile'
    else if (userAgent.includes('Tablet')) tipo = 'tablet'
    
    setDeviceInfo({
      nome: `${sistema} - ${tipo === 'mobile' ? 'Celular' : tipo === 'tablet' ? 'Tablet' : 'Notebook'}`,
      tipo,
      sistema
    })
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    
    // Simular autenticação
    setTimeout(() => {
      if (email === 'admin@valente.com' && password === 'admin123') {
        setStep('2fa')
      } else {
        setError('Email ou senha inválidos')
      }
      setLoading(false)
    }, 1000)
  }

  const handle2FA = async () => {
    setLoading(true)
    setError('')
    
    setTimeout(() => {
      if (codigo2fa === '123456') {
        setStep('dispositivo')
      } else {
        setError('Código 2FA inválido')
      }
      setLoading(false)
    }, 1000)
  }

  const handleDispositivo = async () => {
    setLoading(true)
    setError('')
    
    setTimeout(() => {
      if (codigoDispositivo === '123456') {
        // Salvar token de sessão
        document.cookie = "admin_token=authenticated; path=/; max-age=28800"
        document.cookie = "admin_session=true; path=/; max-age=28800"
        document.cookie = `device_id=${Date.now()}; path=/; max-age=2592000`
        
        const redirect = searchParams.get('redirect') || '/admin/dashboard'
        router.push(redirect)
      } else {
        setError('Código de pareamento inválido')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
          <Shield className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Admin Master</h1>
          <p className="text-blue-100">Valente Conecta</p>
        </div>
        
        <div className="p-6">
          {step === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@valente.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="********"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
              
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                <p>⚠️ Acesso restrito a dispositivos autorizados</p>
                <p className="mt-1">Dispositivo atual: {deviceInfo.nome} ({deviceInfo.sistema})</p>
              </div>
            </div>
          )}
          
          {step === '2fa' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Key className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold">Autenticação de Dois Fatores</h2>
                <p className="text-gray-500 text-sm">Digite o código do seu aplicativo autenticador</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Código 2FA</label>
                <input
                  type="text"
                  value={codigo2fa}
                  onChange={(e) => setCodigo2fa(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handle2FA()}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <button
                onClick={handle2FA}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          )}
          
          {step === 'dispositivo' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold">Autorizar Dispositivo</h2>
                <p className="text-gray-500 text-sm">Digite o código de pareamento</p>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">Dispositivo detectado:</p>
                <p className="font-semibold">{deviceInfo.nome}</p>
                <p className="text-xs text-gray-500">{deviceInfo.sistema} - {deviceInfo.tipo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Código de Pareamento</label>
                <input
                  type="text"
                  value={codigoDispositivo}
                  onChange={(e) => setCodigoDispositivo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDispositivo()}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <button
                onClick={handleDispositivo}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Autorizando...' : 'Autorizar Dispositivo'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}