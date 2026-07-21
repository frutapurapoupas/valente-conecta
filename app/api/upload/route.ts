import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Arquivo não é uma imagem' }, { status: 400 });
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Imagem muito grande (max 2MB)' }, { status: 400 });
    }

    // Gerar nome único
    const extension = file.type.split('/')[1];
    const safeName = name?.replace(/[^a-zA-Z0-9]/g, '-') || 'produto';
    const fileName = `${Date.now()}-${safeName}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'produtos');
    const filePath = path.join(uploadDir, fileName);
    const publicUrl = `/uploads/produtos/${fileName}`;

    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Imagem enviada com sucesso'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar imagem' }, { status: 500 });
  }
}

