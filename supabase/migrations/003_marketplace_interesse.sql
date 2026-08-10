// Caminho sugerido no projeto: C:\valente_conecta\utils\comprimirImagem.ts
//
// Requer a dependência: npm install browser-image-compression
//
// Funil obrigatório de compressão — toda imagem enviada pelo usuário deve
// passar por esta função antes do upload. Gera duas versões: a principal
// (exibição em tela cheia) e a thumbnail (listagem/busca), ambas em WebP.

import imageCompression from 'browser-image-compression';

export type ImagemComprimida = {
  arquivoPrincipal: File;
  arquivoThumb: File;
  tamanhoOriginalKB: number;
  tamanhoFinalKB: number;
};

const OPCOES_PRINCIPAL = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 0.5,          // ~500KB de teto de segurança
  fileType: 'image/webp' as const,
  useWebWorker: true,
  initialQuality: 0.8,
};

const OPCOES_THUMB = {
  maxWidthOrHeight: 400,
  maxSizeMB: 0.1,           // ~100KB
  fileType: 'image/webp' as const,
  useWebWorker: true,
  initialQuality: 0.75,
};

/**
 * Comprime uma imagem selecionada pelo usuário, gerando a versão principal
 * e a thumbnail. Lança erro se o arquivo não for uma imagem válida.
 */
export async function comprimirImagem(arquivoOriginal: File): Promise<ImagemComprimida> {
  if (!arquivoOriginal.type.startsWith('image/')) {
    throw new Error('Arquivo selecionado não é uma imagem.');
  }

  const tamanhoOriginalKB = arquivoOriginal.size / 1024;

  const [arquivoPrincipal, arquivoThumb] = await Promise.all([
    imageCompression(arquivoOriginal, OPCOES_PRINCIPAL),
    imageCompression(arquivoOriginal, OPCOES_THUMB),
  ]);

  const tamanhoFinalKB = arquivoPrincipal.size / 1024;

  return {
    arquivoPrincipal,
    arquivoThumb,
    tamanhoOriginalKB,
    tamanhoFinalKB,
  };
}

/**
 * Hook de validação para uso no botão de envio: garante que nenhum arquivo
 * bruto seja enviado sem passar pelo funil de compressão.
 * Uso: chamar comprimirImagem() no onChange do <input type="file">,
 * guardar o resultado em estado, e só habilitar "Salvar" quando existir.
 */
export function validarAntesDoEnvio(resultado: ImagemComprimida | null): void {
  if (!resultado) {
    throw new Error('A imagem precisa ser processada pelo funil de compressão antes do envio.');
  }
}