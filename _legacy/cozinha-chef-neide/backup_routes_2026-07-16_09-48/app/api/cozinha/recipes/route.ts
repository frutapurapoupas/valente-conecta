import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'receitas.json');
const cardapioPath = path.join(process.cwd(), 'data', 'cardapio.json');

function readData() {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeData(data: any) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function readCardapio() {
    try {
        const data = fs.readFileSync(cardapioPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeCardapio(data: any) {
    fs.writeFileSync(cardapioPath, JSON.stringify(data, null, 2));
}

// GET - Buscar receitas (com ou sem ID)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        const receitas = readData();
        
        // Se tiver ID, filtrar e retornar UMA receita
        if (id) {
            const receita = receitas.find((r: any) => r.id === id);
            if (receita) {
                return NextResponse.json({ success: true, data: receita });
            } else {
                return NextResponse.json({ success: false, error: 'Receita não encontrada' }, { status: 404 });
            }
        }
        
        // Se não tiver ID, retornar todas
        return NextResponse.json({ success: true, data: receitas });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST - Criar nova receita
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const receitas = readData();
        const newReceita = {
            id: Date.now().toString(),
            ...body,
            createdAt: new Date().toISOString()
        };
        receitas.push(newReceita);
        writeData(receitas);
        return NextResponse.json({ success: true, data: newReceita });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Atualizar receita
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();
        const receitas = readData();
        const index = receitas.findIndex((r: any) => r.id === id);
        
        if (index === -1) {
            return NextResponse.json({ success: false, error: 'Receita não encontrada' }, { status: 404 });
        }
        
        const receitaAnterior = receitas[index];
        receitas[index] = { ...receitas[index], ...body, updatedAt: new Date().toISOString() };
        writeData(receitas);

        // Sincroniza cardápio para refletir preço editado em itens que usam preço da receita.
        const cardapio = readCardapio();
        const cardapioAtualizado = cardapio.map((item: any) => {
            if (item.receitaId !== id) return item;

            const usaPrecoDaReceita = item.usarPrecoDaReceita !== false;
            if (!usaPrecoDaReceita) return item;

            return {
                ...item,
                precoCustomizado: body.price ?? receitas[index].price ?? receitaAnterior.price,
                usarPrecoDaReceita: true,
                updatedAt: new Date().toISOString()
            };
        });
        writeCardapio(cardapioAtualizado);

        return NextResponse.json({ success: true, data: receitas[index] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Remover receita
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const receitas = readData();
        const filtered = receitas.filter((r: any) => r.id !== id);
        writeData(filtered);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

