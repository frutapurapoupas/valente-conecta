import { NextResponse } from 'next/server';

export async function GET() {
  // Buscar do banco de dados
  const fornecedores = [
    { id: '1', nome: 'Supermercado Bom PreÃ§o', contato: 'JoÃ£o', telefone: '(11) 99999-9999', email: 'contato@bompreco.com', categoria: 'Alimentos' },
    { id: '2', nome: 'Distribuidora Frango Forte', contato: 'Maria', telefone: '(11) 88888-8888', email: 'vendas@frangoforte.com', categoria: 'Carnes' },
    { id: '3', nome: 'Hortifruti Frescor', contato: 'Pedro', telefone: '(11) 77777-7777', email: 'pedro@hortifruti.com', categoria: 'Legumes' },
  ];
  
  return NextResponse.json({ success: true, data: fornecedores });
}

