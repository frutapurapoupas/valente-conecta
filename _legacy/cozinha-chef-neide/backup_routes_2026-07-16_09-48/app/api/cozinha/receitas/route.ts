import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'receitas.json');

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

// GET - Buscar receitas (com ou sem ID)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        const receitas = readData();
        
        // Se tiver ID, filtrar
        if (id) {
            const receita = receitas.find((r: any) => r.id === id);
            if (receita) {
                return NextResponse.json({ success: true, data: receita });
            } else {
                return NextResponse.json({ success: false, error: 'Receita nÃ£o encontrada' }, { status: 404 });
            }
        }
        
        // Se nÃ£o tiver ID, retornar todas
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
            return NextResponse.json({ success: false, error: 'Receita nÃ£o encontrada' }, { status: 404 });
        }
        
        receitas[index] = { ...receitas[index], ...body, updatedAt: new Date().toISOString() };
        writeData(receitas);
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

