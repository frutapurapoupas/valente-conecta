// Utilitário para salvar e recuperar locais de esporte do usuário
export interface EsporteLocal {
  nome: string
  esporte: string
  vezesSemana: number
  horasPrevistas: number
  lat: number
  lng: number
}

const STORAGE_KEY = 'academia_esportes_locais'

export function salvarEsporteLocal(local: EsporteLocal) {
  let lista: EsporteLocal[] = []
  try {
    lista = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {}
  // Se já existe local próximo, substitui
  const idx = lista.findIndex(l => Math.abs(l.lat - local.lat) < 0.0002 && Math.abs(l.lng - local.lng) < 0.0002)
  if (idx >= 0) lista[idx] = local
  else lista.push(local)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
}

export function listarEsportesLocais(): EsporteLocal[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function buscarEsporteLocalProximo(lat: number, lng: number): EsporteLocal | undefined {
  const lista = listarEsportesLocais()
  return lista.find(l => Math.abs(l.lat - lat) < 0.0002 && Math.abs(l.lng - lng) < 0.0002)
}
