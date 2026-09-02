// Caminho: C:\valente_conecta\lib\termosDocumentoComprobatorio.ts
//
// Texto da declaracao de veracidade que o lojista confirma ao enviar o
// documento comprobatorio de que e' dono/responsavel pela loja (ver
// 094_validacao_proprietario_loja.sql). Diferente de lib/politicaConteudo.ts
// (aceite versionado, cacheado no usuario), esse texto e' reafirmado a
// CADA envio de documento -- por isso nao tem numero de versao aqui, so' o
// texto exibido no componente ValidacaoProprietarioLoja.

export const TERMOS_DOCUMENTO_TITULO = "Declaração de veracidade do documento";

export const TERMOS_DOCUMENTO_TEXTO = `Antes de enviar, leia com atenção:

O documento que você está enviando serve pra comprovar que você é o dono ou responsável legal por essa loja/negócio no Valente Conecta. Só depois que ele for aprovado você poderá dar de acordo aos produtos que clientes cadastrarem dizendo que compraram na sua loja.

Ao marcar a caixa abaixo e enviar, você declara que:

• O documento enviado é verdadeiro e pertence a você ou ao negócio que está cadastrando;
• Você é, de fato, dono ou responsável legal por esse negócio;
• Está ciente de que apresentar documento falso ou declaração falsa configura falsidade ideológica (art. 299 do Código Penal), sujeita a consequências legais;
• Sabe que o Valente Conecta pode suspender ou banir sua conta e colaborar com as autoridades caso identifique qualquer fraude.`;
