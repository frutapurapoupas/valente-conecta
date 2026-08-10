import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const recipeId = formData.get('recipeId') as string;

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'recipes');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Salvar arquivo
    const ext = file.name.split('.').pop();
    const fileName = `${recipeId}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL da imagem
    const imageUrl = `/uploads/recipes/${fileName}`;
    
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
}

