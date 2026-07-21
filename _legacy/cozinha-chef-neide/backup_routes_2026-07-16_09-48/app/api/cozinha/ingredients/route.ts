import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'ingredientes.json');

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

export async function GET() {
    try {
        const ingredients = readData();
        return NextResponse.json({ success: true, data: ingredients });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const ingredients = readData();
        const newIngredient = {
            id: Date.now().toString(),
            ...body,
            createdAt: new Date().toISOString()
        };
        ingredients.push(newIngredient);
        writeData(ingredients);
        return NextResponse.json({ success: true, data: newIngredient });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();
        const ingredients = readData();
        const index = ingredients.findIndex((i: any) => i.id === id);
        if (index === -1) {
            return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
        }
        ingredients[index] = { ...ingredients[index], ...body, updatedAt: new Date().toISOString() };
        writeData(ingredients);
        return NextResponse.json({ success: true, data: ingredients[index] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ingredients = readData();
        const filtered = ingredients.filter((i: any) => i.id !== id);
        writeData(filtered);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

