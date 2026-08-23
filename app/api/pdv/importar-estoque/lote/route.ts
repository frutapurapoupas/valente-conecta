// Caminho: C:\valente_conecta\app\api\pdv\importar-estoque\lote\route.ts
//
// Processa um lote (~25 linhas) de uma importação de planilha de estoque
// pelo lojista. Publica direto em catalogo_itens — nunca deixa uma linha
// travar as outras: erro numa linha vira status "erro" nela mesma, o resto
// do lote segue normalmente (ver plano em
// C:\Users\Usuario\.claude\plans\parallel-jumping-dragon.md).
//
// Ordem de resolução de foto por linha: catálogo colaborativo interno por
// EAN → API Kodebar (se KODEBAR_API_KEY estiver setada e a cota diária
// permitir) → placeholder fixo, marcando metadata.foto_ficticia=true pro
// lojista saber que precisa atualizar depois.

import { NextRequest, NextResponse } from 'next/server';
import { criarItem } from '@/lib/catalogo/catalogoService';
import { buscarFotoPorEan } from '@/lib/pdv/kodebarService';
import { TAMANHO_LOTE, type PayloadLote, type ResultadoLinha } from '@/lib/pdv/importacaoEstoqueTypes';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const PLACEHOLDER_URL = '/placeholders/produto-sem-foto.svg';

export async function POST(request: NextRequest) {
  try {
    const body: PayloadLote = await request.json();
    const donoId = String(body.donoId || '').trim();
    const modulo = String(body.modulo || '').trim();
    const linhas = Array.isArray(body.linhas) ? body.linhas.slice(0, TAMANHO_LOTE) : [];

    if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    if (!modulo) return NextResponse.json({ success: false, error: 'modulo é obrigatório' }, { status: 400 });
    if (!linhas.length) return NextResponse.json({ success: false, error: 'nenhuma linha para processar' }, { status: 400 });

    const resultados: ResultadoLinha[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      try {
        const nome = String(linha.nome || '').trim();
        const preco = Number(linha.preco);
        if (!nome) throw new Error('Nome não informado');
        if (!Number.isFinite(preco) || preco < 0) throw new Error('Preço inválido');

        const ean = linha.ean ? String(linha.ean).trim() : '';
        const fotoEncontrada = ean ? await buscarFotoPorEan(ean) : null;

        const fotoUrl = fotoEncontrada?.url || PLACEHOLDER_URL;
        const fotoFicticia = !fotoEncontrada;

        const item = await criarItem({
          dono_id: donoId,
          modulo,
          categoria: linha.categoria?.trim() || 'geral',
          titulo: nome,
          descricao_publica: null,
          preco,
          midia: [{ tipo: 'imagem', url: fotoUrl, thumb_url: fotoUrl, ordem: 0 }],
          latitude: null,
          longitude: null,
          metadata: {
            foto_ficticia: fotoFicticia,
            foto_origem: fotoEncontrada?.origem || 'placeholder',
            importado_via: 'planilha',
            ...(linha.quantidade !== undefined ? { quantidade_importada: linha.quantidade } : {}),
            ...(ean ? { ean } : {}),
          },
        });

        resultados.push({
          linha_index: i,
          status: 'publicado',
          item_id: item.id,
          foto_origem: fotoEncontrada?.origem || 'placeholder',
          foto_ficticia: fotoFicticia,
        });
      } catch (erroLinha: any) {
        resultados.push({ linha_index: i, status: 'erro', erro: erroLinha?.message || 'Erro ao publicar linha' });
      }
    }

    return NextResponse.json({ success: true, resultados });
  } catch (error: any) {
    console.error('Erro ao processar lote de importação:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar lote' }, { status: 500 });
  }
}
