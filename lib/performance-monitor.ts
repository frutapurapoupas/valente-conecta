// lib/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: any[] = []
  
  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  startMonitoring() {
    if (typeof window === 'undefined') return
    
    // Monitorar Core Web Vitals
    this.measureWebVitals()
    
    // Monitorar tempo de carregamento
    this.measureLoadTime()
    
    // Monitorar recursos lentos
    this.measureSlowResources()
    
    // Monitorar erros
    this.monitorErrors()
  }
  
  private measureWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.reportMetric('LCP', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach(entry => {
        this.reportMetric('FID', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          this.reportMetric('CLS', entry.value)
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  private measureLoadTime() {
    if (document.readyState === 'complete') {
      const loadTime = performance.now()
      this.reportMetric('PageLoad', loadTime)
    } else {
      window.addEventListener('load', () => {
        const loadTime = performance.now()
        this.reportMetric('PageLoad', loadTime)
      })
    }
  }
  
  private measureSlowResources() {
    if (typeof PerformanceObserver === 'undefined') return
    
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.duration > 1000) { // Recursos que demoram mais de 1s
          this.reportMetric('SlowResource', {
            name: entry.name,
            duration: entry.duration,
            type: entry.initiatorType
          })
        }
      })
    }).observe({ entryTypes: ['resource'] })
  }
  
  private monitorErrors() {
    window.addEventListener('error', (event) => {
      this.reportMetric('JavaScriptError', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
  }
  
  private reportMetric(name: string, value: any) {
    console.log(`[Performance] ${name}:`, value)
    
    // Enviar para analytics se disponível
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore
      gtag('event', 'performance', {
        'event_category': name,
        'value': typeof value === 'number' ? Math.round(value) : value
      })
    }
    
    this.metrics.push({ name, value, timestamp: Date.now() })
  }
  
  getMetrics() {
    return this.metrics
  }
}

// Iniciar monitoramento
if (typeof window !== 'undefined') {
  PerformanceMonitor.getInstance().startMonitoring()
}