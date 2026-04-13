import { supabase } from '@/lib/supabase'

export async function registrarMovimentacao({
  usuarioId,
  tipo,
  valor,
  descricao,
  data,
  campanhaId,
}: {
  usuarioId: string
  tipo: 'entrada' | 'saida' | 'resgate' | 'bonus'
  valor: number
  descricao?: string
  data: string
  campanhaId?: string
}) {
  const { error } = await supabase.from('movimentacoes').insert({
    usuarioId,
    tipo,
    valor,
    descricao,
    data,
    campanhaId,
  })
  if (error) throw error
  return true
}

export async function listarMovimentacoes(usuarioId: string) {
  const { data, error } = await supabase.from('movimentacoes').select('*').eq('usuarioId', usuarioId).order('data', { ascending: false })
  if (error) throw error
  return data
}

export async function totalPorPeriodo(usuarioId: string, inicio: string, fim: string) {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('tipo, valor')
    .eq('usuarioId', usuarioId)
    .gte('data', inicio)
    .lte('data', fim)
  if (error) throw error
  let totalEntrada = 0
  let totalSaida = 0
  data?.forEach((m: any) => {
    if (m.tipo === 'entrada' || m.tipo === 'bonus') totalEntrada += m.valor
    if (m.tipo === 'saida' || m.tipo === 'resgate') totalSaida += m.valor
  })
  return { totalEntrada, totalSaida }
}
