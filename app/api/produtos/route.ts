import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profissional } = await supabase
    .from('profissionais')
    .select('id')
    .eq('user_id', user?.id)
    .single()
  
  const { data, error } = await supabase
    .from('produtos')
    .insert({ ...body, profissional_id: profissional?.id })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}