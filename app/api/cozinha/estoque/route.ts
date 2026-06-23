import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Dados do estoque importados do arquivo data/estoque.json
let estoqueData = [
  {
    "id": "1",
    "nome": "Embalagem plástica",
    "categoria": "Embalagens",
    "preco_unitario": 0.50,
    "unidade": "un",
    "quantidade": 0,
    "quantidade_minima": 10,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "nome": "Farinha",
    "categoria": "Secos/Mercearia",
    "preco_unitario": 5.50,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "3",
    "nome": "Açúcar",
    "categoria": "Secos/Mercearia",
    "preco_unitario": 4.80,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "4",
    "nome": "Leite",
    "categoria": "Laticínios",
    "preco_unitario": 6.20,
    "unidade": "L",
    "quantidade": 0,
    "quantidade_minima": 10,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "5",
    "nome": "Chocolate em pó",
    "categoria": "Secos/Mercearia",
    "preco_unitario": 8.50,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 500,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "6",
    "nome": "Chocolate granulado",
    "categoria": "Secos/Mercearia",
    "preco_unitario": 5.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 500,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "7",
    "nome": "Leite condensado",
    "categoria": "Laticínios",
    "preco_unitario": 7.90,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 395,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "8",
    "nome": "Leite de coco",
    "categoria": "Laticínios",
    "preco_unitario": 4.00,
    "unidade": "ml",
    "quantidade": 0,
    "quantidade_minima": 400,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "9",
    "nome": "Creme de leite",
    "categoria": "Laticínios",
    "preco_unitario": 3.50,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 200,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "10",
    "nome": "Baunilha",
    "categoria": "Laticínios",
    "preco_unitario": 5.00,
    "unidade": "ml",
    "quantidade": 0,
    "quantidade_minima": 10,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "11",
    "nome": "Margarina",
    "categoria": "Outros",
    "preco_unitario": 6.50,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 500,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "12",
    "nome": "Requeijão",
    "categoria": "Laticínios",
    "preco_unitario": 7.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 200,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "13",
    "nome": "Ovos",
    "categoria": "Proteínas",
    "preco_unitario": 12.00,
    "unidade": "dz",
    "quantidade": 0,
    "quantidade_minima": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "14",
    "nome": "Peito de frango",
    "categoria": "Carnes",
    "preco_unitario": 22.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "15",
    "nome": "Carne bovina",
    "categoria": "Carnes",
    "preco_unitario": 38.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "16",
    "nome": "Carne moída",
    "categoria": "Carnes",
    "preco_unitario": 35.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "17",
    "nome": "Arroz branco",
    "categoria": "Secos/Mercearia",
    "preco_unitario": 6.50,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "18",
    "nome": "Batata",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 6.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "19",
    "nome": "Batata do reino",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 6.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "20",
    "nome": "Cenoura",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 5.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "21",
    "nome": "Abóbora",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 4.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "22",
    "nome": "Chuchu",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 2.00,
    "unidade": "un",
    "quantidade": 0,
    "quantidade_minima": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "23",
    "nome": "Banana",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 5.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "24",
    "nome": "Abacaxi",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 6.00,
    "unidade": "un",
    "quantidade": 0,
    "quantidade_minima": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "25",
    "nome": "Limão",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 4.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "26",
    "nome": "Aimpim",
    "categoria": "Frutas/Verduras",
    "preco_unitario": 5.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 3,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "27",
    "nome": "Creme de milho",
    "categoria": "Outros",
    "preco_unitario": 4.50,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 200,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "28",
    "nome": "Ketchup",
    "categoria": "Outros",
    "preco_unitario": 4.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 300,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "29",
    "nome": "Alho",
    "categoria": "Temperos",
    "preco_unitario": 4.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 100,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "30",
    "nome": "Cebola",
    "categoria": "Temperos",
    "preco_unitario": 5.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "31",
    "nome": "Coentro",
    "categoria": "Temperos",
    "preco_unitario": 2.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 50,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "32",
    "nome": "Cebolinha",
    "categoria": "Temperos",
    "preco_unitario": 2.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 50,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "33",
    "nome": "Salsa",
    "categoria": "Temperos",
    "preco_unitario": 2.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 50,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "34",
    "nome": "Sal",
    "categoria": "Temperos",
    "preco_unitario": 3.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "35",
    "nome": "Chocolate cobertura",
    "categoria": "Outros",
    "preco_unitario": 8.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 500,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "36",
    "nome": "Coco ralado",
    "categoria": "Outros",
    "preco_unitario": 5.00,
    "unidade": "g",
    "quantidade": 0,
    "quantidade_minima": 200,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "37",
    "nome": "Frango desfiado",
    "categoria": "Carnes",
    "preco_unitario": 25.00,
    "unidade": "kg",
    "quantidade": 0,
    "quantidade_minima": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
];

const filePath = 'C:\\valente_conecta\\data\\estoque.json';

function salvarDados() {
  try {
    fs.writeFileSync(filePath, JSON.stringify(estoqueData, null, 2), 'utf8');
    console.log('Dados salvos no arquivo');
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
}

export async function GET() {
  try {
    console.log('Retornando dados do estoque');
    console.log('Número de itens:', estoqueData.length);
    
    return NextResponse.json({ success: true, data: estoqueData });
  } catch (error) {
    console.error('Erro ao ler estoque:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newItem = {
      id: Date.now().toString(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    estoqueData.push(newItem);
    salvarDados();
    
    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID não informado' 
      }, { status: 400 });
    }
    
    const index = estoqueData.findIndex((item: any) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item não encontrado' 
      }, { status: 404 });
    }
    
    estoqueData[index] = {
      ...estoqueData[index],
      ...body,
      updated_at: new Date().toISOString()
    };
    
    salvarDados();
    
    return NextResponse.json({ success: true, data: estoqueData[index] });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID não informado' 
      }, { status: 400 });
    }
    
    const index = estoqueData.findIndex((item: any) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item não encontrado' 
      }, { status: 404 });
    }
    
    estoqueData.splice(index, 1);
    
    salvarDados();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}