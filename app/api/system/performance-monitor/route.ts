import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetrics {
  timestamp: number
  activeUsers: number
  voiceSearchRequests: number
  voiceSearchErrors: number
  averageResponseTime: number
  memoryUsage: number
  cacheHitRate: number
  rateLimitViolations: number
}

// Cache global para métricas
const metricsHistory: PerformanceMetrics[] = []
const MAX_HISTORY_SIZE = 1000

// Contadores globais
let voiceSearchRequests = 0
let voiceSearchErrors = 0
let totalResponseTime = 0
let rateLimitViolations = 0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'status'
  const timeframe = searchParams.get('timeframe') || '1h'

  try {
    switch (action) {
      case 'status':
        return NextResponse.json({
          current: getCurrentMetrics(),
          history: getMetricsByTimeframe(timeframe),
          alerts: checkPerformanceAlerts()
        })

      case 'increment-voice-request':
        const responseTime = parseFloat(searchParams.get('responseTime') || '0')
        voiceSearchRequests++
        totalResponseTime += responseTime
        
        const metrics = getCurrentMetrics()
        addToHistory(metrics)
        
        return NextResponse.json({
          success: true,
          totalRequests: voiceSearchRequests,
          averageResponseTime: metrics.averageResponseTime
        })

      case 'increment-voice-error':
        voiceSearchErrors++
        return NextResponse.json({
          success: true,
          totalErrors: voiceSearchErrors,
          errorRate: (voiceSearchErrors / Math.max(voiceSearchRequests, 1)) * 100
        })

      case 'increment-rate-limit':
        rateLimitViolations++
        return NextResponse.json({
          success: true,
          totalViolations: rateLimitViolations
        })

      case 'health-check':
        const health = performHealthCheck()
        return NextResponse.json(health)

      default:
        return NextResponse.json({
          error: 'Ação inválida',
          validActions: ['status', 'increment-voice-request', 'increment-voice-error', 'increment-rate-limit', 'health-check']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro no Performance Monitor:', error)
    return NextResponse.json({
      error: 'Erro interno no servidor',
      message: 'Tente novamente mais tarde.'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metrics } = body

    if (metrics) {
      // Atualizar métricas em lote
      if (metrics.voiceSearchRequests) {
        voiceSearchRequests += metrics.voiceSearchRequests
      }
      if (metrics.voiceSearchErrors) {
        voiceSearchErrors += metrics.voiceSearchErrors
      }
      if (metrics.totalResponseTime) {
        totalResponseTime += metrics.totalResponseTime
      }
      if (metrics.rateLimitViolations) {
        rateLimitViolations += metrics.rateLimitViolations
      }

      const currentMetrics = getCurrentMetrics()
      addToHistory(currentMetrics)

      return NextResponse.json({
        success: true,
        updatedMetrics: currentMetrics
      })
    }

    return NextResponse.json({
      error: 'Dados de métricas não fornecidos'
    }, { status: 400 })

  } catch (error) {
    console.error('Erro no POST Performance Monitor:', error)
    return NextResponse.json({
      error: 'Erro ao processar métricas'
    }, { status: 400 })
  }
}

function getCurrentMetrics(): PerformanceMetrics {
  const memoryUsage = getMemoryUsage()
  const cacheHitRate = getCacheHitRate()
  
  return {
    timestamp: Date.now(),
    activeUsers: getActiveUsers(),
    voiceSearchRequests,
    voiceSearchErrors,
    averageResponseTime: voiceSearchRequests > 0 ? totalResponseTime / voiceSearchRequests : 0,
    memoryUsage,
    cacheHitRate,
    rateLimitViolations
  }
}

function addToHistory(metrics: PerformanceMetrics) {
  metricsHistory.push(metrics)
  
  // Manter apenas o histórico recente
  if (metricsHistory.length > MAX_HISTORY_SIZE) {
    metricsHistory.splice(0, metricsHistory.length - MAX_HISTORY_SIZE)
  }
}

function getMetricsByTimeframe(timeframe: string): PerformanceMetrics[] {
  const now = Date.now()
  let cutoffTime: number

  switch (timeframe) {
    case '5m':
      cutoffTime = now - 5 * 60 * 1000
      break
    case '15m':
      cutoffTime = now - 15 * 60 * 1000
      break
    case '1h':
      cutoffTime = now - 60 * 60 * 1000
      break
    case '6h':
      cutoffTime = now - 6 * 60 * 60 * 1000
      break
    case '24h':
      cutoffTime = now - 24 * 60 * 60 * 1000
      break
    default:
      cutoffTime = now - 60 * 60 * 1000
  }

  return metricsHistory.filter(m => m.timestamp >= cutoffTime)
}

function checkPerformanceAlerts() {
  const metrics = getCurrentMetrics()
  const alerts = []

  // Alerta de alta taxa de erro
  const errorRate = metrics.voiceSearchRequests > 0 ? (metrics.voiceSearchErrors / metrics.voiceSearchRequests) * 100 : 0
  if (errorRate > 10) {
    alerts.push({
      type: 'HIGH_ERROR_RATE',
      message: `Taxa de erro muito alta: ${errorRate.toFixed(2)}%`,
      severity: 'CRITICAL'
    })
  }

  // Alerta de tempo de resposta alto
  if (metrics.averageResponseTime > 3000) {
    alerts.push({
      type: 'SLOW_RESPONSE',
      message: `Tempo médio de resposta alto: ${metrics.averageResponseTime.toFixed(0)}ms`,
      severity: 'WARNING'
    })
  }

  // Alerta de uso de memória
  if (metrics.memoryUsage > 80) {
    alerts.push({
      type: 'HIGH_MEMORY',
      message: `Uso de memória alto: ${metrics.memoryUsage.toFixed(1)}%`,
      severity: 'WARNING'
    })
  }

  // Alerta de rate limit
  if (metrics.rateLimitViolations > 100) {
    alerts.push({
      type: 'RATE_LIMIT',
      message: `Muitas violações de rate limit: ${metrics.rateLimitViolations}`,
      severity: 'WARNING'
    })
  }

  return alerts
}

function performHealthCheck() {
  const metrics = getCurrentMetrics()
  const alerts = checkPerformanceAlerts()
  
  const health = {
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    metrics,
    alerts,
    checks: {
      voiceSearch: {
        status: metrics.voiceSearchRequests > 0 ? 'ACTIVE' : 'IDLE',
        errorRate: metrics.voiceSearchRequests > 0 ? (metrics.voiceSearchErrors / metrics.voiceSearchRequests) * 100 : 0,
        averageResponseTime: metrics.averageResponseTime
      },
      memory: {
        status: metrics.memoryUsage < 80 ? 'OK' : 'WARNING',
        usage: metrics.memoryUsage
      },
      rateLimit: {
        status: metrics.rateLimitViolations < 50 ? 'OK' : 'WARNING',
        violations: metrics.rateLimitViolations
      }
    }
  }

  // Determinar status geral
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL')
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING')

  if (criticalAlerts.length > 0) {
    health.status = 'CRITICAL'
  } else if (warningAlerts.length > 0) {
    health.status = 'WARNING'
  }

  return health
}

function getActiveUsers(): number {
  // Simulação - em produção viria do sistema de controle de usuários
  return Math.floor(Math.random() * 1000) + 500
}

function getMemoryUsage(): number {
  // Simulação - em produção usaria process.memoryUsage()
  return Math.random() * 50 + 20 // 20-70%
}

function getCacheHitRate(): number {
  // Simulação - em produção viria do cache real
  return Math.random() * 30 + 70 // 70-100%
}
