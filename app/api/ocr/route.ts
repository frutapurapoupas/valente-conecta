import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload para Supabase Storage
    const fileName = `ocr-${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('store-images')
      .getPublicUrl(fileName)

    // Simular OCR (em produção, usar Google Vision API ou Tesseract.js)
    const extractedText = await simulateOCR(publicUrl)

    // Tentar extrair nome da loja do texto
    const storeName = extractStoreName(extractedText)

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      extractedText,
      suggestedName: storeName,
      confidence: storeName ? 0.85 : 0.3
    })

  } catch (error) {
    console.error('Erro no processamento OCR:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

// Simulação de OCR (substituir com serviço real)
async function simulateOCR(imageUrl: string): Promise<string> {
  // Em produção, integrar com Google Vision API ou Tesseract.js
  // Por ora, retornar texto simulado baseado em padrões de nomes de lojas
  
  const mockStoreNames = [
    "Mercearia do João",
    "Supermercado Popular",
    "Açougue Boa Carne",
    "Padaria Pão Quente",
    "Farmácia Saúde",
    "Loja de Conveniência",
    "Mercado Central",
    "Casa de Carnes",
    "Mini Mercado",
    "Variedades"
  ]
  
  // Simular extração de texto
  const randomName = mockStoreNames[Math.floor(Math.random() * mockStoreNames.length)]
  return `${randomName}\nEndereço: Rua Principal, 123\nTelefone: (75) 1234-5678`
}

// Extrair nome da loja do texto OCR
function extractStoreName(text: string): string | null {
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  // Procurar padrões de nomes de lojas
  const storePatterns = [
    /mercearia/i,
    /supermercado/i,
    /açougue/i,
    /padaria/i,
    /farmácia/i,
    /loja/i,
    /mercado/i,
    /casa/i,
    /variedades/i
  ]
  
  for (const line of lines) {
    // Verificar se a linha contém padrão de loja
    for (const pattern of storePatterns) {
      if (pattern.test(line)) {
        return line.trim()
      }
    }
    
    // Se for a primeira linha e tiver tamanho razoável, pode ser o nome
    if (lines.indexOf(line) === 0 && line.trim().length >= 3 && line.trim().length <= 50) {
      return line.trim()
    }
  }
  
  return null
}
