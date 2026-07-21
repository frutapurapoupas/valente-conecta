// lib/catalogo/skuGenerator.ts

import { Categoria, Pergunta } from './types';

// ============================================================================
// GERADOR DE SKU BASEADO NO QUESTIONÃRIO
// ============================================================================

export function gerarSKU(
  categoria: Categoria,
  respostas: Record<string, any>
): string {
  // 1. Pegar prefixo da categoria (3-4 letras)
  const prefixoCategoria = categoria.nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .substring(0, 3)
    .toUpperCase();

  // 2. Construir cÃ³digo com base nas respostas
  let codigo = prefixoCategoria;

  // Pegar as perguntas da categoria na ordem correta
  const perguntasOrdenadas = [...categoria.perguntas]
    .sort((a, b) => a.ordem - b.ordem)
    .filter(p => p.obrigatorio);

  for (const pergunta of perguntasOrdenadas) {
    const resposta = respostas[pergunta.id];
    if (!resposta) continue;

    // Converter resposta para cÃ³digo
    let codigoResposta = '';
    
    switch (pergunta.tipo) {
      case 'select':
        // Pegar as primeiras letras da opÃ§Ã£o selecionada
        const opcao = pergunta.opcoes?.find(o => o === resposta);
        if (opcao) {
          codigoResposta = opcao
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .substring(0, 3)
            .toUpperCase();
        }
        break;
      
      case 'texto':
        // Pegar as primeiras letras ou abreviaÃ§Ã£o
        codigoResposta = resposta
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .substring(0, 4)
          .toUpperCase();
        break;
      
      case 'numero':
        // Formatar nÃºmero com zeros Ã  esquerda
        codigoResposta = String(resposta).padStart(2, '0');
        break;
      
      case 'cor':
        codigoResposta = resposta.substring(0, 2).toUpperCase();
        break;
      
      case 'medida':
        // Formatar medida (ex: 20A -> 20A)
        codigoResposta = String(resposta)
          .replace(/[^A-Za-z0-9]/g, '')
          .toUpperCase();
        break;
      
      default:
        codigoResposta = String(resposta).substring(0, 3).toUpperCase();
    }

    codigo += `-${codigoResposta}`;
  }

  // 3. Gerar nÃºmero sequencial (3 dÃ­gitos)
  const sequencial = String(Math.floor(Math.random() * 900) + 100);
  codigo += `-${sequencial}`;

  return codigo;
}

// ============================================================================
// VALIDADOR DE SKU
// ============================================================================

export function validarSKU(sku: string): boolean {
  // Formato: XXX-XXX-XXX-XXX-XXX
  const regex = /^[A-Z0-9]{2,4}(-[A-Z0-9]{2,4}){2,5}$/;
  return regex.test(sku);
}

// ============================================================================
// FORMATADOR DE SKU PARA EXIBIÃ‡ÃƒO
// ============================================================================

export function formatarSKU(sku: string): string {
  // Adicionar espaÃ§os para melhor legibilidade
  return sku.replace(/-/g, ' Â· ');
}

// ============================================================================
// GERAR SKU AMIGÃVEL (para humanos)
// ============================================================================

export function gerarSKUAmigavel(sku: string): string {
  // Converter para formato mais legÃ­vel
  return sku
    .replace(/-/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

