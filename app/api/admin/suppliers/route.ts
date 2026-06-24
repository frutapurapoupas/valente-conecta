import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server';



export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const ativo = searchParams.get('ativo');
  
  try {
    if (id) {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    
    let query = supabase.from('suppliers').select('*');
    
    if (ativo === 'true') {
      query = query.eq('ativo', true);
    }
    
    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao carregar fornecedores:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar fornecedores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        name: body.name,
        document: body.document,
        phone: body.phone,
        email: body.email,
        address: body.address,
        contact: body.contact,
        ativo: body.ativo !== undefined ? body.ativo : true,
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar fornecedor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const body = await request.json();
  
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        name: body.name,
        document: body.document,
        phone: body.phone,
        email: body.email,
        address: body.address,
        contact: body.contact,
        ativo: body.ativo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar fornecedor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
  }
  
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover fornecedor:', error);
    return NextResponse.json({ success: false, error: 'Erro ao remover fornecedor' }, { status: 500 });
  }
}



