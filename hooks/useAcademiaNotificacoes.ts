'use client'

export interface PerfilAluno {
  nome: string
  objetivo: 'emagrecer' | 'hipertrofia' | 'condicionamento' | 'saude'
  pesoAtual: number
  pesoMeta: number
  freqSemanal: number   // vezes por semana desejadas
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  ultimoTreino?: string // ISO date
  academiaNome?: string
  academiaLat?: number | null
  academiaLng?: number | null
  diasSeguidos?: number
  treinosMes?: number
}

const PERFIL_KEY = 'academia_perfil_aluno'

export function salvarPerfil(perfil: PerfilAluno) {
  localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil))
}

export function carregarPerfil(): PerfilAluno | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(PERFIL_KEY)
  return raw ? JSON.parse(raw) : null
}

// ---------- Mensagens personalizadas por momento ----------

function primeiroNome(nome: string) {
  return nome.split(' ')[0]
}

function msgCheckIn(perfil: PerfilAluno): string {
  const n = primeiroNome(perfil.nome)
  const msgs: Record<PerfilAluno['objetivo'], string[]> = {
    emagrecer:       [`💪 Bora, ${n}! Cada queima conta para chegar aos ${perfil.pesoMeta} kg!`, `🔥 ${n}, hoje você queima mais um passo rumo à meta!`],
    hipertrofia:     [`💪 ${n}, foco na carga hoje — seu músculo vai agradecer!`, `🏋️ ${n}, hora de superar o último treino!`],
    condicionamento: [`⚡ ${n}, mais um treino para turbinar seu condicionamento!`, `🏃 ${n}, consistência é tudo — ótima escolha estar aqui!`],
    saude:           [`🌱 ${n}, cuidar da saúde é o melhor investimento!`, `💚 Ótimo, ${n}! Mais um dia de qualidade de vida!`],
  }
  const lista = msgs[perfil.objetivo]
  return lista[Math.floor(Math.random() * lista.length)]
}

function msgEmAndamento(perfil: PerfilAluno, minutos: number): string {
  const n = primeiroNome(perfil.nome)
  if (minutos === 30) {
    return `⏱️ ${n}, já são 30 minutos de treino! Continue firme!`
  }
  if (minutos === 45) {
    const extras: Record<PerfilAluno['objetivo'], string> = {
      emagrecer:       `🔥 45 min! O metabolismo está acelerado — continue!`,
      hipertrofia:     `💪 45 min de produção! Foco nas últimas séries, ${n}!`,
      condicionamento: `⚡ 45 min! Seu condicionamento está evoluindo!`,
      saude:           `💚 45 min de cuidado com você mesmo, ${n}!`,
    }
    return extras[perfil.objetivo]
  }
  if (minutos === 60) {
    return `🏆 ${n}, 1 hora de treino! Isso é dedicação de verdade!`
  }
  return `⏱️ ${n}, ${minutos} minutos de treino registrados!`
}

function msgCheckOut(perfil: PerfilAluno, minutos: number): string {
  const n = primeiroNome(perfil.nome)
  const base = `✅ Treino de ${minutos} min registrado, ${n}!`
  const extras: Record<PerfilAluno['objetivo'], string> = {
    emagrecer:       ` Você está mais perto dos ${perfil.pesoMeta} kg!`,
    hipertrofia:     ` Recuperação e alimentação agora são fundamentais!`,
    condicionamento: ` Seu condicionamento evolui a cada sessão!`,
    saude:           ` Sua saúde agradece! Nos vemos no próximo treino!`,
  }
  return base + extras[perfil.objetivo]
}

function msgLembrete(perfil: PerfilAluno, diasSemTreinar: number): string {
  const n = primeiroNome(perfil.nome)
  if (diasSemTreinar === 1) {
    return `👋 ${n}, que tal treinar hoje? Sua meta é ${perfil.freqSemanal}x por semana!`
  }
  if (diasSemTreinar === 2) {
    const obj: Record<PerfilAluno['objetivo'], string> = {
      emagrecer:       `Os ${perfil.pesoMeta} kg estão esperando por você!`,
      hipertrofia:     `Seus músculos estão esperando o próximo estímulo!`,
      condicionamento: `O condicionamento só vem com consistência!`,
      saude:           `Sua saúde precisa de você hoje!`,
    }
    return `⚡ ${n}, faz 2 dias... ${obj[perfil.objetivo]}`
  }
  return `🔔 ${n}, faz ${diasSemTreinar} dias sem treinar. Vamos retomar?`
}

function msgMeta(perfil: PerfilAluno): string | null {
  if (perfil.objetivo !== 'emagrecer' && perfil.objetivo !== 'hipertrofia') return null
  const n = primeiroNome(perfil.nome)
  const diff = Math.abs(perfil.pesoAtual - perfil.pesoMeta)
  if (diff <= 2) return `🏆 ${n}, você está a apenas ${diff} kg da meta! Incrível!`
  if (diff <= 5) return `💪 ${n}, só mais ${diff} kg para a meta! Continue!`
  return null
}

// ---------- Função principal de disparo ----------

function enviarNotificacao(titulo: string, body: string, tag = 'academia') {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return
  new Notification(titulo, {
    body,
    icon: '/icone.png',
    badge: '/icone.png',
    tag,
  })
}

export function notificarCheckIn(perfil: PerfilAluno) {
  enviarNotificacao('🏋️ Check-in registrado!', msgCheckIn(perfil), 'checkin')
  // Salva data do último treino
  salvarPerfil({ ...perfil, ultimoTreino: new Date().toISOString() })
}

export function notificarEmAndamento(perfil: PerfilAluno, minutos: number) {
  if (minutos % 30 === 0 && minutos > 0) {
    enviarNotificacao('⏱️ Em andamento', msgEmAndamento(perfil, minutos), 'andamento')
  }
}

export function notificarCheckOut(perfil: PerfilAluno, minutos: number) {
  enviarNotificacao('✅ Treino finalizado!', msgCheckOut(perfil, minutos), 'checkout')
  const metaMsg = msgMeta(perfil)
  if (metaMsg) {
    setTimeout(() => enviarNotificacao('🎯 Sua meta', metaMsg, 'meta'), 3000)
  }
}

export function notificarLembrete(perfil: PerfilAluno) {
  if (!perfil.ultimoTreino) return
  const dias = Math.floor((Date.now() - new Date(perfil.ultimoTreino).getTime()) / 86400000)
  if (dias >= 1) {
    enviarNotificacao('💬 Lembrete de treino', msgLembrete(perfil, dias), 'lembrete')
  }
}
