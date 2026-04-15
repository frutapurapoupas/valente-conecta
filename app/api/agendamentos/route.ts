import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data')
  const profissionalId = searchParams.get('profissional_id')
  
  let query = supabase
    .from('sales')
    .select(`
      *,
      profissional:listings!sales_profissional_id_fkey(id, name, category, whatsapp)
    `)
    .eq('tipo', 'agendamento')
  
  if (data) {
    query = query.eq('data_agendamento', data)
  }
  
  if (profissionalId) {
    query = query.eq('profissional_id', profissionalId)
  }
  
  const { data: agendamentos, error } = await query.order('horario_agendamento', { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(agendamentos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const items = [
    {
      product_id: body.servico_id,
      name: body.servico_nome,
      quantity: 1,
      unit_price: body.valor,
      total: body.valor,
      type: 'servico'
    }
  ]
  
  const { data, error } = await supabase
    .from('sales')
    .insert({
      items: items,
      total: body.valor,
      tipo: 'agendamento',
      data_agendamento: body.data,
      horario_agendamento: body.horario,
      status_agendamento: 'PENDENTE',
      profissional_id: body.profissional_id,
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone,
      posicao_fila: body.posicao_fila,
      observacao: body.observacao,
      date: new Date()
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}