'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Tipos para dados de saúde ────────────────────────────────────────────────────────
export interface HealthData {
  passos: number
  distancia_km: number
  calorias_ativas: number
  calorias_totais: number
  tempo_ativo_minutos: number
  tempo_sedentario_minutos: number
  sono_horas: number
  sono_qualidade: number
  freq_cardiaca_media: number
  freq_cardiaca_max: number
  frequencia_respiratoria: number
  estresse_level: number
  data_coleta: string
}

export interface HealthPermissionStatus {
  granted: boolean
  denied: boolean
  loading: boolean
  error?: string
}

// ─── Hook Principal para Integração com Sensores ───────────────────────────────────────
export function useHealthConnect() {
  const [permission, setPermission] = useState<HealthPermissionStatus>({
    granted: false,
    denied: false,
    loading: false
  })
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  // Verificar suporte a APIs de saúde
  useEffect(() => {
    const checkSupport = () => {
      const hasHealthConnect = typeof window !== 'undefined' && 'HealthConnect' in window
      const hasHealthKit = typeof window !== 'undefined' && 'webkit' in window && 'messageHandlers' in (window as any).webkit
      
      setIsSupported(hasHealthConnect || hasHealthKit)
    }

    checkSupport()
  }, [])

  // Solicitar permissões para Android Health Connect
  const solicitarPermissoesAndroid = useCallback(async () => {
    if (!('HealthConnect' in window)) {
      throw new Error('Health Connect não disponível neste dispositivo')
    }

    setPermission(prev => ({ ...prev, loading: true }))

    try {
      const HealthConnect = (window as any).HealthConnect
      
      // Tipos de dados que queremos acessar
      const dataTypes = [
        'STEPS',
        'DISTANCE', 
        'CALORIES_ACTIVE',
        'CALORIES_TOTAL',
        'ACTIVE_MINUTES',
        'SEDENTARY_MINUTES',
        'SLEEP_DURATION',
        'SLEEP_QUALITY',
        'HEART_RATE_MEAN',
        'HEART_RATE_MAX',
        'RESPIRATORY_RATE',
        'STRESS_LEVEL'
      ]

      // Solicitar permissões
      const granted = await HealthConnect.requestPermissions(dataTypes)
      
      if (granted) {
        setPermission({ granted: true, denied: false, loading: false })
        return true
      } else {
        setPermission({ granted: false, denied: true, loading: false })
        return false
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões Health Connect:', error)
      setPermission({ 
        granted: false, 
        denied: true, 
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      return false
    }
  }, [])

  // Solicitar permissões para iOS HealthKit
  const solicitarPermissoesIOS = useCallback(async () => {
    if (!('webkit' in window) || !('messageHandlers' in (window as any).webkit)) {
      throw new Error('HealthKit não disponível neste dispositivo')
    }

    setPermission(prev => ({ ...prev, loading: true }))

    try {
      // Enviar mensagem para o iOS app (se houver integração nativa)
      const message = {
        action: 'requestHealthKitPermissions',
        dataTypes: [
          'stepCount',
          'distanceWalkingRunning',
          'activeEnergyBurned',
          'basalEnergyBurned',
          'appleExerciseTime',
          'sedentaryTime',
          'timeInBed',
          'sleepAnalysis',
          'heartRate',
          'respiratoryRate'
        ]
      }

      // Simulação - em produção, isso se comunicaria com o app nativo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setPermission({ granted: true, denied: false, loading: false })
      return true
    } catch (error) {
      console.error('Erro ao solicitar permissões HealthKit:', error)
      setPermission({ 
        granted: false, 
        denied: true, 
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      return false
    }
  }, [])

  // Solicitar permissões (detecta plataforma automaticamente)
  const solicitarPermissoes = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Dispositivo não suportado')
    }

    const isAndroid = /Android/i.test(navigator.userAgent)
    
    if (isAndroid) {
      return await solicitarPermissoesAndroid()
    } else {
      return await solicitarPermissoesIOS()
    }
  }, [isSupported, solicitarPermissoesAndroid, solicitarPermissoesIOS])

  // Coletar dados do Android Health Connect
  const coletarDadosAndroid = useCallback(async (dataInicio: Date, dataFim: Date): Promise<HealthData> => {
    if (!('HealthConnect' in window)) {
      throw new Error('Health Connect não disponível')
    }

    const HealthConnect = (window as any).HealthConnect
    
    try {
      // Coletar dados para o período especificado
      const dadosBrutos = await HealthConnect.readData({
        dataTypes: [
          'STEPS',
          'DISTANCE', 
          'CALORIES_ACTIVE',
          'CALORIES_TOTAL',
          'ACTIVE_MINUTES',
          'SEDENTARY_MINUTES',
          'SLEEP_DURATION',
          'SLEEP_QUALITY',
          'HEART_RATE_MEAN',
          'HEART_RATE_MAX',
          'RESPIRATORY_RATE',
          'STRESS_LEVEL'
        ],
        startTime: dataInicio.toISOString(),
        endTime: dataFim.toISOString()
      })

      // Agregar dados diários
      const dadosAgregados: HealthData = {
        passos: dadosBrutos.STEPS?.reduce((sum: number, val: any) => sum + val.value, 0) || 0,
        distancia_km: (dadosBrutos.DISTANCE?.reduce((sum: number, val: any) => sum + val.value, 0) || 0) / 1000,
        calorias_ativas: dadosBrutos.CALORIES_ACTIVE?.reduce((sum: number, val: any) => sum + val.value, 0) || 0,
        calorias_totais: dadosBrutos.CALORIES_TOTAL?.reduce((sum: number, val: any) => sum + val.value, 0) || 0,
        tempo_ativo_minutos: dadosBrutos.ACTIVE_MINUTES?.reduce((sum: number, val: any) => sum + val.value, 0) || 0,
        tempo_sedentario_minutos: dadosBrutos.SEDENTARY_MINUTES?.reduce((sum: number, val: any) => sum + val.value, 0) || 0,
        sono_horas: (dadosBrutos.SLEEP_DURATION?.reduce((sum: number, val: any) => sum + val.value, 0) || 0) / 60,
        sono_qualidade: dadosBrutos.SLEEP_QUALITY?.reduce((sum: number, val: any) => sum + val.value, 0) / (dadosBrutos.SLEEP_QUALITY?.length || 1) || 3,
        freq_cardiaca_media: dadosBrutos.HEART_RATE_MEAN?.reduce((sum: number, val: any) => sum + val.value, 0) / (dadosBrutos.HEART_RATE_MEAN?.length || 1) || 70,
        freq_cardiaca_max: Math.max(...(dadosBrutos.HEART_RATE_MAX?.map((v: any) => v.value) || [0])),
        frequencia_respiratoria: dadosBrutos.RESPIRATORY_RATE?.reduce((sum: number, val: any) => sum + val.value, 0) / (dadosBrutos.RESPIRATORY_RATE?.length || 1) || 16,
        estresse_level: dadosBrutos.STRESS_LEVEL?.reduce((sum: number, val: any) => sum + val.value, 0) / (dadosBrutos.STRESS_LEVEL?.length || 1) || 3,
        data_coleta: new Date().toISOString()
      }

      return dadosAgregados
    } catch (error) {
      console.error('Erro ao coletar dados Health Connect:', error)
      throw error
    }
  }, [])

  // Coletar dados do iOS HealthKit
  const coletarDadosIOS = useCallback(async (dataInicio: Date, dataFim: Date): Promise<HealthData> => {
    // Simulação para iOS - em produção, se comunicaria com app nativo
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Dados mock para demonstração
    const dadosMock: HealthData = {
      passos: Math.floor(Math.random() * 5000) + 5000,
      distancia_km: Math.random() * 5 + 2,
      calorias_ativas: Math.floor(Math.random() * 200) + 200,
      calorias_totais: Math.floor(Math.random() * 300) + 1800,
      tempo_ativo_minutos: Math.floor(Math.random() * 60) + 30,
      tempo_sedentario_minutos: Math.floor(Math.random() * 300) + 300,
      sono_horas: Math.random() * 3 + 6,
      sono_qualidade: Math.floor(Math.random() * 3) + 2,
      freq_cardiaca_media: Math.floor(Math.random() * 20) + 60,
      freq_cardiaca_max: Math.floor(Math.random() * 30) + 120,
      frequencia_respiratoria: Math.floor(Math.random() * 4) + 14,
      estresse_level: Math.floor(Math.random() * 5) + 1,
      data_coleta: new Date().toISOString()
    }

    return dadosMock
  }, [])

  // Coletar dados (detecta plataforma automaticamente)
  const coletarDados = useCallback(async (dataInicio?: Date, dataFim?: Date): Promise<HealthData> => {
    if (!permission.granted) {
      throw new Error('Permissões não concedidas')
    }

    const inicio = dataInicio || new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
    const fim = dataFim || new Date()

    const isAndroid = /Android/i.test(navigator.userAgent)
    
    if (isAndroid) {
      return await coletarDadosAndroid(inicio, fim)
    } else {
      return await coletarDadosIOS(inicio, fim)
    }
  }, [permission.granted, coletarDadosAndroid, coletarDadosIOS])

  // Coletar dados de hoje automaticamente
  const coletarDadosHoje = useCallback(async () => {
    try {
      const hoje = new Date()
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
      
      const dados = await coletarDados(inicioHoje, hoje)
      setHealthData(dados)
      return dados
    } catch (error) {
      console.error('Erro ao coletar dados de hoje:', error)
      throw error
    }
  }, [coletarDados])

  // Verificar status das permissões
  const verificarPermissoes = useCallback(async () => {
    if (!isSupported) {
      return { granted: false, denied: false, loading: false }
    }

    try {
      const isAndroid = /Android/i.test(navigator.userAgent)
      
      if (isAndroid && 'HealthConnect' in window) {
        const HealthConnect = (window as any).HealthConnect
        const status = await HealthConnect.getPermissionStatus()
        
        setPermission({
          granted: status === 'granted',
          denied: status === 'denied',
          loading: false
        })
        
        return { granted: status === 'granted', denied: status === 'denied', loading: false }
      } else {
        // iOS - verificar status via app nativo (simulado)
        setPermission({ granted: false, denied: false, loading: false })
        return { granted: false, denied: false, loading: false }
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error)
      setPermission({ granted: false, denied: false, loading: false })
      return { granted: false, denied: false, loading: false }
    }
  }, [isSupported])

  // Verificar permissões ao montar o componente
  useEffect(() => {
    if (isSupported) {
      verificarPermissoes()
    }
  }, [isSupported, verificarPermissoes])

  return {
    // Estado
    permission,
    healthData,
    isSupported,
    loading: permission.loading,

    // Ações
    solicitarPermissoes,
    coletarDados,
    coletarDadosHoje,
    verificarPermissoes
  }
}

// ─── Funções utilitárias para processamento de dados ───────────────────────────────────
export function calcularCaloriasQueimadas(dados: HealthData): number {
  return dados.calorias_ativas + dados.calorias_totais
}

export function calcularNivelAtividade(dados: HealthData): 'baixo' | 'moderado' | 'alto' {
  const minutosAtivos = dados.tempo_ativo_minutos
  
  if (minutosAtivos < 30) return 'baixo'
  if (minutosAtivos < 60) return 'moderado'
  return 'alto'
}

export function calcularQualidadeSono(dados: HealthData): 'ruim' | 'regular' | 'bom' | 'otimo' {
  const horas = dados.sono_horas
  const qualidade = dados.sono_qualidade
  
  if (horas < 6 || qualidade < 2) return 'ruim'
  if (horas < 7 || qualidade < 3) return 'regular'
  if (horas < 8 || qualidade < 4) return 'bom'
  return 'otimo'
}

export function calcularNivelEstresse(dados: HealthData): 'baixo' | 'moderado' | 'alto' | 'critico' {
  const nivel = dados.estresse_level
  
  if (nivel <= 2) return 'baixo'
  if (nivel <= 3) return 'moderado'
  if (nivel <= 4) return 'alto'
  return 'critico'
}
